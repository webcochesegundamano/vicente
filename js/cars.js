/**
 * CARS LISTING & FILTERING LOGIC
 */

let allCars = [];
const filters = {
    search: '',
    brand: '',
    maxPrice: 30000,
    transmission: '',
    showSold: false,
    sortBy: 'price-asc'
};

document.addEventListener('DOMContentLoaded', async () => {
    await fetchInventory();
    initFilters();
    renderFilteredCars();
});

// Fetch data
async function fetchInventory() {
    try {
        const response = await fetch('data/inventory.json');
        const data = await response.json();
        allCars = data.cars;
        
        // Populate brand dropdown
        const brands = [...new Set(allCars.map(c => c.brand))].sort();
        const brandSelect = document.getElementById('brand-filter');
        if (brandSelect) {
            brands.forEach(brand => {
                const opt = document.createElement('option');
                opt.value = brand;
                opt.textContent = brand;
                brandSelect.appendChild(opt);
            });
        }
    } catch (error) {
        console.error('Error fetching inventory:', error);
    }
}

// Attach event listeners
function initFilters() {
    const searchInput = document.getElementById('search-input');
    const brandSelect = document.getElementById('brand-filter');
    const priceRange = document.getElementById('price-range');
    const priceVal = document.getElementById('price-val');
    const sortSelect = document.getElementById('sort-order');
    const resetBtn = document.getElementById('reset-filters');

    if (searchInput) searchInput.addEventListener('input', (e) => {
        filters.search = e.target.value.toLowerCase();
        renderFilteredCars();
    });

    if (brandSelect) brandSelect.addEventListener('change', (e) => {
        filters.brand = e.target.value;
        renderFilteredCars();
    });

    if (priceRange) priceRange.addEventListener('input', (e) => {
        filters.maxPrice = parseInt(e.target.value);
        priceVal.textContent = new Intl.NumberFormat('es-ES').format(filters.maxPrice) + '€';
        renderFilteredCars();
    });

    if (sortSelect) sortSelect.addEventListener('change', (e) => {
        filters.sortBy = e.target.value;
        renderFilteredCars();
    });

    if (resetBtn) resetBtn.addEventListener('click', () => {
        filters.search = '';
        filters.brand = '';
        filters.maxPrice = 30000;
        filters.transmission = '';
        filters.showSold = false;
        
        if (searchInput) searchInput.value = '';
        if (brandSelect) brandSelect.value = '';
        if (priceRange) {
            priceRange.value = 30000;
            priceVal.textContent = '30.000€';
        }
        
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.val === '');
        });

        const showSoldCheck = document.getElementById('show-sold');
        if (showSoldCheck) showSoldCheck.checked = false;

        renderFilteredCars();
    });

    // Handle chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const type = chip.dataset.type;
            const val = chip.dataset.val;

            // Remove active from peers
            document.querySelectorAll(`.filter-chip[data-type="${type}"]`).forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            filters[type] = val;
            renderFilteredCars();
        });
    });

    // Show sold toggle
    const showSoldCheck = document.getElementById('show-sold');
    if (showSoldCheck) {
        showSoldCheck.addEventListener('change', (e) => {
            filters.showSold = e.target.checked;
            renderFilteredCars();
        });
    }
}

// Core filtering engine
function renderFilteredCars() {
    const grid = document.getElementById('cars-grid');
    const countDisplay = document.getElementById('results-count');
    if (!grid) return;

    let filtered = allCars.filter(car => {
        if (!filters.showSold && car.sold) return false;
        const matchesSearch = car.brand.toLowerCase().includes(filters.search) || 
                              car.model.toLowerCase().includes(filters.search);
        const matchesBrand = filters.brand === '' || car.brand === filters.brand;
        const matchesPrice = car.price <= filters.maxPrice;
        const matchesTransmission = filters.transmission === '' || car.transmission.includes(filters.transmission);

        return matchesSearch && matchesBrand && matchesPrice && matchesTransmission;
    });

    // Sort
    filtered.sort((a, b) => {
        switch (filters.sortBy) {
            case 'price-asc': return a.price - b.price;
            case 'price-desc': return b.price - a.price;
            case 'year-desc': return b.year - a.year;
            case 'km-asc': return a.km - b.km;
            default: return 0;
        }
    });

    // Render
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="text-center py-lg" style="grid-column: 1/-1;">No se encontraron coches con estos filtros.</div>';
    } else {
        const active = filtered.filter(c => !c.sold);
        const sold = filtered.filter(c => c.sold);
        let html = '';
        if (active.length > 0) {
            html += active.map(car => createCarCardHTML(car)).join('');
        }
        if (sold.length > 0) {
            html += `<div style="grid-column: 1/-1; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--glass-border);">
                        <h3 style="margin-bottom: 1.5rem;">Vendidos <span class="text-accent">recientemente</span></h3>
                        <div class="cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
                            ${sold.map(car => createCarCardHTML(car)).join('')}
                        </div>
                    </div>`;
        }
        grid.innerHTML = html;
        lucide.createIcons();
    }

    if (countDisplay) {
        countDisplay.textContent = `Mostrando ${filtered.length} coches`;
    }
}
