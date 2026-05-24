#!/usr/bin/env python3
"""
Autos Sanchez Guerrero - Wallapop Reviews Fetcher

Extrae las valoraciones del perfil de Wallapop via API
y genera data/reviews.json para mostrarlas en la web.

Uso: python3 scripts/fetch-reviews.py
"""

import requests
import json
import time
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
OUTPUT_PATH = BASE_DIR / "data" / "reviews.json"

# Config from config.json (falls back to defaults)
CONFIG_PATH = BASE_DIR / "config.json"
config = {}
if CONFIG_PATH.exists():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)

WALLAPOP_USER_ID = config.get("wallapop_user_id", "pj9yr70yvk6e")

API_HEADERS = {
    "X-DeviceOS": "0",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Origin": "https://es.wallapop.com",
    "Referer": "https://es.wallapop.com/",
}


def fetch_reviews():
    """Obtiene todas las valoraciones del usuario via API."""
    url = f"https://api.wallapop.com/api/v3/users/{WALLAPOP_USER_ID}/reviews"
    resp = requests.get(url, headers=API_HEADERS, timeout=15)
    resp.raise_for_status()
    return resp.json()


def transform_reviews(raw_reviews):
    """Convierte las reviews de Wallapop a nuestro formato limpio."""
    reviews = []
    rating_distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    total_score = 0
    count = 0

    for entry in raw_reviews:
        if entry.get("type") != "sell":
            continue

        review = entry["review"]
        user = entry.get("user", {})
        item = entry.get("item", {})

        rating = review.get("rating_over_five", 5)
        total_score += rating
        count += 1
        rating_distribution[rating] = rating_distribution.get(rating, 0) + 1

        web_link = item.get("web_link", "")
        wallapop_url = f"https://es.wallapop.com/item/{web_link}" if web_link else ""

        reviews.append({
            "userName": user.get("micro_name", "Anónimo"),
            "rating": rating,
            "date": review.get("published", ""),
            "comment": review.get("comments", "").strip(),
            "carTitle": item.get("title", ""),
            "wallapopUrl": wallapop_url,
            "userAvatar": user.get("image", {}).get("xsmall", ""),
            "carImage": item.get("image", {}).get("small", ""),
        })

    average = round(total_score / count, 1) if count > 0 else 0

    return {
        "summary": {
            "total": count,
            "average": average,
            "distribution": rating_distribution,
        },
        "reviews": reviews,
    }


def main():
    print("=" * 60)
    print("AUTOS SANCHEZ GUERRERO - Reviews Fetcher")
    print("=" * 60)
    print()

    print("Obteniendo valoraciones desde Wallapop...")
    raw = fetch_reviews()
    print(f"  Reviews obtenidas: {len(raw)}")

    data = transform_reviews(raw)
    summary = data["summary"]
    print(f"  Reviews de venta:  {summary['total']}")
    print(f"  Media:             {summary['average']}/5")
    print(f"  Distribución:      {summary['distribution']}")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\nFichero generado: {OUTPUT_PATH}")
    print("Proceso completado.")


if __name__ == "__main__":
    main()
