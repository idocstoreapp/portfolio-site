# 🎛️ Panel de Administración - Sistema de Diagnósticos

Panel completo de administración para gestionar diagnósticos, aprobar proyectos, registrar costos reales y generar órdenes.

## 🚀 Inicio Rápido

```bash
npm install
npm run dev
```

## 📁 Estructura

```
admin-panel/
├── app/
│   ├── layout.tsx          # Layout principal con autenticación
│   ├── page.tsx             # Dashboard principal
│   ├── login/
│   │   └── page.tsx         # Página de login
│   ├── diagnosticos/
│   │   ├── page.tsx         # Lista de diagnósticos
│   │   └── [id]/
│   │       └── page.tsx     # Detalle y edición de diagnóstico
│   └── proyectos/
│       ├── page.tsx         # Lista de proyectos aprobados
│       └── [id]/
│           └── page.tsx     # Control de costos reales
├── components/
│   ├── auth/
│   │   └── AuthGuard.tsx   # Guard de autenticación
│   ├── diagnosticos/
│   │   ├── DiagnosticList.tsx
│   │   ├── DiagnosticCard.tsx
│   │   ├── DiagnosticFilters.tsx
│   │   └── DiagnosticForm.tsx
│   ├── proyectos/
│   │   ├── CostosReales.tsx
│   │   ├── GastosTab.tsx
│   │   └── ManoObraTab.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Modal.tsx
├── lib/
│   ├── supabase.ts         # Cliente Supabase
│   └── api.ts              # Cliente API backend
└── types/
    └── diagnostic.ts       # Tipos TypeScript
```

## 🔐 Autenticación

Usa Supabase Auth para autenticación de administradores.

## 📊 Funcionalidades

- ✅ Lista de diagnósticos con filtros
- ✅ Aprobación de diagnósticos
- ✅ Registro de costos reales
- ✅ Registro de trabajo realizado
- ✅ Generación de órdenes PDF
- ✅ Dashboard con métricas
- ✅ Gestión de proyectos

