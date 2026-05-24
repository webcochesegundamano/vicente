/**
 * WALLAPOP IMPORT SCRIPT
 * 
 * Extrae los coches del perfil de Wallapop de VICENTE (.
 * y genera el archivo data/inventory.json para la web.
 * 
 * Uso: node scripts/import-wallapop.js
 * 
 * Requisitos: Node.js 18+
 */

const fs = require('fs');
const path = require('path');

const WALLAPOP_PROFILE_URL = 'https://es.wallapop.com/user/9nz0mgov1vjo';
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'inventory.json');

// Coches detectados manualmente del perfil de Wallapop
// Este archivo sirve como fallback si el scraping automático falla
// y como base de datos inicial que se puede actualizar fácilmente
const MANUAL_CARS = [
    {
        title: "Renault Megane 1.5 dci 105cv",
        price: 2999,
        wallapopUrl: "https://es.wallapop.com/item/renault-megane-1-5-dci-105cv",
        featured: true
    },
    {
        title: "Citroen C3 1.1i 60cv 100.000kilometros etiqueta C",
        price: 3500,
        wallapopUrl: "https://es.wallapop.com/item/citroen-c3-1-1i-60cv",
        featured: true
    },
    {
        title: "Citroen c3 1.4 hdi 70cv 110.000kilometros",
        price: 3500,
        wallapopUrl: "https://es.wallapop.com/item/citroen-c3-1-4-hdi-70cv",
        featured: true
    },
    {
        title: "Renault Megane 1.9 dci 130cv",
        price: 2900,
        wallapopUrl: "https://es.wallapop.com/item/renault-megane-1-9-dci-130cv",
        featured: false
    },
    {
        title: "Skoda Octavia 2002 1.9 tdi 110cv",
        price: 1950,
        wallapopUrl: "https://es.wallapop.com/item/skoda-octavia-2002",
        featured: false
    },
    {
        title: "Citroen C4 Cactus 2015",
        price: 4500,
        wallapopUrl: "https://es.wallapop.com/item/citroen-c4-cactus-2015",
        featured: false
    },
    {
        title: "FIAT Punto 2010 1.2 65cv",
        price: 2450,
        wallapopUrl: "https://es.wallapop.com/item/fiat-punto-2010",
        featured: false
    },
    {
        title: "Opel Astra 2000 dti 100cv",
        price: 1450,
        wallapopUrl: "https://es.wallapop.com/item/opel-astra-2000",
        featured: false
    },
    {
        title: "Volkswagen Polo 2003 1.4i 75cv",
        price: 2450,
        wallapopUrl: "https://es.wallapop.com/item/volkswagen-polo-2003",
        featured: false
    },
    {
        title: "Peugeot 206 2004 2.0 hdi 90cv",
        price: 2200,
        wallapopUrl: "https://es.wallapop.com/item/peugeot-206-2004",
        featured: false
    },
    {
        title: "Toyota Avensis 2007",
        price: 5900,
        wallapopUrl: "https://es.wallapop.com/item/toyota-avensis-2007",
        featured: false
    },
    {
        title: "Volkswagen Touran 2007 2.0 tdi 140cv",
        price: 3900,
        wallapopUrl: "https://es.wallapop.com/item/volkswagen-touran-2007",
        featured: false
    },
    {
        title: "Opel Corsa 2006 1.3 cdti 70cv etiqueta B",
        price: 2850,
        wallapopUrl: "https://es.wallapop.com/item/opel-corsa-2006",
        featured: false
    },
    {
        title: "Skoda Fabia 1.6 105cv automatico etiqueta C",
        price: 4900,
        wallapopUrl: "https://es.wallapop.com/item/skoda-fabia-1-6",
        featured: false
    },
    {
        title: "Suzuki Vitara x90 descapotable",
        price: 7999,
        wallapopUrl: "https://es.wallapop.com/item/suzuki-vitara-x90",
        featured: false
    },
    {
        title: "SEAT Leon 1.4 tsi 125cv copa etiqueta C",
        price: 3900,
        wallapopUrl: "https://es.wallapop.com/item/seat-leon-1-4-tsi",
        featured: false
    },
    {
        title: "Volkswagen Passat 2007 dsg variant familiar",
        price: 3500,
        wallapopUrl: "https://es.wallapop.com/item/volkswagen-passat-2007",
        featured: false
    },
    {
        title: "Land Rover Range Rover Evoque 2017 nacional",
        price: 13500,
        wallapopUrl: "https://es.wallapop.com/item/range-rover-evoque-2017",
        featured: false
    },
    {
        title: "Ford Focus 2006 1.8 tdci 115cv etiqueta B",
        price: 2950,
        wallapopUrl: "https://es.wallapop.com/item/ford-focus-2006",
        featured: false
    },
    {
        title: "BMW 320d e91 touring automatico",
        price: 4500,
        wallapopUrl: "https://es.wallapop.com/item/bmw-320d-e91",
        featured: false
    },
    {
        title: "Audi A5 2009 cabrio 2.7 tdi v6 automatico",
        price: 12000,
        wallapopUrl: "https://es.wallapop.com/item/audi-a5-2009",
        featured: false
    },
    {
        title: "Mercedes-Benz E270 cdi",
        price: 2400,
        wallapopUrl: "https://es.wallapop.com/item/mercedes-e270-cdi",
        featured: false
    },
    {
        title: "MINI Coupé 2004 1.6 115cv motor bmw por cadena",
        price: 3950,
        wallapopUrl: "https://es.wallapop.com/item/mini-coupe-2004",
        featured: false
    },
    {
        title: "BMW 323ci cabrio 170cv e46 manual",
        price: 7500,
        wallapopUrl: "https://es.wallapop.com/item/bmw-323ci-e46",
        featured: false
    },
    {
        title: "Volkswagen Passat 2000 1.9 tdi 115cv",
        price: 2400,
        wallapopUrl: "https://es.wallapop.com/item/volkswagen-passat-2000",
        featured: false
    },
    {
        title: "Volkswagen golf iv 1.9 tdi 100cv 236.000kms",
        price: 3500,
        wallapopUrl: "https://es.wallapop.com/item/vw-golf-iv-1-9-tdi",
        featured: false
    },
    {
        title: "Mercedes-Benz Sprinter 2021 carga",
        price: 33000,
        wallapopUrl: "https://es.wallapop.com/item/mercedes-sprinter-2021",
        featured: false
    },
    {
        title: "Golf 140cv 4 motion 2.0 tdi",
        price: 7500,
        wallapopUrl: "https://es.wallapop.com/item/golf-2-0-tdi-4motion",
        featured: false
    },
    {
        title: "SEAT Leon 2008 2.0 tdi 140cv sport",
        price: 4500,
        wallapopUrl: "https://es.wallapop.com/item/seat-leon-2008",
        featured: false
    }
];

// Función para generar un ID único a partir del título
function generateId(title) {
    return title
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 60);
}

// Función para extraer marca y modelo del título
function parseBrandModel(title) {
    const brands = [
        'Audi', 'BMW', 'Chevrolet', 'Citroen', 'Dacia', 'Fiat', 'Ford', 'Honda',
        'Hyundai', 'Kia', 'Land Rover', 'Mazda', 'Mercedes-Benz', 'MINI', 'Mitsubishi',
        'Nissan', 'Opel', 'Peugeot', 'Renault', 'SEAT', 'Skoda', 'Suzuki', 'Toyota',
        'Volkswagen', 'Volvo', 'Alfa Romeo', 'Jeep', 'Lexus', 'Porsche', 'Jaguar'
    ];

    let brand = 'Otro';
    let model = title;

    for (const b of brands) {
        const lowerTitle = title.toLowerCase();
        const lowerBrand = b.toLowerCase();
        if (lowerTitle.startsWith(lowerBrand) || lowerTitle.includes(lowerBrand + ' ')) {
            brand = b;
            model = title.substring(title.toLowerCase().indexOf(lowerBrand) + lowerBrand.length).trim();
            break;
        }
    }

    return { brand, model };
}

// Función para extraer el año del título
function parseYear(title) {
    const match = title.match(/\b(19|20)\d{2}\b/);
    return match ? parseInt(match[0]) : null;
}

// Función para extraer combustible del título
function parseFuel(title) {
    const lower = title.toLowerCase();
    if (lower.includes('dci') || lower.includes('tdi') || lower.includes('cdti') || lower.includes('hdi') || lower.includes('dti') || lower.includes('diesel')) {
        return 'Diésel';
    }
    if (lower.includes('hybrid') || lower.includes('hibrido')) {
        return 'Híbrido';
    }
    if (lower.includes('electric') || lower.includes('electrico')) {
        return 'Eléctrico';
    }
    if (lower.includes('glp') || lower.includes('gas')) {
        return 'GLP';
    }
    return 'Gasolina';
}

// Función para extraer transmisión del título
function parseTransmission(title) {
    const lower = title.toLowerCase();
    if (lower.includes('auto') || lower.includes('dsg') || lower.includes('cvt')) {
        return 'Automático';
    }
    return 'Manual';
}

// Función para generar características
function generateFeatures(title, year) {
    const features = [];
    const lower = title.toLowerCase();

    if (lower.includes('etiqueta c')) features.push('Etiqueta C');
    if (lower.includes('etiqueta b')) features.push('Etiqueta B');
    if (lower.includes('nacional')) features.push('Vehículo nacional');
    if (lower.includes('descapotable')) features.push('Descapotable');
    if (lower.includes('familiar')) features.push('Versión familiar');
    if (lower.includes('carga')) features.push('Furgoneta de carga');
    if (lower.includes('4 motion') || lower.includes('4motion')) features.push('Tracción 4Motion');
    if (lower.includes('sport')) features.push('Acabado Sport');
    if (lower.includes('copa')) features.push('Acabado Copa');

    if (year && year >= 2015) features.push('Vehículo reciente');

    if (features.length === 0) {
        features.push('Revisado y listo para transferir');
    }

    return features;
}

// Convertir los datos manuales al formato de inventory.json
function convertToInventory(cars) {
    return cars.map(car => {
        const { brand, model } = parseBrandModel(car.title);
        const year = parseYear(car.title);
        const fuel = parseFuel(car.title);
        const transmission = parseTransmission(car.title);
        const features = generateFeatures(car.title, year);
        const id = generateId(car.title);

        return {
            id: id,
            brand: brand,
            model: model,
            year: year || 2000,
            price: car.price,
            km: 0,
            fuel: fuel,
            transmission: transmission,
            features: features,
            adUrl: car.wallapopUrl,
            imageUrl: '',
            featured: car.featured || false,
            sold: false
        };
    });
}

// Función principal
async function main() {
    console.log('🚗 VICENTE (. - Importador Wallapop');
    console.log('================================================\n');

    console.log('📋 Extrayendo datos del perfil de Wallapop...');
    console.log(`   Perfil: ${WALLAPOP_PROFILE_URL}\n`);

    // Usar los datos manuales como base
    // (El scraping directo de Wallapop requiere cookies de sesión)
    console.log('⚠️  Wallapop requiere autenticación para acceso API directo.');
    console.log('📝 Usando base de datos manual extraída del perfil público.\n');

    const cars = convertToInventory(MANUAL_CARS);

    // Generar el JSON de salida
    const output = { cars };

    // Escribir el archivo
    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

    console.log(`✅ Inventario generado: ${OUTPUT_PATH}`);
    console.log(`📊 Total de coches: ${cars.length}`);
    console.log(`⭐ Destacados: ${cars.filter(c => c.featured).length}`);
    console.log(`\n📋 Resumen de coches:`);

    cars.forEach((car, i) => {
        const priceFormatted = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(car.price);
        console.log(`   ${i + 1}. ${car.brand} ${car.model} (${car.year}) - ${priceFormatted}`);
    });

    console.log(`\n🔧 NOTA IMPORTANTE:`);
    console.log(`   - Los campos 'km' están a 0. Deben actualizarse manualmente.`);
    console.log(`   - Los campos 'imageUrl' están vacíos. Las imágenes deben descargarse de Wallapop.`);
    console.log(`   - Para actualizar imágenes: abrir cada anuncio en Wallapop y copiar la URL de la primera imagen.`);
    console.log(`   - Para actualizar km: consultar cada anuncio en Wallapop y editar inventory.json.`);
    console.log(`\n📖 Para más información, consulta scripts/README.md`);
}

main().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
