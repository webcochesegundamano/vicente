/**
 * SEO & SCHEMA.ORG INJECTOR
 */

document.addEventListener('DOMContentLoaded', () => {
    injectLocalBusinessSchema();
    handlePageSpecificSEO();
});

// Global Local Business Schema (AutoDealer)
function injectLocalBusinessSchema() {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    
    const schema = {
        "@context": "https://schema.org",
        "@type": "AutoDealer",
        "name": "VICENTE (.",
        "alternateName": "VICENTE (.",
        "description": "Compraventa de vehículos de segunda mano en 28001 Madrid. CIF A00000000. Comercio al por menor de vehículos de motor.",
        "url": "https://webcochesegundamano.github.io/vicente//",
        "telephone": "+34653309133",
        "email": "vicente@gmail.com",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Valencia, 1",
            "addressLocality": "Madrid",
            "addressRegion": "Madrid",
            "postalCode": "28001",
            "addressCountry": "ES"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 39.4699,
            "longitude": -0.3763
        },
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                "opens": "09:00",
                "closes": "19:00"
            }
        ]
    };

    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
}

// Page specific meta-data and search engine optimization
async function handlePageSpecificSEO() {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');

    if (carId && window.location.pathname.includes('coche.html')) {
        try {
            const response = await fetch('data/inventory.json');
            const data = await response.json();
            const car = data.cars.find(c => c.id === carId);

            if (car) {
                // Update title and meta description
                document.title = `${car.brand} ${car.model} (${car.year}) | VICENTE (. Madrid`;
                
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) {
                    metaDesc.setAttribute('content', `Comprar ${car.brand} ${car.model} de segunda mano en 28001 Madrid. Solo ${car.km} km, combustible ${car.fuel}, transmisión ${car.transmission}. Revisado y garantizado.`);
                }

                // Inject Vehicle Schema
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                const vehicleSchema = {
                    "@context": "https://schema.org",
                    "@type": "Car",
                    "name": `${car.brand} ${car.model}`,
                    "image": car.imageUrl,
                    "modelDate": car.year,
                    "vehicleModelDate": car.year,
                    "mileageFromOdometer": {
                        "@type": "QuantitativeValue",
                        "value": car.km,
                        "unitCode": "KMT"
                    },
                    "fuelType": car.fuel,
                    "vehicleTransmission": car.transmission,
                    "price": car.price,
                    "priceCurrency": "EUR",
                    "url": window.location.href,
                    "brand": {
                        "@type": "Brand",
                        "name": car.brand
                    },
                    "offers": {
                        "@type": "Offer",
                        "price": car.price,
                        "priceCurrency": "EUR",
                        "availability": car.sold ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
                        "url": window.location.href
                    }
                };
                script.text = JSON.stringify(vehicleSchema);
                document.head.appendChild(script);
            }
        } catch (e) {
            console.error("SEO enhancement error:", e);
        }
    }
}
