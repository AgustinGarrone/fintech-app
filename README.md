# Fintech API

API REST para gestión de transacciones financieras construida con TypeScript, Express y PostgreSQL. Implementa arquitectura modular, control de concurrencia optimista, logging estructurado de errores de sistema y auditoría y documentación OpenAPI.

## 📑 Índice

- [🚀 Características Clave](#-características-clave)
  - [Arquitectura](#arquitectura)
  - [Transacciones Financieras](#transacciones-financieras)
  - [Seguridad y Validación](#seguridad-y-validación)
  - [Observabilidad](#observabilidad)
  - [Documentación](#documentación)
  - [Testing](#testing)
- [🔌 Endpoints Principales](#-endpoints-principales)
- [🔒 Características de Seguridad](#-características-de-seguridad)
- [🧪 Testing](#-testing-1)
- [📚 Documentación API](#-documentación-api)
- [📋 Logging](#-logging)
- [🛠️ Instalación y Configuración](#️-instalación-y-configuración)
  - [Prerrequisitos](#prerrequisitos)
  - [💡 Uso](#-uso)
  - [Setup Recomendado: Docker 🐳](#setup-recomendado-docker-)
  - [Setup Manual (Alternativa)](#setup-manual-alternativa)

## 🚀 Características Clave

### Arquitectura

- **Arquitectura modular** con separación de responsabilidades (Controller → Service → Repository)
- **Patrón Singleton** para servicios y repositorios
- **Base classes** reutilizables para servicios y repositorios
- **DTOs y Mappers** para transformación de datos
- **API versioning** con soporte para múltiples versiones

### Transacciones Financieras

- **Transferencias entre usuarios** con validación de saldo
- **Aprobación automática** para montos menores a $50,000
- **Aprobación manual** requerida para montos mayores
- **Control de concurrencia optimista** usando versioning para prevenir race conditions
- **Transacciones atómicas** con rollback automático en caso de error
- **Historial de transacciones** por usuario

### Seguridad y Validación

- **Validación de entrada** con Zod schemas
- **Rate limiting** (10 requests/minuto por IP)
- **Helmet.js** para headers de seguridad
- **CORS** configurado
- **Manejo de errores** estandarizado con RFC 7807

### Observabilidad

- **Logging estructurado** con Pino (audit logs y error logs)
- **Persistencia de logs** en archivos JSON por fecha
- **Trazabilidad completa** de transacciones (éxito/fallo)
- **Health check endpoint** con información de versión de API

### Documentación

- **Swagger/OpenAPI 3.0** con documentación interactiva
- **JSend** para respuestas API estandarizadas
- **Schemas** documentados para todos los endpoints

### Testing

Casos de uso básicos

## 🔌 Endpoints Principales

### Health Check

- `GET /api/v1/health` - Estado del servidor y versión de API

### Usuarios

- `GET /api/v1/users/:id/balance` - Obtener saldo de usuario

### Transacciones

- `POST /api/v1/transactions` - Crear transacción
- `GET /api/v1/transactions/user/:userId` - Historial de transacciones
- `POST /api/v1/transactions/:id/approve` - Aprobar transacción pendiente
- `POST /api/v1/transactions/:id/reject` - Rechazar transacción pendiente

### Documentación

- `GET /api-docs` - Swagger UI interactivo
- Colección de postman

## 🔒 Características de Seguridad

- **Optimistic Locking**: Previene errores de concurrencia en transacciones
- **Validación de saldo**: Verificación antes de procesar transferencias
- **Transacciones atómicas**: Rollback automático en caso de error
- **Rate Limiting**: Protección contra abuso de API
- **Security Headers**: Configurados con Helmet
- **Error Handling**: No exposición de información sensible en errores

> **Nota**: el bloqueo optimista lo usé porque es la opción mas rapida a desarrollar para el desafío, no la mejor.

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Modo watch
npm run test:watch

# Con coverage
npm run test:coverage
```

## 📚 Documentación API

La documentación interactiva está disponible en:

- **Swagger UI**: `http://localhost:3000/api-docs`
- Además hay una colección de postman en la carpeta raiz.

## 📋 Logging

Los logs se almacenan en `temp/logs/` organizados por fecha:

- **Audit logs**: Transacciones y eventos de negocio
- **Error logs**: Errores y excepciones

Formato: `{type}-{transactionId}-{timestamp}.json`

## 🛠️ Instalación y Configuración

### Prerrequisitos

- **Docker** y **Docker Compose** (recomendado)
- Node.js >= 18
- PostgreSQL >= 16
- npm o yarn

### 💡 Uso

Al ejecutar el seed de la base de datos, se crean usuarios de prueba con saldos iniciales. **En los logs de la app** podrás ver la información completa de cada usuario creado, incluyendo:

- **ID único** de cada usuario (UUID)
- **Email** del usuario
- **Nombre** del usuario
- **Balance inicial** en formato moneda

Estos usuarios están listos para usar en tus pruebas. Puedes copiar los IDs directamente de los logs y utilizarlos en tus requests a la API para crear transacciones, consultar saldos, etc.

### Setup Recomendado: Docker 🐳

**Recomiendo usar Docker** para una configuración rápida y consistente, para el desafío le puse más énfasis a este tipo de despliegue

```bash
cd fintech-app
# Construir y ejecutar todos los servicios mostrando los logs
docker-compose up --build
```

El contenedor se encarga automáticamente de:

- Configurar PostgreSQL
- Ejecutar migraciones
- Seed de datos de prueba
- Iniciar la aplicación

### Setup Manual (Alternativa)

Si preferís ejecutar localmente sin Docker:

```bash
cd fintech-app
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Seed de datos de prueba
npm run prisma:seed

# Desarrollo
npm run dev

# Producción
npm run build
npm start
```
