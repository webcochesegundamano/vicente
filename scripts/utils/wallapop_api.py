import requests
import time
import urllib.parse
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent

API_HEADERS = {
    "X-DeviceOS": "0",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Origin": "https://es.wallapop.com",
    "Referer": "https://es.wallapop.com/",
}

SEARCH_HEADERS = {
    **API_HEADERS,
    "Accept": "application/json, text/plain, */*",
}


def _get_session():
    session = requests.Session()
    session.headers.update(API_HEADERS)
    session.get("https://es.wallapop.com/", timeout=10)
    return session


def _get_search_id(session, keywords="", category_id=100):
    params = {
        "keywords": keywords,
        "category_id": category_id,
        "source": "search_box",
    }
    resp = session.get(
        "https://api.wallapop.com/api/v3/search/components",
        headers=SEARCH_HEADERS,
        params=params,
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()

    search_id = data.get("search_id")
    if not search_id:
        for component in data.get("components", []):
            if component.get("type") == "search_results":
                search_id = (
                    component.get("type_data", {})
                    .get("query_params", {})
                    .get("search_id")
                )
                break

    if not search_id:
        raise Exception(f"No search_id found for keywords='{keywords}'")

    return search_id


def _search_section(session, search_id, keywords="", category_id=100, next_page=None, latitude=None, longitude=None):
    params = {
        "keywords": keywords,
        "category_id": category_id,
        "search_id": search_id,
        "section_type": "organic_search_results",
        "source": "deep_link",
    }
    if latitude and longitude:
        params["order_by"] = "closest"
        params["latitude"] = latitude
        params["longitude"] = longitude
    if next_page:
        params["next_page"] = next_page

    resp = session.get(
        "https://api.wallapop.com/api/v3/search/section",
        headers=SEARCH_HEADERS,
        params=params,
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


def search_cars(keywords="", max_pages=100, delay=0.5):
    session = _get_session()

    try:
        search_id = _get_search_id(session, keywords)
    except Exception as e:
        print(f"  Error obteniendo search_id para '{keywords}': {e}")
        return []

    all_items = []
    next_page = None

    for page in range(max_pages):
        try:
            data = _search_section(
                session, search_id, keywords, next_page=next_page
            )
        except Exception as e:
            print(f"  Error en página {page+1}: {e}")
            break

        section = data.get("data", {}).get("section", {})
        items = section.get("items", [])
        all_items.extend(items)

        meta = data.get("meta", {})
        next_page = meta.get("next_page")

        if not next_page:
            break

        if (page + 1) % 10 == 0:
            print(f"  Página {page+1}: {len(all_items)} items acumulados")

        time.sleep(delay)

    return all_items


def search_cars_all_spain(pages_per_city=5):
    session = _get_session()
    all_items = []
    seen_ids = set()

    # Major Spanish cities for wide geographic coverage
    locations = [
        (40.4168, -3.7038, "Madrid"),
        (41.3874, 2.1686, "Barcelona"),
        (37.3891, -5.9845, "Sevilla"),
        (39.4699, -0.3763, "Valencia"),
        (43.2630, -2.9350, "Bilbao"),
        (37.1773, -3.5986, "Granada"),
        (36.7213, -4.4214, "Malaga"),
        (38.3452, -0.4810, "Alicante"),
        (43.3619, -5.8494, "Oviedo"),
        (41.6523, -4.7245, "Valladolid"),
        (41.6563, -0.8765, "Zaragoza"),
        (39.8628, -4.0273, "Toledo"),
        (38.8794, -6.9706, "Badajoz"),
        (42.5987, -5.5671, "Leon"),
        (41.7667, -1.5000, "Zaragoza"),
        (37.9922, -1.1307, "Murcia"),
        (42.8782, -8.5448, "Santiago"),
        (36.8381, -2.4597, "Almeria"),
        (36.6850, -6.1261, "Jerez"),
        (41.1189, -1.2493, "Teruel"),
    ]

    # Search each city for cars
    print(f"  Buscando coches en {len(locations)} ciudades ({pages_per_city} paginas cada una)...")
    for lat, lon, city in locations:
        try:
            search_id = _get_search_id(session, "", category_id=100)
        except Exception as e:
            print(f"    {city}: error search_id - {e}")
            continue

        next_page = None
        city_items = 0
        for page in range(pages_per_city):
            try:
                data = _search_section(session, search_id, "", category_id=100,
                                       next_page=next_page, latitude=lat, longitude=lon)
            except Exception as e:
                break

            section = data.get("data", {}).get("section", {})
            items = section.get("items", [])

            new_count = 0
            for item in items:
                iid = item.get("id")
                if iid and iid not in seen_ids:
                    seen_ids.add(iid)
                    all_items.append(item)
                    new_count += 1
                    city_items += 1

            meta = data.get("meta", {})
            next_page = meta.get("next_page")
            if not next_page:
                break
            time.sleep(0.3)

        print(f"    {city:<12} -> {city_items} items nuevos")

    # Also search popular brands from Madrid for more coverage
    brands = ["audi", "bmw", "mercedes", "seat", "renault", "ford", "toyota"]
    print(f"  Buscando {len(brands)} marcas populares desde Madrid...")
    for brand in brands:
        try:
            search_id = _get_search_id(session, brand, category_id=100)
        except Exception as e:
            continue

        next_page = None
        for page in range(2):
            try:
                data = _search_section(session, search_id, brand, category_id=100,
                                       next_page=next_page, latitude=40.4168, longitude=-3.7038)
            except Exception as e:
                break

            section = data.get("data", {}).get("section", {})
            items = section.get("items", [])

            for item in items:
                iid = item.get("id")
                if iid and iid not in seen_ids:
                    seen_ids.add(iid)
                    all_items.append(item)

            meta = data.get("meta", {})
            next_page = meta.get("next_page")
            if not next_page:
                break
            time.sleep(0.3)

    print(f"  Total: {len(all_items)} items, {len([i for i in all_items if i.get('user_id')])} vendedores unicos")
    return all_items


def get_user_profile(user_id):
    resp = requests.get(
        f"https://api.wallapop.com/api/v3/users/{user_id}",
        headers=API_HEADERS,
        timeout=15,
    )
    if resp.status_code == 404:
        return None
    if resp.status_code == 403:
        return None
    resp.raise_for_status()
    return resp.json()


def is_professional(profile):
    if not profile:
        return False
    utype = profile.get("type", "")
    if utype == "professional":
        return True
    seller = profile.get("seller_type", {})
    if isinstance(seller, dict) and seller.get("type"):
        return True
    return False


def get_user_reviews(user_id, max_pages=10, delay=0.5):
    all_reviews = []
    url = f"https://api.wallapop.com/api/v3/users/{user_id}/reviews"
    params = {"limit": 40}

    for page in range(max_pages):
        try:
            resp = requests.get(url, headers=API_HEADERS, params=params, timeout=15)
        except Exception as e:
            break
        if resp.status_code == 404:
            return []
        if resp.status_code != 200:
            break

        data = resp.json()
        if isinstance(data, list):
            all_reviews.extend(data)
            if len(data) < 40:
                break
        else:
            all_reviews.extend(data if isinstance(data, list) else [])
            break

        next_page = None
        if isinstance(data, dict):
            next_page = data.get("meta", {}).get("next_page")
        if next_page:
            params = {"next_page": next_page}
            time.sleep(delay)
        else:
            break

    return all_reviews


def get_user_items(user_id, max_pages=15, delay=0.3):
    session = _get_session()
    all_items = []
    url = f"https://api.wallapop.com/api/v3/users/{user_id}/items"

    params = None

    for page in range(max_pages):
        try:
            resp = session.get(url, headers=API_HEADERS, params=params, timeout=15)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"    Error obteniendo items de {user_id} (pag {page+1}): {e}")
            break

        items = data.get("data", [])
        all_items.extend(items)

        meta = data.get("meta", {}) or {}
        next_token = meta.get("next") or meta.get("next_page")
        if next_token:
            params = {"next": next_token}
            time.sleep(delay)
        else:
            break

    return all_items
