# Khalessi Gestor

Sistema de gestión empresarial modular profesional desarrollado con React, TypeScript y TailwindCSS.

## 🚀 Características

- **Dashboard Profesional**: Vista general del negocio con métricas clave
- **Gestión de Clientes**: Registro y búsqueda de clientes
- **Catálogo de Productos**: Administración de productos con precios y márgenes
- **Sistema de Pedidos**: Creación de pedidos con selección inteligente de clientes y productos
- **Control de Ventas**: Seguimiento de estado de entrega y pagos con resumen financiero
- **Stock de Insumos**: Control de inventario con alertas de stock bajo
- **Diseño Responsive**: Optimizado para escritorio
- **TypeScript**: Tipado fuerte para mayor seguridad
- **Supabase Ready**: Preparado para integración con backend

## 📋 Requisitos

- Node.js 18+ 
- npm o yarn

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd Khalessi_Gestor
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

Edita el archivo `.env` y agrega tus credenciales de Supabase.

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── Sidebar.tsx
│   ├── FormCard.tsx
│   ├── DataTable.tsx
│   └── SummaryCard.tsx
├── pages/           # Páginas de la aplicación
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Clientes.tsx
│   ├── Productos.tsx
│   ├── Pedidos.tsx
│   ├── Ventas.tsx
│   └── StockInsumos.tsx
├── types/           # Interfaces TypeScript
│   └── index.ts
├── services/        # Servicios (Supabase)
│   └── supabase.ts
├── hooks/           # Custom hooks
│   └── useAuth.tsx
├── App.tsx
└── main.tsx
```

## 🗄️ Configuración de Supabase

### Tablas necesarias:

1. **clientes**
   - id_cliente (text, primary key)
   - nombre (text)
   - apellido (text)
   - direccion (text)
   - telefono (text)
   - email (text)

2. **productos**
   - id_producto (text, primary key)
   - nombre_producto (text)
   - precio_costo (numeric)
   - precio_venta (numeric)

3. **insumos**
   - id_insumo (text, primary key)
   - nombre_insumo (text)
   - precio_costo (numeric)
   - cantidad (integer)

4. **pedidos**
   - id_pedido (text, primary key)
   - cliente (jsonb)
   - productos (jsonb)
   - fecha (text)
   - total_costo (numeric)
   - total_venta (numeric)
   - estado (text)
   - pago (text)

## 🎨 Tecnologías

- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **TailwindCSS** - Estilos
- **React Router** - Navegación
- **Supabase** - Backend as a Service
- **Vite** - Build tool

## 📝 Scripts Disponibles

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Construye para producción
npm run preview  # Preview de la build
npm run lint     # Ejecuta el linter
```

## 🔐 Autenticación

Actualmente usa autenticación mock. Para implementar autenticación real:

1. Configura Supabase Auth en tu proyecto
2. Actualiza `src/hooks/useAuth.tsx` con la lógica de Supabase
3. Implementa protección de rutas según sea necesario

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor abre un issue primero para discutir los cambios que te gustaría realizar.

## 📄 Licencia

Este proyecto es privado y propietario.

---

Desarrollado con ❤️ para Khalessi Gestor
