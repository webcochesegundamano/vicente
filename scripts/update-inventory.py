#!/usr/bin/env python3
"""
Autos Sanchez Guerrero - Full Inventory Updater

Obtiene coches activos + vendidos del perfil de Wallapop,
descarga imagenes, y genera data/inventory.json y sitemap.xml.

Uso: python3 scripts/update-inventory.py
"""

import requests
import json
import re
import time
from pathlib import Path
from PIL import Image
from io import BytesIO

BASE_DIR = Path(__file__).parent.parent
IMG_DIR = BASE_DIR / "img" / "cars"
INVENTORY_PATH = BASE_DIR / "data" / "inventory.json"
SITEMAP_PATH = BASE_DIR / "sitemap.xml"
SOLD_IDS_PATH = BASE_DIR / "data" / "sold_ids.txt"

# Config from config.json (falls back to defaults)
CONFIG_PATH = BASE_DIR / "config.json"
config = {}
if CONFIG_PATH.exists():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)

WALLAPOP_USER_ID = config.get("wallapop_user_id", "pj9yr70yvk6e")
BASE_URL = config.get("site", {}).get("domain", "https://brochetateam.github.io/autossanchezguerrero")

API_HEADERS = {
    "X-DeviceOS": "0",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Origin": "https://es.wallapop.com",
    "Referer": "https://es.wallapop.com/",
}

FUEL_MAP = {
    "gasoline": "Gasolina", "gasoil": "Diesel", "diesel": "Diesel",
    "electric": "Electrico", "hybrid": "Hibrido", "lpg": "GLP", "gas": "GLP",
}

TRANSMISSION_MAP = {
    "manual": "Manual", "automatic": "Automatico", "semiautomatic": "Semiatomatico",
}


def generate_id(title, item_id):
    slug = title.lower().replace("a", "a").replace("e", "e").replace("i", "i")
    slug = slug.replace("o", "o").replace("u", "u")
    slug = re.sub(r"[^a-z0-9\s]", "", slug)
    slug = re.sub(r"\s+", "-", slug).strip("-")[:50]
    return f"{slug}-{item_id[:6]}"


def download_image(url, output_path, session):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://es.wallapop.com/",
        }
        resp = session.get(url, headers=headers, timeout=30, allow_redirects=True)
        resp.raise_for_status()
        if len(resp.content) < 1000:
            return False
        img = Image.open(BytesIO(resp.content))
        img.save(output_path, "WEBP", quality=85)
        return True
    except Exception as e:
        print(f"  Error descargando {url}: {e}")
        return False


def fetch_active_items():
    all_items = []
    url = f"https://api.wallapop.com/api/v3/users/{WALLAPOP_USER_ID}/items"
    params = {"limit": 40}
    while url:
        resp = requests.get(url, headers=API_HEADERS, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        items = data.get("data", [])
        all_items.extend(items)
        meta = data.get("meta", {})
        next_page = meta.get("next_page")
        if next_page:
            params = {"next_page": next_page}
            time.sleep(0.5)
        else:
            break
    return [i for i in all_items if str(i.get("category_id")) == "100"]


def fetch_sold_item_ids():
    url = f"https://api.wallapop.com/api/v3/users/{WALLAPOP_USER_ID}/reviews"
    resp = requests.get(url, headers=API_HEADERS, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    seen = set()
    sold_ids = []
    for entry in data:
        if entry.get("type") != "sell":
            continue
        iid = entry.get("item", {}).get("id", "")
        if iid and iid not in seen:
            seen.add(iid)
            sold_ids.append(iid)
    return sold_ids


def fetch_sold_item(item_id, session):
    url = f"https://api.wallapop.com/api/v3/items/{item_id}"
    resp = session.get(url, headers=API_HEADERS, timeout=15)
    if resp.status_code == 404:
        print(f"  Item vendido {item_id} ya no disponible (404)")
        return None
    resp.raise_for_status()
    return resp.json()


def convert_to_car(item, session):
    attrs = item.get("type_attributes", {})
    title_raw = item.get("title", "")
    if isinstance(title_raw, dict):
        title = title_raw.get("original", "")
    else:
        title = str(title_raw) if title_raw else ""
    item_id = item.get("id", "")
    is_sold = item.get("sold", {}).get("flag", False)

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
    color = attrs.get("color", {}).get("text", "")
    doors = attrs.get("doors", {}).get("text", "")
    price_data = item.get("price", {})
    cash = price_data.get("cash", {}) if isinstance(price_data, dict) and "cash" in price_data else price_data
    price = int(cash.get("amount", 0)) if isinstance(cash, dict) else int(price_data.get("amount", 0))

    full_model = f"{model} {version}".strip() if version else model
    slug = item.get("slug", item_id) if item.get("slug") else item_id
    ad_url = f"https://es.wallapop.com/item/{slug}"
    car_id = generate_id(title, item_id)

    features = []
    if eco:
        features.append(f"Etiqueta {eco.replace(' Badge', '')}")
    if hp:
        features.append(f"Potencia: {hp}")
    if color:
        features.append(f"Color: {color}")
    if doors:
        features.append(f"Puertas: {doors}")
    if km > 0:
        features.append("Kilometraje certificado")
    features.append("Revisado y listo para transferir")

    images = item.get("images", [])
    image_url_hd = ""
    if images:
        big_url = images[0].get("urls", {}).get("big", "")
        image_url_hd = big_url.replace("W800", "W1024")

    # Download image for new cars
    image_filename = f"{car_id}.webp"
    image_path = IMG_DIR / image_filename
    if image_url_hd and not image_path.exists():
        print(f"  Descargando imagen para {brand} {full_model}...")
        download_image(image_url_hd, image_path, session)

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
        "imageUrl": f"img/cars/{image_filename}",
        "featured": False,
        "sold": is_sold,
    }


def generate_sitemap(cars):
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



def main():
    print("=" * 60)
    print("AUTOS SANCHEZ GUERRERO - Full Inventory Updater")
    print("=" * 60)
    print()

    # 1. Fetch active items
    print("Paso 1/4: Obteniendo coches activos...")
    active_raw = fetch_active_items()
    print(f"  {len(active_raw)} coches activos encontrados")

    # 2. Fetch sold item IDs from reviews
    print("\nPaso 2/4: Obteniendo IDs de coches vendidos desde reviews...")
    sold_ids = fetch_sold_item_ids()
    print(f"  {len(sold_ids)} IDs de coches vendidos encontrados")

    # Load previously processed sold IDs to avoid re-fetching
    processed = set()
    if SOLD_IDS_PATH.exists():
        processed = set(SOLD_IDS_PATH.read_text("utf-8").strip().splitlines())

    # Filter out already processed sold IDs and active item IDs
    active_ids = {i.get("id", "") for i in active_raw}
    new_sold_ids = [sid for sid in sold_ids if sid not in processed and sid not in active_ids]

    if new_sold_ids:
        print(f"\n  {len(new_sold_ids)} IDs nuevos (no procesados anteriormente)")
    else:
        print(f"  No hay IDs nuevos que procesar")

    # 3. Convert active items
    print("\nPaso 3/4: Procesando datos...")
    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0"})
    session.get("https://es.wallapop.com/", timeout=10)

    IMG_DIR.mkdir(parents=True, exist_ok=True)

    cars = []
    for i, item in enumerate(active_raw):
        car = convert_to_car(item, session)
        cars.append(car)
        if (i + 1) % 5 == 0:
            print(f"  Procesados {i+1}/{len(active_raw)} activos")

    # Mark first 3 as featured
    for car in cars[:3]:
        car["featured"] = True

    # 4. Fetch and convert sold items
    sold_added = 0
    for sid in new_sold_ids:
        print(f"  Obteniendo item vendido {sid}...")
        item = fetch_sold_item(sid, session)
        if item:
            car = convert_to_car(item, session)
            car["sold"] = True
            cars.append(car)
            sold_added += 1
            print(f"    -> {car['brand']} {car['model']} ({car['price']} EUR) [VENDIDO]")
        time.sleep(0.5)

    # Save processed IDs
    all_processed = processed | set(sold_ids)
    SOLD_IDS_PATH.parent.mkdir(parents=True, exist_ok=True)
    SOLD_IDS_PATH.write_text("\n".join(sorted(all_processed)), "utf-8")

    # 5. Write inventory.json
    inventory = {"cars": cars}
    with open(INVENTORY_PATH, "w", encoding="utf-8") as f:
        json.dump(inventory, f, indent=2, ensure_ascii=False)
    print(f"\nInventario generado: {INVENTORY_PATH}")
    print(f"  Activos:  {len(active_raw)}")
    print(f"  Vendidos: {sold_added}")
    print(f"  Total:    {len(cars)}")

    # 6. Generate sitemap
    generate_sitemap(cars)

    # 7. Summary
    print(f"\n=== RESUMEN ===")
    print(f"Precio mas alto activo: {max((c['price'] for c in cars if not c['sold']), default=0):,} EUR")
    print(f"Precio mas bajo activo:  {min((c['price'] for c in cars if not c['sold']), default=0):,} EUR")
    print(f"Total coches vendidos:   {sold_added}")
    print(f"Imagenes en carpeta:     {len(list(IMG_DIR.glob('*.webp')))}")
    print()
    print("Proceso completado.")


if __name__ == "__main__":
    main()
