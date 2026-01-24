# 📋 PLAN DE IMPLEMENTACIÓN - SISTEMA DE DIAGNÓSTICO INTELIGENTE

## 🎯 OBJETIVO
Crear un sistema completo que entienda al cliente antes de vender, presente soluciones claras, combine proyectos si es necesario, y prepare el terreno para cotizar.

---

## 📊 ANÁLISIS COMPLETADO

### ✅ Proyectos Analizados:
1. **sistema-reparaciones**: Gestión de órdenes, técnicos, comisiones, gastos, ganancias
2. **cotizador-app**: Cotización por componentes, costos reales, mano de obra, margen
3. **sistema-gestion-ordenes**: Flujo cliente → orden → seguimiento → cierre

### ✅ Stack Identificado:
- **Frontend**: Astro + React + Tailwind CSS
- **Backend**: Supabase (Auth, DB, Storage)
- **Estado**: Zustand (en cotizador-app)
- **Autenticación**: Supabase Auth con roles

---

## 🏗️ ARQUITECTURA DEFINIDA

### **Backend: Nest.js + Supabase**
- Módulos: diagnostic, solutions, clients, auth
- API RESTful
- Integración con Supabase

### **Frontend Público: Astro (Mejorado)**
- Wizard de diagnóstico mejorado
- Páginas resultado dinámicas
- Motor de decisión mejorado

### **Panel Admin: Next.js**
- Dashboard
- Gestión de diagnósticos
- Gestión de clientes
- Gestión de proyectos

---

## 🔧 TAREAS PRIORITARIAS

### **FASE 1: Mejorar Motor de Decisión (URGENTE)**

**Problema actual:**
- El motor usa `objetivo` (singular) pero el wizard permite múltiples `objetivos` (array)
- No considera necesidades adicionales (stock, sucursales, empleados, catálogo)
- No combina soluciones inteligentemente

**Solución:**
1. Actualizar `DiagnosticAnswers` para usar `objetivos: string[]`
2. Mejorar `calculateSolutionScores` para considerar:
   - Múltiples objetivos
   - Necesidades adicionales
   - Combinaciones (Sistema + Web)
3. Generar mensajes más específicos

### **FASE 2: Crear Backend Nest.js**

**Estructura:**
```
backend/
├── src/
│   ├── modules/
│   │   ├── diagnostic/
│   │   │   ├── diagnostic.controller.ts
│   │   │   ├── diagnostic.service.ts
│   │   │   └── diagnostic.module.ts
│   │   └── ...
│   └── main.ts
```

**Endpoints necesarios:**
- `POST /api/diagnostic` - Guardar diagnóstico
- `GET /api/diagnostic/:id` - Obtener diagnóstico
- `GET /api/diagnostic/:id/result` - Obtener resultado procesado

### **FASE 3: Conectar Frontend con Backend**

1. Actualizar `DiagnosticWizard.astro` para enviar a API
2. Crear servicio de API en Astro
3. Actualizar página de resultado para leer desde API

### **FASE 4: Crear Panel Admin Next.js**

1. Setup Next.js con Supabase Auth
2. Dashboard con estadísticas
3. Tabla de diagnósticos
4. Gestión de clientes
5. Gestión de proyectos

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Corregir motor de decisión** (objetivos múltiples)
2. **Crear estructura backend Nest.js**
3. **Implementar API endpoints**
4. **Conectar frontend con backend**
5. **Crear panel admin básico**

---

## 📝 NOTAS IMPORTANTES

- **NO romper** el diseño actual del hero
- **Mantener** la estética premium
- **Usar** proyectos existentes como inspiración
- **Modular** y escalable
- **Clean code** y mantenible




