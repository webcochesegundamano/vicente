# Scripts de Importación - Autos Sanchez Guerrero

## Importador desde Wallapop

Este script extrae los coches del perfil de Wallapop de Autos Sanchez Guerrero y genera el archivo `data/inventory.json` que la web utiliza para mostrar el inventario.

### Uso

```bash
node scripts/import-wallapop.js
```

### ¿Cómo funciona?

El script convierte los datos del perfil de Wallapop (`https://es.wallapop.com/user/luism-466989913`) al formato que la web necesita.

### Flujo de trabajo recomendado

1. **El vendedor** publica/actualiza coches en su perfil de Wallapop
2. **Tú** ejecutas el script para regenerar el inventario:
   ```bash
   node scripts/import-wallapop.js
   ```
3. **Revisas** el archivo `data/inventory.json` generado y completas:
   - `km` - Kilómetros reales (consultar en Wallapop)
   - `imageUrl` - URL de la primera imagen del anuncio en Wallapop
   - `features` - Equipamiento adicional si es necesario
4. **Haces commit** y push a GitHub para actualizar la web

### Campos del inventario

Cada coche en `data/inventory.json` tiene esta estructura:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `id` | Identificador único (generado automáticamente) | `"renault-megane-1-5-dci-105cv"` |
| `brand` | Marca del vehículo | `"Renault"` |
| `model` | Modelo y versión | `"Megane 1.5 dci 105cv"` |
| `year` | Año de matriculación | `2008` |
| `price` | Precio en euros | `5500` |
| `km` | Kilómetros | `68140` |
| `fuel` | Tipo de combustible | `"Gasolina"`, `"Diésel"` |
| `transmission` | Tipo de cambio | `"Manual"`, `"Automático"` |
| `features` | Lista de características/equipamiento | `["Etiqueta C", "Vehículo nacional"]` |
| `adUrl` | URL del anuncio en Wallapop | `"https://es.wallapop.com/item/..."` |
| `imageUrl` | URL de la imagen principal | `"https://..."` |
| `featured` | Si aparece en destacados (true/false) | `true` |
| `sold` | Si está vendido (true/false) | `false` |

### Obtener URLs de imágenes de Wallapop

1. Abre el anuncio en Wallapop
2. Haz clic derecho en la primera imagen → "Copiar dirección de imagen"
3. Pega la URL en el campo `imageUrl` del coche correspondiente

### Actualizar el inventario

Cuando el vendedor añada o quite coches en Wallapop:

1. Actualiza la lista `MANUAL_CARS` en `import-wallapop.js`
2. Ejecuta `node scripts/import-wallapop.js`
3. Completa los campos `km` e `imageUrl` manualmente
4. Haz commit y push

### Automatización futura

Para una automatización completa se podría:
- Usar un scraper con Selenium/Puppeteer que extraiga datos directamente de Wallapop
- Configurar un GitHub Action que ejecute el script periódicamente
- Usar la API de Wallapop (requiere autenticación)
