# Plan: Premium Hero Section - Range Rover Evoque 2017

## Objetivo
Reemplazar el hero actual con una sección premium que muestre el Range Rover Evoque 2017 (13.500 EUR) como vehículo estrella, con animaciones avanzadas y efectos de scroll.

---

## Cambios por archivo

### 1. `index.html` - Nuevo Hero Premium

**Estructura del nuevo hero:**
```html
<section class="hero-premium" id="hero-premium">
    <!-- Background con parallax -->
    <div class="hero-premium-bg" id="hero-bg">
        <div class="hero-premium-overlay"></div>
        <div class="hero-premium-gradient"></div>
        <img id="hero-car-image" src="" alt="Vehículo Premium">
    </div>
    
    <!-- Contenido -->
    <div class="container hero-premium-content">
        <div class="hero-premium-badge">VEHÍCULO PREMIUM</div>
        <h1 class="hero-premium-title">
            <span class="hero-premium-brand">Land Rover</span>
            <span class="hero-premium-model">Range Rover Evoque 2017</span>
        </h1>
        <div class="hero-premium-specs">
            <div class="spec-chip"><i data-lucide="calendar"></i><span>2017</span></div>
            <div class="spec-chip"><i data-lucide="gauge"></i><span>190.000 km</span></div>
            <div class="spec-chip"><i data-lucide="fuel"></i><span>Diésel</span></div>
            <div class="spec-chip"><i data-lucide="settings"></i><span>Automático</span></div>
        </div>
        <div class="hero-premium-price">
            <span class="price-currency">€</span>
            <span class="price-amount" id="hero-price-value">0</span>
        </div>
        <div class="hero-premium-actions">
            <a href="" class="btn btn-premium">Ver este vehículo</a>
            <a href="https://wa.me/..." class="btn btn-premium-outline">Preguntar por WhatsApp</a>
        </div>
    </div>
    
    <!-- Scroll indicator -->
    <div class="hero-scroll-indicator">
        <div class="scroll-mouse"><div class="scroll-wheel"></div></div>
        <span>Descubre más</span>
    </div>
</section>
```

**Cambios en el resto de la página:**
- Sección "Vehículos Destacados" → se mantiene igual
- Sección "¿Por qué elegirnos?" → se mantiene igual
- Sección Stats → se añaden clases `counter` para animación numérica
- Footer → se mantiene igual

---

### 2. `css/components.css` - Nuevos estilos premium

**Nuevos estilos a añadir:**

#### Hero Premium
```css
.hero-premium {
    position: relative;
    height: 100vh;
    min-height: 700px;
    display: flex;
    align-items: center;
    overflow: hidden;
}

.hero-premium-bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    will-change: transform;
}

.hero-premium-img {
    width: 100%;
    height: 120%;
    object-fit: cover;
    object-position: center 20%;
    filter: brightness(0.5) saturate(1.1);
    transition: transform 0.1s linear;
}

.hero-premium-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, 
        rgba(10, 10, 15, 0.95) 0%, 
        rgba(10, 10, 15, 0.7) 40%, 
        rgba(10, 10, 15, 0.3) 100%);
    z-index: 1;
}

.hero-premium-gradient {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(to top, var(--bg-primary), transparent);
    z-index: 2;
}
```

#### Badge Premium con shimmer
```css
.hero-premium-badge {
    display: inline-block;
    margin-bottom: 1.5rem;
    opacity: 0;
    animation: fadeInUp 0.8s ease 0.2s forwards;
}

.badge-shimmer {
    background: linear-gradient(135deg, var(--accent-secondary), #fbbf24, var(--accent-secondary));
    background-size: 200% 200%;
    color: #0a0a0f;
    padding: 0.5rem 1.5rem;
    border-radius: 50px;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 3px;
    animation: shimmer 3s ease infinite;
    box-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
}

@keyframes shimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}
```

#### Título con stagger
```css
.hero-premium-title {
    opacity: 0;
    animation: fadeInUp 0.8s ease 0.4s forwards;
    margin-bottom: 1.5rem;
}

.hero-premium-brand {
    display: block;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--accent-primary);
    text-transform: uppercase;
    letter-spacing: 4px;
    margin-bottom: 0.5rem;
}

.hero-premium-model {
    display: block;
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.1;
    color: white;
}
```

#### Spec chips
```css
.hero-premium-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 2rem;
    opacity: 0;
    animation: fadeInUp 0.8s ease 0.6s forwards;
}

.spec-chip {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    padding: 0.6rem 1rem;
    border-radius: 50px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.spec-chip:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: var(--accent-primary);
    transform: translateY(-2px);
}
```

#### Precio animado
```css
.hero-premium-price {
    opacity: 0;
    animation: fadeInUp 0.8s ease 0.8s forwards;
    margin-bottom: 2.5rem;
}

.price-currency {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent-secondary);
    vertical-align: super;
}

.price-amount {
    font-size: 4rem;
    font-weight: 800;
    color: var(--accent-secondary);
    letter-spacing: -2px;
    text-shadow: 0 0 40px rgba(245, 158, 11, 0.2);
}
```

#### Botones premium
```css
.hero-premium-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    opacity: 0;
    animation: fadeInUp 0.8s ease 1s forwards;
}

.btn-premium {
    background: linear-gradient(135deg, var(--accent-secondary), #fbbf24);
    color: #0a0a0f;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 30px rgba(245, 158, 11, 0.3);
    position: relative;
    overflow: hidden;
}

.btn-premium::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s ease;
}

.btn-premium:hover::before {
    left: 100%;
}

.btn-premium:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(245, 158, 11, 0.4);
}

.btn-premium-outline {
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-premium-outline:hover {
    border-color: #25d366;
    background: rgba(37, 211, 102, 0.1);
    color: #25d366;
    transform: translateY(-3px);
}
```

#### Scroll indicator
```css
.hero-scroll-indicator {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    animation: fadeInUp 0.8s ease 1.2s forwards;
    opacity: 0;
}

.scroll-mouse {
    width: 26px;
    height: 40px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 13px;
    display: flex;
    justify-content: center;
    padding-top: 8px;
}

.scroll-wheel {
    width: 4px;
    height: 8px;
    background: var(--accent-primary);
    border-radius: 2px;
    animation: scrollWheel 2s ease infinite;
}

@keyframes scrollWheel {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(12px); opacity: 0; }
}
```

#### Keyframes nuevas
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes shimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

@keyframes scrollWheel {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(12px); opacity: 0; }
}
```

#### Cards 3D hover effect
```css
.car-card-3d {
    transform-style: preserve-3d;
    perspective: 1000px;
}

.car-card-3d:hover {
    transform: translateY(-8px) rotateX(2deg) rotateY(-2deg);
}
```

#### Counter animation
```css
.counter {
    transition: all 0.3s ease;
}
```

---

### 3. `js/app.js` - Nuevas funcionalidades

**Funciones a añadir:**

#### loadPremiumHero()
- Carga el inventory.json
- Encuentra el coche con precio más alto (excluyendo furgonetas si se desea)
- Rellena todos los campos del hero dinámicamente
- Inicia la animación del contador de precio

#### animateCounter(element, target, duration)
- Animación suave del precio desde 0 hasta el valor real
- Usa requestAnimationFrame para 60fps
- Formato de moneda española

#### initParallax()
- Escucha el evento scroll
- Aplica transform translateY al background del hero
- Efecto parallax suave con factor 0.3

#### initCounters()
- Usa IntersectionObserver
- Cuando los stats son visibles, anima los números
- Contador de 20+, 1500+, 100%

#### initScrollReveal()
- Mejora el IntersectionObserver existente
- Añade clase `reveal` a elementos
- Animación fade-in-up con stagger

#### initCard3D()
- Escucha mousemove en cada card
- Calcula rotación basada en posición del ratón
- Efecto 3D sutil

---

### 4. `css/base.css` - Pequeños ajustes

- Añadir clase `.reveal` para scroll animations
- Ajustar `.fade-in-up` para consistencia
- Añadir `.stagger-1`, `.stagger-2`, etc. para delays escalonados

---

## Datos del coche premium

**Range Rover Evoque 2017:**
- ID: `land-rover-range-rover-evoque-2017-nacional`
- Imagen: `img/cars/land-rover-range-rover-evoque-2017-nacional-nzxepd.webp`
- Precio: 13.500 EUR
- KM: 190.000
- Combustible: Diésel
- Transmisión: Automático
- Año: 2017
- URL: `coche.html?id=land-rover-range-rover-evoque-2017-nacional`

---

## Timeline de animaciones

| Tiempo | Elemento | Animación |
|--------|----------|-----------|
| 0s | Background | Ya visible |
| 0.2s | Badge "PREMIUM" | fadeInUp + shimmer |
| 0.4s | Título | fadeInUp |
| 0.6s | Spec chips | fadeInUp |
| 0.8s | Precio | fadeInUp + counter animation |
| 1.0s | Botones | fadeInUp |
| 1.2s | Scroll indicator | fadeInUp |
| Scroll | Parallax | Background se mueve más lento |
| Scroll | Stats | Counter animation al entrar en viewport |
| Scroll | Cards | Reveal animation al entrar en viewport |
| Hover | Cards | 3D rotation + scale |

---

## Responsive

- **Desktop (>900px):** Hero completo con imagen de fondo + contenido a la izquierda
- **Tablet (600-900px):** Hero más compacto, título más pequeño
- **Mobile (<600px):** 
  - Hero height: 80vh
  - Título: 2rem
  - Precio: 2.5rem
  - Botones en columna
  - Spec chips en 2 columnas
