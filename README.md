# 🔥 Fogón — Red social scout

Trabajo Práctico 2 — Programación IV (A344).

Red social para scouts: publicar las historias de salidas y campamentos, sumar "leña" (me gusta) y charlar en "la ronda" (comentarios).

- **App:** [completar URL del front]
- **API:** https://fogon-api.vercel.app
- **Notas técnicas:** [docs/notas-tecnicas.md](docs/notas-tecnicas.md)

---

## Tecnologías

| Parte | Tecnologías |
|---|---|
| Front | Angular 22 (standalone, Signal Forms) |
| Back | NestJS 12, Mongoose, JWT, bcryptjs, class-validator |
| Base de datos | MongoDB Atlas |
| Imágenes | Cloudinary |
| Deploy | Vercel |

---

## Estructura del repositorio

```
proyectoRedSocial/
├── fogon-back/    API en NestJS
├── fogon-front/   App en Angular
└── docs/          Notas técnicas
```

---

## Cómo correrlo

### Back

```bash
cd fogon-back
npm install
npm run start:dev
```

Crear `fogon-back/.env` a partir de `.env.example`:

```
MONGO_URL=
JWT_SECRET=
FRONT_URL=http://localhost:4200
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
IMAGEN_PERFIL_DEFECTO=
```

Queda en `http://localhost:3000`.

### Front

```bash
cd fogon-front
npm install
ng serve
```

Queda en `http://localhost:4200`.

---

## API

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/registro` | Registro (form-data, imagen opcional) |
| POST | `/auth/login` | Login por correo o nombre de usuario |
| POST | `/auth/autorizar` | Valida el token y devuelve el usuario |
| POST | `/auth/cerrar-sesion` | Cierra la sesión |

---

## Estado del proyecto

### ✅ Sprint 1 — Registro, login y estructura

**Back**
- [x] Proyecto NestJS con módulos Publicaciones, Autenticación y Usuarios
- [x] Registro con validación, contraseña encriptada e imagen de perfil en Cloudinary
- [x] Login por correo o nombre de usuario, que devuelve los datos del usuario
- [x] Perfil "usuario" por defecto, con opción "administrador"
- [x] Deploy en Vercel

**Front**
- [x] Proyecto Angular
- [x] Pantallas Registro, Login, Publicaciones y Mi perfil
- [x] Navegación entre componentes
- [x] Favicon propio
- [x] Login y registro con validaciones y mensajes
- [x] Modales propios (sin `alert()`)
- [x] Deploy en Vercel

### ⬜ Sprint 2 — Publicaciones y me gusta
### ⬜ Sprint 3 — Comentarios y sesión
### ⬜ Sprint 4 — Administración, estadísticas y PWA
### ⬜ Sprint 5 — Perfiles públicos y nuevas estadísticas
### ⬜ Sprint 6 — Guardados y compartidos
