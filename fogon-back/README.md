# 🔥 Fogón — Red social scout

Trabajo Práctico 2 — Programación IV (A344).

Red social para scouts: cada persona comparte las bitácoras de sus salidas, campamentos y actividades, suma "leña" (me gusta) a las publicaciones de los demás y charla en "la ronda" (comentarios). La temática le da identidad propia: no es una copia de una red existente, sino un fogón digital donde se juntan las historias del movimiento.

- **URL del front:** _pendiente (Vercel)_
- **URL del back:** _pendiente (Vercel)_
- **Repositorio:** _pendiente_

---

## 1. Tecnologías

| Tecnología | Uso |
|---|---|
| **Angular** (standalone components) | Frontend |
| **NestJS 12** (ESM) | Servidor propio con API REST |
| **MongoDB Atlas** + **Mongoose** | Base de datos |
| **@nestjs/config** | Variables de entorno (`.env`) |
| **@nestjs/jwt** | Tokens JWT de 15 minutos |
| **cookie-parser** | Lectura del token desde una cookie `httpOnly` |
| **class-validator** + **class-transformer** | Validación de los datos que llegan a la API |
| **bcryptjs** | Encriptación de contraseñas |
| **Multer** (incluido en `@nestjs/platform-express`) | Recepción de archivos en memoria |
| **Cloudinary** | Almacenamiento de imágenes (perfil y publicaciones) |
| **Vercel** | Deploy del front y del back |

> **Nota sobre `bcryptjs`:** se eligió en lugar de `bcrypt` porque es JavaScript puro. `bcrypt` compila código nativo al instalarse y puede fallar con Node 26 o en el entorno serverless de Vercel. La API es la misma (`hash` / `compare`).

---

## 2. Instalación y ejecución

### Back (`fogon-back`)

```bash
npm install
```

Crear un archivo `.env` en la raíz (hay un `.env.example` con los nombres):

```
MONGO_URL=mongodb+srv://usuario:clave@cluster.xxxxx.mongodb.net/fogon?retryWrites=true&w=majority
JWT_SECRET=una-frase-larga-y-secreta
FRONT_URL=http://localhost:4200
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

```bash
npm run start:dev
```

El servidor queda en `http://localhost:3000`.

**Configuración necesaria en MongoDB Atlas:** en *Network Access* debe estar habilitado `0.0.0.0/0`, porque Vercel no tiene una IP fija.

### Front (`fogon-front`)

_Pendiente._

---

## 3. Arquitectura del back

### 3.1 Estructura de carpetas

```
src/
├── main.ts                  # ValidationPipe (whitelist), cookieParser, CORS
├── app.module.ts            # ConfigModule global + conexión a Mongo
├── auth/
│   ├── auth.module.ts       # JwtModule (15 min), importa usuarios e imágenes
│   ├── auth.controller.ts   # registro, login, autorizar, cerrar-sesion
│   ├── auth.service.ts      # lógica de registro, login y token
│   ├── payload-token.ts     # forma del contenido del JWT
│   ├── usuario-actual.decorator.ts
│   ├── guards/auth.guard.ts # valida el token de la cookie
│   └── dto/                 # registro.dto.ts, login.dto.ts
├── usuarios/
│   ├── usuarios.module.ts   # registra el schema y exporta el servicio
│   ├── usuarios.service.ts  # crear, buscar, verificar duplicados
│   ├── usuarios.controller.ts
│   └── schemas/usuario.schema.ts
├── imagenes/
│   ├── imagenes.module.ts
│   ├── imagenes.service.ts  # sube archivos a Cloudinary
│   └── opciones-imagen.ts   # 2 MB, solo JPG / PNG / WEBP
└── publicaciones/           # Sprint 2
```

### 3.2 Capas y flujo

```
Cliente ──▶ main.ts ──▶ Controller ──▶ Service ──▶ Mongo / Cloudinary
          (validación,   (recibe y      (lógica de
           cookies, CORS) responde)      negocio)
```

- **Controllers:** solo reciben la request y devuelven la respuesta con el status correcto.
- **Services:** toda la lógica. `AuthService` no toca la base directamente: le pide a `UsuariosService` que cree o busque usuarios.
- **Schemas:** definen cómo se guarda cada entidad en Mongo.
- **DTOs:** definen qué datos acepta cada ruta y con qué reglas.
- **Guards:** deciden si una request puede pasar.

### 3.3 Módulos

| Módulo | Responsabilidad |
|---|---|
| `auth` | Registro, login, validación y cierre de sesión |
| `usuarios` | Schema de usuario y acceso a la colección `usuarios`. En el Sprint 4: ABM para administradores |
| `imagenes` | Subida de archivos a Cloudinary, reutilizada por auth y publicaciones |
| `publicaciones` | Publicaciones, me gusta y comentarios (Sprints 2 y 3) |

### 3.4 Modelo de datos

**Usuario** (`usuarios`)

| Campo | Tipo | Detalle |
|---|---|---|
| `nombre`, `apellido` | string | Obligatorios |
| `correo` | string | Único, en minúsculas |
| `nombreUsuario` | string | Único, en minúsculas |
| `password` | string | Hash de bcrypt, `select: false` (nunca se devuelve) |
| `fechaNacimiento` | Date | Obligatoria |
| `descripcion` | string | Hasta 200 caracteres |
| `imagenPerfil` | string | URL de Cloudinary |
| `perfil` | `'usuario'` \| `'administrador'` | Por defecto `'usuario'` |
| `activo` | boolean | Por defecto `true` (baja lógica, Sprint 4) |
| `createdAt`, `updatedAt` | Date | Automáticos (`timestamps`) |

---

## 4. API

### Autenticación (`/auth`)

| Ruta | Body | Respuesta correcta | Errores |
|---|---|---|---|
| `POST /auth/registro` | form-data: `nombre`, `apellido`, `correo`, `nombreUsuario`, `password`, `fechaNacimiento`, `descripcion`, `imagen` (archivo) | **201** + usuario + cookie `token` | 400 datos inválidos o falta imagen · 409 correo o usuario repetido · 413 imagen de más de 2 MB |
| `POST /auth/login` | JSON: `identificador` (correo **o** usuario), `password` | **200** + usuario + cookie `token` | 400 campos vacíos · 401 credenciales incorrectas · 403 cuenta deshabilitada |
| `POST /auth/autorizar` | — (usa la cookie) | **200** + datos del usuario | 401 sin sesión o token vencido/inválido |
| `POST /auth/cerrar-sesion` | — | **204**, borra la cookie | — |

En ninguna respuesta viaja la contraseña.

---

## 5. Decisiones técnicas

**1. Proyecto ESM (Nest 12).** El CLI de Nest 12 genera el proyecto con módulos ES: los imports de archivos propios terminan en `.js` aunque el archivo sea `.ts`. Los tipos que solo se usan como tipo (`HydratedDocument`, `Response`, `PayloadToken`) se importan con `import type`, porque el proyecto usa `isolatedModules` + `emitDecoratorMetadata`.

**2. Conexión a Mongo con `forRootAsync`.** En la clase de cookies se usó `MongooseModule.forRoot(process.env.MONGO_URL!)`, que depende de que `ConfigModule` se cargue antes en el array de imports. Con `forRootAsync` + `ConfigService`, Nest espera a que la configuración esté lista. Lo mismo para `JwtModule.registerAsync`.

**3. El schema de usuario vive en `usuarios`, no en `auth`.** `UsuariosModule` exporta su servicio y `AuthModule` lo importa (el mismo patrón de `exports: [AlumnoService]` de `nest1`). Así, cuando llegue el ABM de usuarios del Sprint 4, toda la lógica de usuarios está en un solo lugar.

**4. Unicidad de correo y nombre de usuario.** El schema tiene `unique: true` + `lowercase` + `trim`, de modo que `Joni@Gmail.com ` y `joni@gmail.com` cuentan como el mismo correo. Antes de crear un usuario se verifica la disponibilidad (409 Conflict con un mensaje claro), y el error `11000` de Mongo también se traduce a 409 por si dos registros llegan al mismo tiempo.

**5. `whitelist: true` en el `ValidationPipe`.** Descarta cualquier campo que no esté en el DTO. Sin esto, cualquiera podría registrarse mandando `perfil: "administrador"` desde Postman.

**6. Contraseña con tres validaciones separadas.** Mínimo 8 caracteres, una mayúscula y un número, cada una con su propio mensaje, para que el usuario sepa exactamente qué le falta.

**7. La contraseña nunca sale de la base.** `select: false` en el schema la excluye de todas las consultas; solo el login la pide con `.select('+password')`. Después de un `create`, `sinPassword()` la quita del objeto antes de responder.

**8. Login por correo o nombre de usuario.** Un único campo `identificador` y una consulta con `$or`. Si el usuario no existe o la contraseña está mal, el mensaje es el mismo (401), para no revelar qué cuentas existen.

**9. Status HTTP correctos.** El código de la clase usaba `throw new Error()`, que devuelve 500. Acá se usan las excepciones de Nest: 400 (`ValidationPipe`), 401 (`UnauthorizedException`), 403 (`ForbiddenException`), 409 (`ConflictException`), 413 (límite de Multer). El login devuelve 200 con `@HttpCode(HttpStatus.OK)`, porque no crea nada; el registro devuelve 201.

**10. Token en cookie `httpOnly`.** Como en la clase de cookies, el token no viaja en el body sino en una cookie que el JavaScript del front no puede leer, lo que protege contra robo por XSS. Dura 15 minutos, igual que el JWT. Para borrarla, `cerrar-sesion` usa exactamente las mismas opciones con las que se creó (`opcionesCookie()`), porque si no coinciden el navegador la ignora.

**11. Cookie `strict` + `secure`, como en la clase de cookies.** La cookie se configura igual en local y en producción: `httpOnly: true`, `secure: true`, `sameSite: 'strict'`. Funciona porque el navegador siempre ve al front y al back como el mismo sitio:
- **En local**, `localhost:4200` y `localhost:3000` son el mismo sitio (el puerto no cuenta), y los navegadores aceptan cookies `secure` en `http://localhost`.
- **En Vercel**, el front reenvía las llamadas `/api/...` al back con un *rewrite* (`vercel.json`), así que el navegador solo ve el dominio del front.
Se descartó deployar con dos URLs y `sameSite: 'none'`: la cookie pasaría a ser de terceros, y Safari (iPhone y Mac) las bloquea por defecto, así que el login fallaría ahí. CORS usa `credentials: true` y el origen exacto del front (con credentials no se permite `*`); en local es necesario porque cambia el puerto.

**12. El payload del JWT lleva el rol.** `sub` (id), `nombreUsuario` y `perfil`. El guard de administrador del Sprint 4 puede verificar el rol sin consultar la base.

**13. `autorizar` vuelve a consultar la base.** La consigna pide devolver los datos del usuario, y además así una cuenta deshabilitada por el admin queda rechazada en el acto, aunque su token todavía no haya vencido.

**14. Decorador `@UsuarioActual()`.** Un decorador de parámetro propio que devuelve el payload que el `AuthGuard` dejó en la request. Evita repetir `@Req() req` + `req.usuario` en cada ruta protegida.

**15. Imágenes en Cloudinary, en memoria.** Vercel no tiene disco persistente, así que Multer guarda el archivo en memoria y se envía con `upload_stream`. Se aceptan solo JPG, PNG y WEBP de hasta 2 MB (Vercel corta las requests de más de 4,5 MB). El módulo `imagenes` y `opcionesImagen` se reutilizan en publicaciones.

**16. Verificar antes de subir.** En el registro primero se comprueba que el correo y el usuario estén libres y recién después se sube la imagen. Si no, un registro duplicado dejaría una foto huérfana en Cloudinary.

**17. Campos pensados para sprints futuros.** `activo` (baja lógica de usuarios, Sprint 4) y `timestamps` (estadísticas por rango de fechas, Sprint 4) se agregaron desde el Sprint 1 para no tener que migrar datos después.

---

## 6. Limitaciones conocidas

- **Imagen de perfil obligatoria.** La consigna pide recibirla en el registro. Si se decidiera hacerla opcional, alcanza con usar una imagen por defecto subida a Cloudinary.
- **Imágenes huérfanas en casos extremos.** Si dos personas se registran con el mismo correo en el mismo instante, la verificación previa puede pasar para ambas y una foto queda en Cloudinary sin usuario.
- **Cuenta deshabilitada con token vigente.** `autorizar` la rechaza en el acto, pero otras rutas que solo usan el `AuthGuard` la dejarían pasar hasta que venza el token (máximo 15 minutos).

---

## 7. Estado del proyecto

### 🟡 Sprint 1 — Registro, login y estructura

**Back**
- [x] Proyecto NestJS creado
- [x] Módulos: Publicaciones, Autenticación, Usuarios
- [x] Conexión a MongoDB Atlas
- [x] Registro por POST: valida los datos y guarda el usuario
- [x] Contraseña encriptada (bcryptjs)
- [x] Imagen de perfil guardada en Cloudinary y su URL en la base
- [x] Login por POST con correo o nombre de usuario
- [x] Login compara la contraseña encriptada y devuelve todos los datos del usuario
- [x] Correo y nombre de usuario únicos
- [x] Perfil "usuario" por defecto, con opción "administrador"
- [ ] Deploy en Vercel

**Front**
- [ ] Proyecto Angular creado
- [ ] Pantallas: Registro, Login, Publicaciones, MiPerfil
- [ ] Navegación entre componentes
- [ ] Favicon propio
- [ ] Login con validaciones (8 caracteres, una mayúscula, un número)
- [ ] Registro con validaciones y todos los campos (incluido repetir contraseña y la imagen)
- [ ] Modales propios en lugar de `alert()`
- [ ] Deploy en Vercel

### ⬜ Sprint 2 — Publicaciones y me gusta

**Back**
- [ ] Alta de publicación (título, mensaje, imagen opcional) relacionada al usuario
- [ ] Baja lógica, solo por el autor o un administrador
- [ ] Listado con orden por fecha o por me gusta, filtro por usuario, `offset` y `limit`
- [ ] Dar me gusta (uno por usuario por publicación)
- [ ] Quitar me gusta (solo si se había dado)

**Front**
- [ ] Listado ordenado por fecha, con opción por cantidad de me gusta
- [ ] Paginación
- [ ] Cada publicación es un componente
- [ ] Dar y quitar me gusta
- [ ] Eliminar mis propias publicaciones
- [ ] Mi Perfil: todos los datos, foto y últimas 3 publicaciones con sus comentarios

### ⬜ Sprint 3 — Comentarios y sesión

**Back**
- [ ] Comentarios: GET paginado (más recientes primero), POST con usuario y fecha, PUT con `modificado: true`
- [x] JWT con usuario y rol, vencimiento a los 15 minutos, devuelto por cookie
- [x] `POST /auth/autorizar`
- [ ] `POST /auth/refrescar`

**Front**
- [ ] Página de publicación con sus comentarios y botón "cargar más"
- [ ] Escribir y editar comentarios (con aviso de editado)
- [ ] Token guardado por cookie al hacer login y registro
- [ ] Pantalla de cargando con spinner que valida el token contra `autorizar`
- [ ] Contador de 10 minutos con modal para extender la sesión
- [ ] Redirección al login ante un 401

### ⬜ Sprint 4 — Administración, estadísticas y PWA

**Back**
- [ ] Usuarios (solo administrador): listado, alta con elección de perfil, baja y alta lógica
- [x] Login bloqueado para usuarios deshabilitados, con aviso
- [ ] Estadísticas (solo administrador): publicaciones por usuario, comentarios y comentarios por publicación, en un rango de fechas

**Front**
- [ ] Botones de administrador para dar de baja cualquier publicación
- [ ] Dashboard de usuarios con formulario de alta y radio buttons de perfil
- [ ] Dashboard de estadísticas con gráficos de distintos tipos
- [ ] PWA
- [ ] 3 pipes propios
- [ ] 3 directivas propias

### ⬜ Sprint 5 — Perfiles públicos y nuevas estadísticas (recuperatorio)

**Back**
- [ ] Registro de ingresos, visitas al perfil y me gusta por día

**Front**
- [ ] Perfil de otros usuarios (datos y últimas 3 publicaciones), con acciones de administrador
- [ ] Scroll infinito en publicaciones
- [ ] Gráficos: ingresos por usuario, visitas a mi perfil, me gusta por día

### ⬜ Sprint 6 — Guardados y compartidos (fecha de final)

**Back**
- [ ] Guardar y quitar una publicación de guardados
- [ ] Compartir una publicación con otro usuario
- [ ] Listado de publicaciones compartidas conmigo y quién las compartió
- [ ] Nuevos ordenamientos: por veces guardada y por veces compartida

**Front**
- [ ] Guardar y quitar guardado, indicando el estado
- [ ] Pantalla de guardados
- [ ] Botón compartir con selección de usuario
- [ ] Pantalla de compartidos, con quién compartió cada publicación
- [ ] Nuevos ordenamientos

---

## 8. Pendientes de diseño

- Agregar al perfil los campos scout opcionales `grupo` (grupo scout) y `rama` (Manada, Unidad, Caminantes, Rovers, Dirigente).
- Definir la estructura de repositorios (front y back).
