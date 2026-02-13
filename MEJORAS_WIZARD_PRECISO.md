# 🎯 MEJORAS AL WIZARD PARA MAYOR PRECISIÓN

## 📋 PROBLEMAS IDENTIFICADOS

1. **Estimaciones genéricas de ahorro**: El wizard calcula ahorros con porcentajes fijos (80% tiempo, 85% dinero) sin preguntar datos reales del cliente
2. **Falta de preguntas específicas**: No pregunta datos concretos como facturación, horas trabajadas, empleados, etc.
3. **No pre-llena datos para orden**: No identifica claramente qué app y módulos necesita
4. **Estimaciones poco convincentes**: Dice "ahorrarás $X" sin saber cuánto gana el cliente

## ✅ SOLUCIÓN PROPUESTA

### **1. Preguntas Específicas por Tipo de Negocio**

#### **Restaurante:**
- ¿Cuántas mesas tienes?
- ¿Cuántos pedidos manejas al día?
- ¿Cuánto tiempo toma tomar un pedido manualmente?
- ¿Cuánto gastas en papel/menús al mes?
- ¿Tienes problemas con pedidos mal anotados?

#### **Servicio Técnico:**
- ¿Cuántas reparaciones haces al mes?
- ¿Cuánto tiempo toma buscar historial de un cliente?
- ¿Cuántas veces pierdes información de reparaciones?
- ¿Cómo calculas comisiones actualmente?

#### **Taller Mecánico:**
- ¿Cuántos vehículos atiendes al mes?
- ¿Cuánto tiempo toma cotizar una reparación?
- ¿Cómo llevas el inventario de repuestos?
- ¿Tienes problemas con repuestos faltantes?

### **2. Eliminar Estimaciones Genéricas**

**Antes:**
```typescript
// Calcular ahorros potenciales (asumiendo 80% de reducción con sistema)
totalPotentialTimeSavings += (selectedOption.costImpact.timeHours || 0) * 0.8;
totalPotentialMoneySavings += (selectedOption.costImpact.moneyCost || 0) * 0.85;
```

**Después:**
- Basar cálculos en respuestas reales del cliente
- Mostrar estimaciones conservadoras basadas en datos específicos
- Si no hay datos suficientes, mostrar "Oportunidad de mejora" sin números específicos

### **3. Pre-llenar Datos para Orden**

- Identificar automáticamente qué app prefabricada necesita
- Pre-seleccionar módulos recomendados según respuestas
- Guardar en diagnóstico: `recommended_app`, `recommended_modules`, `estimated_complexity`

### **4. Mejorar Resultados**

**Antes:**
- "Ahorrarás $500/mes" (sin saber cuánto gana)

**Después:**
- "Basado en tus respuestas, podrías recuperar aproximadamente X horas semanales"
- "Oportunidad de reducir costos operativos en Y%"
- Mostrar comparativa: "Tiempo actual vs tiempo con sistema"

---

## 🚀 IMPLEMENTACIÓN

### **Fase 1: Preguntas Específicas**
- Agregar preguntas numéricas según tipo de negocio
- Calcular ahorros basados en respuestas reales

### **Fase 2: Eliminar Estimaciones Genéricas**
- Modificar `calculateCostsAndSavings` para usar datos reales
- Mostrar estimaciones conservadoras solo si hay datos suficientes

### **Fase 3: Pre-llenar para Orden**
- Identificar app recomendada
- Pre-seleccionar módulos
- Guardar en diagnóstico

### **Fase 4: Mejorar Visualización**
- Mostrar comparativas claras
- Eliminar números "mágicos" sin fundamento
