/**
 * GLOBAL APP LOGIC
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    initThemeToggle();
    loadFeaturedCars();
    loadPremiumHero();
    loadReviews();
    initScrollAnimations();
    initCounters();
    initParallax();
});

// Header scroll effect
function initHeaderScroll() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('.main-nav');
    if (toggle) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
    // Close menu when a nav link is clicked
    document.querySelectorAll('.main-nav .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
        });
    });
}

// Theme toggle (dark/light)
function initThemeToggle() {
    const desktopToggle = document.querySelector('.theme-toggle-desktop');
    const navToggle = document.getElementById('theme-toggle');
    const navIcon = navToggle?.querySelector('i');
    const navLabel = document.getElementById('theme-label');
    const desktopIcon = desktopToggle?.querySelector('i');
    const saved = localStorage.getItem('theme');

    const applyTheme = (isLight) => {
        if (isLight) {
            document.documentElement.setAttribute('data-theme', 'light');
            if (navIcon) navIcon.setAttribute('data-lucide', 'sun');
            if (desktopIcon) desktopIcon.setAttribute('data-lucide', 'sun');
            if (navLabel) navLabel.textContent = 'Modo Claro';
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (navIcon) navIcon.setAttribute('data-lucide', 'moon');
            if (desktopIcon) desktopIcon.setAttribute('data-lucide', 'moon');
            if (navLabel) navLabel.textContent = 'Modo Oscuro';
        }
        lucide.createIcons();
    };

    if (saved === 'light') {
        applyTheme(true);
    }

    const toggleHandler = () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        applyTheme(!isLight);
        localStorage.setItem('theme', !isLight ? 'light' : 'dark');
    };

    desktopToggle?.addEventListener('click', toggleHandler);
    navToggle?.addEventListener('click', toggleHandler);
}

// Load premium hero car (most expensive non-commercial vehicle)
async function loadPremiumHero() {
    const heroSection = document.getElementById('hero-premium');
    if (!heroSection) return;

    try {
        const response = await fetch('data/inventory.json');
        const data = await response.json();
        
        // Find the most expensive car (excluding commercial vans)
        const cars = data.cars.filter(c => !c.sold);
        const premiumCar = cars.reduce((max, car) => {
            const isCommercial = car.model.toLowerCase().includes('sprinter') || 
                                car.model.toLowerCase().includes('carga') ||
                                car.brand.toLowerCase().includes('sprinter');
            return (!isCommercial && car.price > max.price) ? car : max;
        }, cars[0]);

        if (!premiumCar) return;

        // Update hero content
        document.getElementById('hero-car-image').src = premiumCar.imageUrl;
        document.getElementById('hero-car-image').alt = `${premiumCar.brand} ${premiumCar.model}`;
        document.getElementById('hero-brand').textContent = premiumCar.brand;
        document.getElementById('hero-model').textContent = premiumCar.model;
        document.getElementById('hero-year').textContent = premiumCar.year;
        
        const formattedKm = new Intl.NumberFormat('es-ES').format(premiumCar.km);
        document.getElementById('hero-km').textContent = `${formattedKm} km`;
        document.getElementById('hero-fuel').textContent = premiumCar.fuel;
        document.getElementById('hero-transmission').textContent = premiumCar.transmission;
        
        document.getElementById('hero-car-link').href = `coche.html?id=${premiumCar.id}`;
        document.getElementById('hero-whatsapp').href = `https://wa.me/34653309133?text=Hola,%20estoy%20interesado%20en%20el%20${encodeURIComponent(premiumCar.brand + ' ' + premiumCar.model)}%20de%20Autos%20Sanchez%20Guerrero.`;

        // Calculate discount from ~15.000€
        const originalPrice = 15000;
        const savings = originalPrice - premiumCar.price;
        
        // Show original price (crossed out)
        const originalEl = document.getElementById('hero-price-original');
        const saveEl = document.getElementById('hero-save-badge');
        if (originalEl) {
            originalEl.textContent = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(originalPrice);
        }
        if (saveEl && savings > 0) {
            saveEl.textContent = `Ahorra 0 €`;
        }

        // Animate price DOWN and savings UP simultaneously
        const duration = 2800;
        animateCounter('hero-price-value', premiumCar.price, duration, originalPrice);
        if (saveEl && savings > 0) {
            animateCounter('hero-save-badge', savings, duration, 0, 'Ahorra ');
        }
        
    } catch (error) {
        console.error('Error loading premium hero:', error);
    }
}

// Animate counter from start to target (supports counting up or down)
function animateCounter(elementId, target, duration = 1500, start = 0, prefix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * eased);
        
        const formatted = new Intl.NumberFormat('es-ES').format(current);
        element.textContent = prefix ? `${prefix}${formatted} €` : formatted;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Parallax effect on hero background
function initParallax() {
    const heroBg = document.getElementById('hero-bg');
    if (!heroBg) return;

    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                const heroHeight = document.getElementById('hero-premium')?.offsetHeight || 700;
                
                if (scrolled < heroHeight) {
                    const parallaxValue = scrolled * 0.3;
                    heroBg.style.transform = `translateY(${parallaxValue}px)`;
                }
                
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Counter animation for stats
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                const suffix = el.textContent.includes('+') ? '+' : el.textContent.includes('%') ? '%' : '+';
                
                animateCounterElement(el, target, suffix, 2000);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounterElement(element, target, suffix, duration) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        
        element.textContent = current.toLocaleString('es-ES') + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Loads cars with featured: true from inventory.json
async function loadFeaturedCars() {
    const featuredGrid = document.getElementById('featured-cars-grid');
    if (!featuredGrid) return;

    try {
        const response = await fetch('data/inventory.json');
        const data = await response.json();
        const featured = data.cars.filter(car => car.featured === true).slice(0, 3);
        
        if (featured.length === 0) {
            featuredGrid.innerHTML = '<p class="text-center text-muted">No hay ofertas destacadas en este momento.</p>';
            return;
        }

        featuredGrid.innerHTML = featured.map(car => createCarCardHTML(car)).join('');
        lucide.createIcons();
    } catch (error) {
        console.error('Error loading cars:', error);
        featuredGrid.innerHTML = '<p class="text-center text-danger">Error al cargar el inventario.</p>';
    }
}

// Helper to generate car card HTML
function createCarCardHTML(car) {
    const formattedPrice = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(car.price);
    const formattedKm = new Intl.NumberFormat('es-ES').format(car.km);
    
    return `
        <div class="car-card" onclick="window.location.href='coche.html?id=${car.id}'">
            ${car.featured ? '<span class="badge-featured">Destacado</span>' : ''}
            ${car.sold ? '<span class="badge-sold">Vendido</span>' : ''}
            <div class="car-img-wrapper">
                <img src="${car.imageUrl}" alt="${car.brand} ${car.model}" loading="lazy">
                <div class="car-price-top">${formattedPrice}</div>
            </div>
            <div class="car-info">
                <h3 class="car-title">${car.brand} ${car.model}</h3>
                <div class="car-specs">
                    <div class="spec-item"><i data-lucide="calendar" style="width:14px"></i><span>${car.year}</span></div>
                    <div class="spec-item"><i data-lucide="gauge" style="width:14px"></i><span>${formattedKm} km</span></div>
                    <div class="spec-item"><i data-lucide="activity" style="width:14px"></i><span>${car.transmission}</span></div>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-muted" style="font-size: 0.8rem;">Año: ${car.year} | ${car.fuel}</span>
                    <a href="coche.html?id=${car.id}" class="btn btn-outline btn-sm" style="padding: 0.4rem 0.8rem;">Ver Detalle</a>
                </div>
            </div>
        </div>
    `;
}

// Scroll animations with IntersectionObserver
function initScrollAnimations() {
    // Handle reveal elements
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Handle fade-in-up elements
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-up').forEach(el => fadeObserver.observe(el));
}

// Load reviews from Wallapop
async function loadReviews() {
    const track = document.getElementById('reviews-track');
    if (!track) return;

    try {
        const response = await fetch('data/reviews.json');
        const data = await response.json();
        const reviews = data.reviews;
        const summary = data.summary;

        if (reviews.length === 0) {
            track.innerHTML = '<p class="text-center text-muted">No hay valoraciones disponibles.</p>';
            return;
        }

        // Update summary
        const avgEl = document.getElementById('reviews-average');
        const countEl = document.getElementById('reviews-count');
        const starsEl = document.getElementById('reviews-stars-summary');

        if (avgEl) avgEl.textContent = summary.average;
        if (countEl) countEl.textContent = `(${summary.total} valoraciones)`;

        if (starsEl) {
            const full = Math.round(summary.average);
            starsEl.innerHTML = '<i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i>';
            starsEl.dataset.rating = full;
        }

        // Render cards
        track.innerHTML = reviews.map(review => `
            <div class="review-card" data-rating="${review.rating}">
                <div class="review-card-header">
                    ${review.userAvatar
                        ? `<img src="${review.userAvatar}" alt="${review.userName}" class="review-card-avatar" loading="lazy">`
                        : `<div class="review-card-avatar" style="background:var(--accent-primary);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:1rem;">${review.userName.charAt(0)}</div>`
                    }
                    <div>
                        <div class="review-card-user">${review.userName}</div>
                        <div class="review-card-date">${review.date}</div>
                    </div>
                    <div class="review-card-stars">
                        <i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i>
                    </div>
                </div>
                <div class="review-card-comment">"${review.comment}"</div>
                <div class="review-card-car">${review.wallapopUrl
                    ? `<a href="${review.wallapopUrl}" target="_blank" rel="noopener">${review.carTitle}</a>`
                    : review.carTitle}</div>
            </div>
        `).join('');

        lucide.createIcons();

        // Apply star fill colors after Lucide renders SVGs
        const summaryStars = document.getElementById('reviews-stars-summary');
        const summaryRating = summaryStars ? parseInt(summaryStars.dataset.rating) : 5;
        document.querySelectorAll('.review-card').forEach(card => {
            const rating = parseInt(card.dataset.rating);
            const stars = card.querySelectorAll('.review-card-stars svg');
            stars.forEach((svg, i) => {
                if (i >= rating) {
                    svg.style.color = '#475569';
                    svg.style.fill = 'none';
                }
            });
        });
        if (summaryStars) {
            const svgs = summaryStars.querySelectorAll('svg');
            svgs.forEach((svg, i) => {
                if (i >= summaryRating) {
                    svg.style.color = '#475569';
                    svg.style.fill = 'none';
                }
            });
        }

    } catch (error) {
        console.error('Error loading reviews:', error);
        track.innerHTML = '<p class="text-center text-danger">Error al cargar las valoraciones.</p>';
    }
}
