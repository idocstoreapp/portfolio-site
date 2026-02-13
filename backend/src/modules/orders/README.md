# Orders Module - Documentación

## 📋 Descripción

Módulo completo para gestionar Work Orders (Órdenes de Trabajo) profesionales.

## 🚀 Endpoints Disponibles

### Listar Órdenes
```
GET /api/orders?page=1&limit=20&status=draft&projectType=sistema&search=cliente
```

### Obtener Orden
```
GET /api/orders/:id?includeRelations=true
```

### Crear Orden
```
POST /api/orders
Body: CreateOrderDto
```

### Crear Orden desde Diagnóstico
```
POST /api/orders/from-diagnostic
Body: CreateOrderFromDiagnosticDto
```

### Actualizar Orden
```
PUT /api/orders/:id
Body: UpdateOrderDto
```

### Actualizar Estado
```
PUT /api/orders/:id/status
Body: { status: 'sent' }
```

### Eliminar Orden
```
DELETE /api/orders/:id
```

## 💰 Cálculo de Precios

El sistema calcula automáticamente:

```
total_price = base_price + modules_price + custom_adjustments - discount_amount
```

- `base_price`: Del template seleccionado
- `modules_price`: Suma de precios de módulos incluidos
- `custom_adjustments`: Ajustes manuales
- `discount_amount`: Descuento aplicado

## 🔢 Generación de Números de Orden

Formato: `ORD-YYYY-NNN`
- Ejemplo: `ORD-2024-001`
- Se genera automáticamente usando función SQL `generate_order_number()`

## 📦 Relaciones Automáticas

Al crear una orden:
1. Se crean registros en `order_modules` para cada módulo incluido
2. Se crea registro en `order_terms` con valores por defecto

## ✅ Estados de Orden

- `draft` - Borrador (no enviado)
- `sent` - Enviado al cliente
- `accepted` - Aceptado por cliente
- `in_development` - En desarrollo
- `completed` - Completado
- `cancelled` - Cancelado

## 🔄 Flujo Recomendado

1. Crear orden (status: `draft`)
2. Configurar módulos y precios
3. Generar PDF del contrato
4. Cambiar status a `sent`
5. Cliente acepta → status: `accepted`
6. Iniciar desarrollo → status: `in_development`
7. Completar → status: `completed` (genera manual automáticamente)
