# Correas Center - Plataforma de Soluciones Industriales

## 1. Problema que Resuelve
Las PYMES industriales en Bolivia carecen de plataformas digitales centralizadas para:
- Consultar productos industriales especializados
- Encontrar aplicaciones específicas por sector
- Contactar directamente con proveedores autorizados
- Acceder a información técnica detallada

## 2. Alcance del Proyecto

### Incluye:
- Catálogo digital de productos industriales
- Sistema de búsqueda avanzada por categorías, marcas y usos
- Selector interactivo de productos (wizard)
- Panel de administración completo (CMS)
- Integración con WhatsApp Business
- Chat en vivo (Tawk.to)
- Google Analytics

### No Incluye:
- E-commerce (carrito de compras/pasarela de pagos)
- Sistema de inventario en tiempo real
- App móvil nativa

## 3. Arquitectura

[Insertar diagrama de arquitectura]

### Capas:
- **Frontend:** React + TypeScript + Vite (Cliente)
- **Backend:** Supabase (BaaS - Backend as a Service)
- **Base de Datos:** PostgreSQL (Supabase)
- **Autenticación:** Supabase Auth
- **Storage:** Supabase Storage (imágenes)
- **Hosting:** Firebase Hosting
- **CDN:** Firebase CDN

## 4. Justificación Tecnológica

### Frontend: React + TypeScript + Vite
- **Alternativa descartada:** Angular
- **Motivo:** React ofrece mejor rendimiento con Virtual DOM, comunidad más activa, y Vite proporciona build times 10-100x más rápidos que Webpack

### Backend: Supabase
- **Alternativa descartada:** Firebase Firestore
- **Motivo:** Supabase ofrece PostgreSQL completo con relaciones SQL, mejor para datos estructurados complejos como catálogos de productos con múltiples relaciones

### Estilos: Tailwind CSS
- **Alternativa descartada:** Bootstrap
- **Motivo:** Tailwind permite diseños más personalizados, menor bundle size con PurgeCSS, y mejor DX (Developer Experience)

### Hosting: Firebase Hosting
- **Alternativa descartada:** Netlify
- **Motivo:** Requisito del trabajo final + Firebase ofrece SSL automático, CDN global, y fácil integración con otras herramientas de Google

## 5. Instrucciones de Instalación

### Prerrequisitos:
- Node.js >= 18.x
- npm >= 9.x
- Firebase CLI

### Instalación:
```bash
# 1. Clonar repositorio
git clone https://github.com/LuisFer-01/correas-center-app.git
cd correas-center

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase y Firebase

# 4. Ejecutar en desarrollo
npm run dev

# 5. Build para producción
npm run build

# 6. Desplegar a Firebase
firebase deploy