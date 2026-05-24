#!/usr/bin/env python3
"""
Autos Sanchez Guerrero - Wallapop Image Downloader & Inventory Generator

Extrae todos los coches del perfil de Wallapop via API,
descarga las imagenes y genera data/inventory.json

Uso: python3 scripts/download-images.py
"""

import requests
import json
import os
import re
import time
from pathlib import Path
from PIL import Image
from io import BytesIO

# Config from config.json (falls back to defaults)
BASE_DIR = Path(__file__).parent.parent
CONFIG_PATH = BASE_DIR / "config.json"
config = {}
if CONFIG_PATH.exists():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)

WALLAPOP_USER_ID = config.get("wallapop_user_id", "pj9yr70yvk6e")
BASE_URL = config.get("site", {}).get("domain", "https://brochetateam.github.io/autossanchezguerrero")
IMG_DIR = BASE_DIR / "img" / "cars"
INVENTORY_PATH = BASE_DIR / "data" / "inventory.json"
SITEMAP_PATH = BASE_DIR / "sitemap.xml"

API_HEADERS = {
    "Host": "api.wallapop.com",
    "X-DeviceOS": "0",
    "Origin": "https://es.wallapop.com",
    "Referer": "https://es.wallapop.com/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "es-ES,es;q=0.9",
}

# Mapeo de atributos de Wallapop a nuestro formato
FUEL_MAP = {
    "gasoline": "Gasolina",
    "gasoil": "Diesel",
    "diesel": "Diesel",
    "electric": "Electrico",
    "hybrid": "Hibrido",
    "lpg": "GLP",
    "gas": "GLP",
}

TRANSMISSION_MAP = {
    "manual": "Manual",
    "automatic": "Automatico",
    "semiautomatic": "Semiatomatico",
}

BODY_TYPE_MAP = {
    "sedan": "Berlina",
    "suv": "SUV",
    "hatchback": "Compacto",
    "convertible_car": "Descapotable",
    "small_car": "Compacto",
    "station_wagon": "Familiar",
    "van": "Furgoneta",
    "coupe": "Coupe",
    "minivan": "Monovolumen",
}


def generate_id(title, item_id):
    """Genera un ID unico a partir del titulo."""
    slug = (
        title.lower()
        .replace("a", "a").replace("e", "e").replace("i", "i")
        .replace("o", "o").replace("u", "u")
    )
    slug = re.sub(r"[^a-z0-9\s]", "", slug)
    slug = re.sub(r"\s+", "-", slug).strip("-")
    slug = slug[:50]
    return f"{slug}-{item_id[:6]}"


def download_image(url, output_path, session):
    """Descarga una imagen y la guarda como WebP."""
    try:
        # Use session with cookies from wallapop.com
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "Accept-Language": "es-ES,es;q=0.9",
            "Referer": "https://es.wallapop.com/",
            "Sec-Fetch-Dest": "image",
            "Sec-Fetch-Mode": "no-cors",
        }
        resp = session.get(url, headers=headers, timeout=30, allow_redirects=True)
        resp.raise_for_status()
        
        if len(resp.content) < 1000:
            print(f"  Imagen demasiado pequena, intentando sin W1024...")
            url_fallback = url.replace("W1024", "W800")
            resp = session.get(url_fallback, headers=headers, timeout=30)
            resp.raise_for_status()
        
        img = Image.open(BytesIO(resp.content))
        img.save(output_path, "WEBP", quality=85)
        return True
    except Exception as e:
        print(f"  Error descargando {url}: {e}")
        return False


def get_all_items():
    """Obtiene todos los items del vendedor via API."""
    all_items = []
    url = f"https://api.wallapop.com/api/v3/users/{WALLAPOP_USER_ID}/items"
    params = {"limit": 40}
    
    print("Obteniendo listado de coches desde Wallapop...")
    
    while url:
        resp = requests.get(url, headers=API_HEADERS, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        items = data.get("data", [])
        all_items.extend(items)
        print(f"  Obtenidos {len(items)} coches (total acumulado: {len(all_items)})")
        
        # Paginacion
        meta = data.get("meta", {})
        next_page = meta.get("next_page")
        if next_page:
            url = f"https://api.wallapop.com/api/v3/users/{WALLAPOP_USER_ID}/items"
            params = {"next_page": next_page}
            time.sleep(1)
        else:
            break
    
    # Filtrar solo coches (category_id = 100)
    cars = [item for item in all_items if str(item.get("category_id")) == "100"]
    print(f"\nTotal de coches encontrados: {len(cars)}")
    return cars


def convert_item_to_car(item):
    """Convierte un item de Wallapop al formato de inventory.json."""
    attrs = item.get("type_attributes", {})
    title = item.get("title", "")
    item_id = item.get("id", "")
    
    # Extraer datos de attributes
    brand = attrs.get("brand", {}).get("text", "Otro")
    model = attrs.get("model", {}).get("text", "")
    version = attrs.get("version", {}).get("text", "")
    year = int(attrs.get("year", {}).get("value", 2000))
    km = int(attrs.get("km", {}).get("value", 0))
    
    engine_raw = attrs.get("engine", {}).get("value", "gasoline")
    fuel = FUEL_MAP.get(engine_raw, "Gasolina")
    
    gear_raw = attrs.get("gear_box", {}).get("value", "manual")
    transmission = TRANSMISSION_MAP.get(gear_raw, "Manual")
    
    hp = attrs.get("horse_power", {}).get("text", "")
    eco = attrs.get("eco_label", {}).get("text", "")
    body = attrs.get("body_type", {}).get("text", "")
    color = attrs.get("color", {}).get("text", "")
    doors = attrs.get("doors", {}).get("text", "")
    
    # Construir modelo completo
    full_model = f"{model} {version}".strip() if version else model
    
    # Generar features
    features = []
    if eco:
        features.append(f"Etiqueta {eco.replace(' Badge', '')}")
    if body:
        features.append(f"Carroceria: {body}")
    if hp:
        features.append(f"Potencia: {hp}")
    if color:
        features.append(f"Color: {color}")
    if doors:
        features.append(f"Puertas: {doors}")
    if km > 0:
        features.append("Kilometraje certificado")
    features.append("Revisado y listo para transferir")
    
    # Precio
    price_data = item.get("price", {})
    price = int(price_data.get("amount", 0))
    
    # Generar ID
    car_id = generate_id(title, item_id)
    
    # URL del anuncio (usando el slug completo con nombre + ID numérico)
    slug = item.get("slug", item_id) if item.get("slug") else item_id
    ad_url = f"https://es.wallapop.com/item/{slug}"
    
    # Imagenes
    images = item.get("images", [])
    image_url_hd = ""
    if images:
        # Usar la URL big y cambiar a W1024 para maxima resolucion
        big_url = images[0].get("urls", {}).get("big", "")
        image_url_hd = big_url.replace("W800", "W1024")
    
    return {
        "id": car_id,
        "brand": brand,
        "model": full_model,
        "year": year,
        "price": price,
        "km": km,
        "fuel": fuel,
        "transmission": transmission,
        "features": features,
        "adUrl": ad_url,
        "imageUrl": f"img/cars/{car_id}.webp",
        "featured": False,
        "sold": False,
        "_wallapop_images": [img.get("urls", {}).get("big", "") for img in images],
        "_image_url_hd": image_url_hd,
    }


def download_car_images(cars):
    """Descarga las imagenes de todos los coches."""
    print("\nDescargando imagenes...")
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    
    # Crear sesion con cookies de wallapop
    print("  Obteniendo cookies de Wallapop...")
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })
    # Visitar la pagina principal para obtener cookies
    try:
        session.get("https://es.wallapop.com/", timeout=10)
        print("  Cookies obtenidas correctamente")
    except Exception as e:
        print(f"  Warning: No se pudieron obtener cookies: {e}")
    
    for i, car in enumerate(cars):
        car_id = car["id"]
        image_url = car["_image_url_hd"]
        output_path = IMG_DIR / f"{car_id}.webp"
        
        if output_path.exists():
            print(f"  [{i+1}/{len(cars)}] {car['brand']} {car['model']} - Ya existe")
            continue
        
        print(f"  [{i+1}/{len(cars)}] {car['brand']} {car['model']} - Descargando...")
        success = download_image(image_url, output_path, session)
        
        if success:
            print(f"    OK -> {output_path.name}")
        else:
            print(f"    FALLO")
        
        time.sleep(1.5)  # Delay para no sobrecargar


def generate_inventory(cars):
    """Genera el archivo inventory.json limpio."""
    # Limpiar campos internos
    clean_cars = []
    for car in cars:
        clean_car = {k: v for k, v in car.items() if not k.startswith("_")}
        clean_cars.append(clean_car)
    
    # Marcar primeros 3 como destacados
    for car in clean_cars[:3]:
        car["featured"] = True
    
    inventory = {"cars": clean_cars}
    
    with open(INVENTORY_PATH, "w", encoding="utf-8") as f:
        json.dump(inventory, f, indent=2, ensure_ascii=False)
    
    print(f"\nInventario generado: {INVENTORY_PATH}")
    print(f"Total de coches: {len(clean_cars)}")
    print(f"Destacados: {sum(1 for c in clean_cars if c['featured'])}")
    
    return clean_cars


def generate_sitemap(cars):
    """Genera el sitemap.xml actualizado."""
    base_url = BASE_URL
    
    urls = [
        ("index.html", "1.0"),
        ("inventario.html", "0.9"),
        ("sobre-nosotros.html", "0.7"),
        ("contacto.html", "0.8"),
    ]
    
    for car in cars:
        urls.append((f"coche.html?id={car['id']}", "0.8"))
    
    xml_lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    for loc, priority in urls:
        xml_lines.append(f"  <url><loc>{base_url}/{loc}</loc><priority>{priority}</priority></url>")
    
    xml_lines.append("</urlset>")
    
    with open(SITEMAP_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(xml_lines) + "\n")
    
    print(f"Sitemap generado: {SITEMAP_PATH}")


def print_summary(cars):
    """Imprime un resumen del inventario."""
    print("\n" + "=" * 60)
    print("RESUMEN DEL INVENTARIO")
    print("=" * 60)
    
    for i, car in enumerate(cars, 1):
        price_fmt = f"{car['price']:,}".replace(",", ".")
        km_fmt = f"{car['km']:,}".replace(",", ".")
        featured = " [DESTACADO]" if car["featured"] else ""
        print(f"  {i:2d}. {car['brand']} {car['model']} ({car['year']}) - {price_fmt} EUR - {km_fmt} km - {car['fuel']} - {car['transmission']}{featured}")
    
    print(f"\nTotal: {len(cars)} coches")
    
    # Estadisticas
    prices = [c["price"] for c in cars]
    years = [c["year"] for c in cars]
    brands = set(c["brand"] for c in cars)
    
    print(f"Precio minimo: {min(prices):,} EUR")
    print(f"Precio maximo: {max(prices):,} EUR")
    print(f"Precio medio: {sum(prices)/len(prices):,.0f} EUR")
    print(f"Marcas: {', '.join(sorted(brands))}")


def main():
    print("=" * 60)
    print("AUTOS SANCHEZ GUERRERO - Importador Wallapop")
    print("=" * 60)
    print()
    
    # Paso 1: Obtener items de la API
    items = get_all_items()
    
    if not items:
        print("ERROR: No se encontraron coches en el perfil de Wallapop.")
        return
    
    # Paso 2: Convertir al formato interno
    cars = [convert_item_to_car(item) for item in items]
    
    # Paso 3: Descargar imagenes
    download_car_images(cars)
    
    # Paso 4: Generar inventory.json
    clean_cars = generate_inventory(cars)
    
    # Paso 5: Generar sitemap.xml
    generate_sitemap(clean_cars)
    
    # Paso 6: Resumen
    print_summary(clean_cars)
    
    print("\n" + "=" * 60)
    print("PROCESO COMPLETADO")
    print("=" * 60)
    print("\nSiguientes pasos:")
    print("1. Revisa data/inventory.json y ajusta si es necesario")
    print("2. Haz commit y push a GitHub para actualizar la web")
    print("3. Ejecuta este script periodicamente para mantener el inventario actualizado")


if __name__ == "__main__":
    main()


