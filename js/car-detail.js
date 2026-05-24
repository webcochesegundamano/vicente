/**
 * CAR DETAIL PAGE LOGIC
 */

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');

    if (!carId) {
        window.location.href = 'inventario.html';
        return;
    }

    await loadCarDetail(carId);
});

async function loadCarDetail(id) {
    const container = document.getElementById('car-detail-container');
    if (!container) return;

    try {
        const response = await fetch('data/inventory.json');
        const data = await response.json();
        const car = data.cars.find(c => c.id === id);

        if (!car) {
            container.innerHTML = `
                <div class="text-center py-xl">
                    <h2 class="text-danger">Vehículo no encontrado</h2>
                    <p>Parece que este vehículo ya no está disponible en nuestro inventario.</p>
                    <a href="inventario.html" class="btn btn-primary" style="margin-top: 2rem;">Volver al Inventario</a>
                </div>
            `;
            return;
        }

        // Update WhatsApp link message
        const whatsappBtn = document.getElementById('whatsapp-detail');
        if (whatsappBtn) {
            whatsappBtn.href = `https://wa.me/34653309133?text=Hola,%20estoy%20interesado%20en%20el%20${encodeURIComponent(car.brand + ' ' + car.model)}%20de%20Autos%20Sanchez%20Guerrero.`;
        }

        renderCarDetail(car, data.cars);
        lucide.createIcons();
    } catch (error) {
        console.error('Error loading car detail:', error);
        container.innerHTML = '<div class="text-center py-xl">Error al cargar la información del vehículo.</div>';
    }
}

function renderCarDetail(car, allCars) {
    const container = document.getElementById('car-detail-container');
    const formattedPrice = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(car.price);
    const formattedKm = new Intl.NumberFormat('es-ES').format(car.km);

    // Filter similar cars (same brand or price range, excluding sold)
    const similar = allCars
        .filter(c => c.id !== car.id && !c.sold && (c.brand === car.brand || Math.abs(c.price - car.price) < 2000))
        .slice(0, 3);

    container.innerHTML = `
        <!-- Breadcrumb -->
        <nav style="margin-bottom: 2rem; font-size: 0.9rem;">
            <a href="index.html" class="text-muted">Inicio</a> / <a href="inventario.html" class="text-muted">Inventario</a> / <span class="text-accent">${car.brand}</span>
        </nav>

        <div class="grid grid-cols-12 gap-lg" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem;">
            
            <!-- Gallery (Left) -->
            <div class="car-detail-main">
                <div class="main-img-container glass" style="margin-bottom: 1rem; overflow: hidden; position: relative;">
                    ${car.sold ? '<span class="badge-sold" style="top: 2rem; right: 2rem; padding: 0.5rem 1.5rem; font-size: 1rem;">VENDIDO</span>' : ''}
                    <img src="${car.imageUrl}" alt="${car.brand} ${car.model}" style="width: 100%; border-radius: var(--br-md);">
                </div>
                
                <!-- Comentado: Coches Relacionados (pendiente de rediseñar posicion)
                <h3 style="margin-top: 3rem; margin-bottom: 1.5rem;">Coches <span class="text-accent">Relacionados</span></h3>
                <div class="cards-grid">
                    ${similar.map(c => createCarCardHTML(c)).join('')}
                </div>
                -->
            </div>

            <!-- Sidebar Info (Right) -->
            <div class="car-detail-sidebar">
                <div class="glass" style="padding: 2.5rem; border-color: rgba(255,255,255,0.05); position: sticky; top: 120px;">
                    <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">${car.brand} <span class="text-accent">${car.model}</span></h1>
                    <p class="text-muted" style="font-size: 1.1rem; margin-bottom: 1.5rem;">Año: ${car.year} | ${car.fuel} | ${car.transmission}</p>
                    
                    <div style="font-size: 2rem; font-weight: 700; color: var(--accent-secondary); margin-bottom: 2rem;">${formattedPrice}</div>
                    
                    <div class="detail-specs-list" style="margin-bottom: 3rem;">
                        <div style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                            <span class="text-muted">Kilómetraje</span>
                            <span>${formattedKm} km</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                            <span class="text-muted">Combustible</span>
                            <span>${car.fuel}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                            <span class="text-muted">Cambio</span>
                            <span>${car.transmission}</span>
                        </div>
                    </div>

                    <h4 style="margin-bottom: 1rem;">Equipamiento <span class="text-accent">Destacado</span></h4>
                    <ul style="display: grid; grid-template-columns: 1fr; gap: 0.5rem; margin-bottom: 3rem; font-size: 0.9rem;">
                        ${car.features.map(f => `<li class="flex items-center gap-sm"><i data-lucide="check" style="width:16px; color: var(--success)"></i> ${f}</li>`).join('')}
                    </ul>

                    <div class="actions" style="display: flex; flex-direction: column; gap: 1rem;">
                        <a href="https://wa.me/34653309133?text=Hola,%20estoy%20interesado%20en%20el%20${encodeURIComponent(car.brand + ' ' + car.model)}" class="btn btn-whatsapp" style="width: 100%;">
                            <i data-lucide="message-circle"></i> Me interesa por WhatsApp
                        </a>
                        <a href="contacto.html?car=${car.id}" class="btn btn-primary" style="width: 100%;">Solicitar Prueba</a>
                        <a href="${car.adUrl}" target="_blank" class="btn btn-wallapop" style="width: 100%;">
                            Ver anuncio en Wallapop <i data-lucide="external-link" style="width:14px"></i>
                        </a>
                    </div>
                </div>
            </div>
            
        </div>
    `;
}
