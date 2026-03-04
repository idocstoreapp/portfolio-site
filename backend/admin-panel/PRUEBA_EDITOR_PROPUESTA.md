# Prueba del editor de propuesta (opciones de oferta + hints dinámicos)

## Requisitos

- Backend Nest en **http://localhost:3000** (ya está con `npm run start:dev`).
- Admin panel en **http://localhost:3001**. Si no está corriendo:
  ```bash
  cd backend/admin-panel && npm run dev
  ```

## Pasos para probar

1. **Entra al panel**  
   Abre **http://localhost:3001** (y haz login si aplica).

2. **Ir a Leads**  
   Entra a la sección de leads (lista de leads).

3. **Abrir el editor de propuesta**  
   - Si tienes un lead con diagnóstico: crea una propuesta desde ese diagnóstico (botón/acción "Crear propuesta" o similar).  
   - O usa un lead que ya tenga propuesta y abre "Generar / editar PDF" o "Editor de propuesta".  
   Así se abre el **modal "Editor de propuesta · [nombre del cliente]"**.

4. **Revisar las nuevas opciones**  
   - **Tipo de plantilla:** Genérica, Restaurante, Taller, Servicio técnico (dropdown como antes).  
   - **Opciones de la oferta** (bloque nuevo debajo):  
     - Con plantilla **Genérica**: solo debe verse **"Tipo de web"** (Landing / Multi-página / Con catálogo).  
     - Con plantilla **Taller**, **Servicio técnico** o **Restaurante**:  
       - **Qué incluye la oferta:** Solo sistema | Combo (web + sistema).  
       - **Tipo de web** (si elegiste Combo).  
       - **Alcance del sistema:** Un local | Varias sucursales.  
       - **Incluye roles** (checkbox).

5. **Hints dinámicos**  
   En la sección de imágenes (mockups), al cambiar:  
   - **Genérica** y **Tipo de web = Catálogo**: los hints deben mencionar "Prompt 1.4", "Prompt 1.5", "Prompt 1.6".  
   - **Taller** y **Varias sucursales**: el slot "Panel admin" debe decir algo como "Prompt 3.4 · panel con sucursales".  
   - **Taller** y **Incluye roles**: un slot debe mencionar "Prompt 3.9 · usuarios y roles".

6. **Generar PDF**  
   - Elige opciones (por ejemplo: Taller, Combo, Varias sucursales, Con roles).  
   - Sube logos/mockups si quieres o deja los placeholders.  
   - Clic en **"Generar PDF"**.  
   - Debe generarse el PDF y, en la portada (o en la sección de título), aparecer las líneas que rellenamos según opciones, por ejemplo:  
     - "Varias sucursales"  
     - "Incluye gestión por sucursal y reportes por local."  
     - "Incluye diferentes perfiles de usuario: admin, técnicos, recepción."  
     - "Esta propuesta incluye sitio web + sistema de gestión."

7. **Probar Genérica + Catálogo**  
   - Plantilla **Genérica**, **Tipo de web = Con catálogo online**.  
   - Genera el PDF y revisa que en portada o página final aparezca algo como "Sitio con catálogo online" o "Incluye catálogo online con productos y precios." (según lo que inyecte el backend).

## Si algo falla

- **Modal no muestra "Opciones de la oferta"**: recarga la página (F5) por si la build del admin no tenía los últimos cambios.  
- **Error al generar PDF**: revisa la consola del navegador (F12 → Console) y la terminal del backend por el mensaje de error.  
- **Variables vacías en el PDF**: confirma que en el modal elegiste tipo de web / tipo de sistema / combo y que el backend está recibiendo esos campos (en Network, request POST a `.../generate-pdf` debería llevar `tipoWeb`, `tipoSistema`, `tipoOferta`, `conRoles` en el body).
