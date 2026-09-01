# SIFMO Backend - Sistema de Gestión de Incidencias

API RESTful para la gestión de incidencias de soporte técnico de la empresa Ferrominera Orinoco.

## Funcionalidad del Servidor

El servidor backend gestiona un sistema completo de control de incidencias de soporte técnico, incluyendo:

- **Gestión de Usuarios**: CRUD completo con autenticación JWT
- **Gestión de Áreas/Departamentos**: Organización departamental
- **Gestión de Equipos (FMo)**: Inventario de equipos por área
- **Gestión de Marcas**: Catálogo de marcas de equipos
- **Gestión de Incidentes**: Registro y seguimiento de incidencias técnicas
- **Gestión de Workstations**: Detalle técnico de estaciones de trabajo
- **Sistema de Autenticación**: Login con JWT y roles de usuario
- **Servicio de Correo**: Notificaciones por email via SMTP (Gmail)

## Tecnologías y Librerías

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| Lenguaje | JavaScript (Node.js) | - |
| Framework | Express.js | ^5.2.1 |
| Base de Datos | SQLite | ^5.1.1 |
| Driver SQLite | sqlite3 | ^6.0.1 |
| Autenticación | JWT (jsonwebtoken) | ^9.0.3 |
| Hash Contraseñas | bcrypt | ^6.0.0 |
| Correo Electrónico | Nodemailer | ^9.1.1 |
| Variables de Entorno | dotenv | ^17.3.1 |
| CORS | cors | ^2.8.6 |

## Estructura del Proyecto

```
SIFMO_backend/
├── config/
│   ├── database.js      # Conexión a SQLite
│   └── initDB.js        # Inicialización y migraciones DB
├── src/
│   ├── area/            # Gestión de áreas/departamentos
│   ├── equipo/          # Gestión de equipos
│   ├── incident/        # Gestión de incidentes
│   ├── marca/           # Gestión de marcas
│   ├── workstation/     # Gestión de workstations
│   ├── user/            # Gestión de usuarios
│   ├── middleware/
│   │   └── auth.js      # Middleware JWT
│   └── utils/
│       └── mailer.js    # Servicio de correo
├── server.js            # Punto de entrada
├── .env                 # Variables de entorno
└── package.json
```

## Base de Datos

SQLite con las siguientes tablas:

| Tabla | Descripción |
|-------|-------------|
| `Usuario` | Usuarios del sistema (ficha, nombre, rol, correo, password) |
| `Area_Departamento` | Departamentos de la empresa |
| `Marca` | Marcas de equipos |
| `Equipo` | Inventario de equipos (FMo) |
| `Incidente` | Registro de incidencias |
| `R_periferico` | Reporte de periféricos |
| `R_workstation` | Reporte de estaciones de trabajo |
| `Solicitud` | Solicitudes de servicio |

**Usuario Admin por defecto:**
- Ficha: `1`
- Contraseña: `admin`

## Endpoints API

### Usuarios (`/api/users`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/users/` | Crear usuario |
| POST | `/api/users/login` | Login |
| GET | `/api/users/` | Listar usuarios |
| PUT | `/api/users/:ficha` | Actualizar usuario |
| DELETE | `/api/users/:ficha` | Eliminar usuario |

### Incidentes (`/api/incidentes`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/incidentes/crear/` | Crear incidente |
| GET | `/api/incidentes/listar/` | Listar incidentes |
| GET | `/api/incidentes/listar/analista/:ficha` | Incidentes por analista |
| GET | `/api/incidentes/listar/cliente/:clienteId` | Incidentes por cliente |
| GET | `/api/incidentes/detalle/:id` | Detalle de incidente |
| PUT | `/api/incidentes/actualizar/:id` | Actualizar incidente |
| DELETE | `/api/incidentes/eliminar/:id` | Eliminar incidente |

### Áreas (`/api/areas`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/areas/` | Crear área |
| GET | `/api/areas/` | Listar áreas |
| PUT | `/api/areas/:id` | Actualizar área |
| DELETE | `/api/areas/:id` | Eliminar área |

### Equipos (`/api/equipos`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/equipos/` | Crear equipo |
| GET | `/api/equipos/` | Listar equipos |
| PUT | `/api/equipos/:fmo` | Actualizar equipo |
| DELETE | `/api/equipos/:fmo` | Eliminar equipo |

### Marcas (`/api/marcas`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/marcas/` | Crear marca |
| GET | `/api/marcas/` | Listar marcas |
| PUT | `/api/marcas/:id` | Actualizar marca |
| DELETE | `/api/marcas/:id` | Eliminar marca |

### Workstations (`/api/workstations`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/workstations/` | Crear workstation |
| GET | `/api/workstations/` | Listar workstations |
| PUT | `/api/workstations/:id` | Actualizar workstation |
| DELETE | `/api/workstations/:id` | Eliminar workstation |

## Instalación

### Requisitos previos
- Node.js (v16 o superior)
- npm

### Pasos de instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>

# Navegar a la carpeta del backend
cd SIFMO_backend

# Instalar dependencias
npm install
```

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Puerto del servidor
PORT=3000

# Secreto para JWT (cámbialo en producción)
JWT_SECRET=tu_secreto_jwt_aqui

# Configuración SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_clave_de_aplicacion
EMAIL_FROM_NAME=SIFMO Sistema de Incidencias
EMAIL_FROM=tu_correo@gmail.com
```

### Configuración SMTP para Gmail

1. Activa la **Verificación en 2 pasos** en tu cuenta de Google
2. Ve a [Contraseñas de aplicación](https://myaccount.google.com/apppasswords)
3. Genera una contraseña de aplicación para "Correo"
4. Usa esa contraseña en `SMTP_PASS`

## Inicio del Servidor

```bash
# Inicio normal
node server.js

# Inicio con auto-reinicio en desarrollo (si tienes nodemon)
npx nodemon server.js
```

Al iniciar el servidor:
1. Se verifica la conexión a la base de datos SQLite
2. Se crean las tablas si no existen
3. se ejecutan migraciones incrementales
4. Se crea el usuario Administrador por defecto (si no existe)
5. Se verifica la conexión SMTP

## Puerto

El servidor escucha por defecto en el puerto `3000`. Puedes cambiarlo en la variable `PORT` del archivo `.env`.

## Licencia

Proyecto interno - Ferrominera Orinoco
