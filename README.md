# 📚 KBOOKS — Plataforma de gestión y venta de libros online

KBOOKS es una aplicación web completa (**Full Stack MERN**) que permite a usuarios explorar, comprar y reseñar libros, y a los administradores gestionar el catálogo, los usuarios, los pedidos y las estadísticas del sistema.


---

## 🧭 Índice

1. [🎯 Objetivo del proyecto]
2. [⚙️ Tecnologías y dependencias principales]
3. [🧩 Arquitectura del proyecto]
4. [🚀 Instalación y ejecución]
5. [📟 scripts de datos y automatización]
6. [👥 Flujo de usuario]
7. [🧑‍💼 Flujo de administrador]
8. [🔐 Seguridad y autenticación]  
9. [🎨 Diseño y experiencia de usuario]
10. [🧱 Uso de Styled Components)  
11. [🔗 Conexión con la API: uso de Axios]
12. [👍🏽 Conclusión personal.]

---

## 🎯 Objetivo del proyecto

El objetivo de **KBOOKS** es crear una plataforma funcional para la compra, venta y gestión de libros.  


---

## ⚙️ Tecnologías y dependencias principales

**Frontend**
- React 19  
- Vite  
- React Router 7  
- Styled Components  
- Axios  
- Recharts  

**Backend**
- Node.js  
- Express 5  
- MongoDB / Mongoose  
- Multer  
- JSON Web Token (JWT)  
- Bcrypt  
- CORS  
- Dotenv  

---

## 🧩 Arquitectura del proyecto

## 🧩 Arquitectura del proyecto

La aplicación se organiza en dos grandes módulos: **backend** (API REST con Node.js y Express) y **frontend** (SPA con React + Vite).  
A continuación, se muestra la estructura real del proyecto:

```bash
KBOOKS/
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── config/
│       │   └── db.js                 # Conexión a MongoDB
│       ├── controllers/
│       │   ├── adminController.js
│       │   ├── authController.js
│       │   ├── authorController.js
│       │   ├── bookController.js
│       │   ├── cartController.js
│       │   ├── messageController.js
│       │   ├── orderController.js
│       │   ├── reviewController.js
│       │   └── userController.js
│       ├── middlewares/
│       │   ├── isAdmin.js
│       │   ├── isAuth.js
│       │   ├── uploadAvatar.js
│       │   └── uploadCoverBook.js
│       ├── models/
│       │   ├── Author.js
│       │   ├── Book.js
│       │   ├── Cart.js
│       │   ├── Message.js
│       │   ├── Order.js
│       │   ├── Review.js
│       │   └── User.js
│       ├── routes/
│       │   ├── adminRoutes.js
│       │   ├── authRoutes.js
│       │   ├── authorRoutes.js
│       │   ├── bookRoutes.js
│       │   ├── cartRoutes.js
│       │   ├── messageRoutes.js
│       │   ├── orderRoutes.js
│       │   ├── reviewRoutes.js
│       │   └── userRoutes.js
│       ├── seeds/
│       │   ├── booksSeed.js
│       │   ├── authorsSeed.js
│       │   └── usersSeed.js
│       ├── scripts/
│       │   └── adminSetter.js        # Script para convertir usuario en administrador
│       │   └── randomizeSoldCount.js 
│       ├── uploads/                  # Carpeta para imágenes (portadas, autores, avatares)
│       ├── data/
│       │   └── books.csv             # Dataset de libros para importación inicial
│       └── server.js                 # Punto de entrada del backend
│
└── frontend/
    ├── index.html
    ├── package.json
    └── src/
        ├── api/
        │   └── archivosReferents a APIS.js              # Configuración de Axios y demas Apis utilizadas en proyecto
        ├── assets/
        │   └── imagenes usadas en UI              # Recursos gráficos
        ├── components/                            # Contiene aquellos componentes que afectan a la experiencia USER
        │   ├── authors/
        │   ├── books/
        │   ├── carrito/
        │   ├── carrouseles/
        │   ├── Prrofile/
        │   └── ... 
        ├── constants/
        │   └── media.js    
        ├── features/                            # Contiene los archivos principales, de las pages, views tanto en
        │   ├── admin/                           # experiencia USER como Admin
        │   ├── user/
        │   ├── auth/                  # Contiene archivos que almacenan la logica de registro o inicio de sesion
        │   └── AppRoutes.jsx         # Definición de rutas públicas y privadas
        ├── styles/
        │   ├── GlobalStyles.js
        │   └── theme.js
        ├── App.jsx                   # Estructura principal de la aplicación
        └── main.jsx                  # Punto de entrada de React/Vite

FrontEnd -> features: almacena TODAS LAS PAGES TANTO USER COMO ADMIN.
Dentro de las pertinetes carpetas user/admin. Estan divididas por carpetas cada una de las distintas Pges/views. 
En el caso de admin. Dentro de cada sub carpeta, se encuentran los componentes requeridos.
En el caso de user. Los componentes se encuentran fuera de features. En la carpeta src/components del front End.


## 🚀 Instalación y ejecución

### 🔧 Requisitos previos
Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Node.js (versión LTS o superior)**  
- **MongoDB** ejecutándose localmente o en un servicio remoto (por ejemplo, MongoDB Atlas)
- **npm** (instalado junto con Node.js)
- (Opcional) **Git**, para clonar y versionar el repositorio.

---

### ⚙️ Pasos de instalación

#### 1️⃣ Clonar el repositorio
```bash

git clone https://github.com/tu-usuario/kbooks.git
cd kbooks
```

### 2️⃣ Configurar el Backend
```bash
cd backend
npm install
```

Luego, crea un archivo .env  en la carpeta backend/ y completa las variables necesarias:
```bash

MONGODB_URI=mongodb+srv://KBOOKAdmin:1uMScuPHEGJtVP8d@kbookscluster00.4ranlxk.mongodb.net/?retryWrites=true&w=majority&appName=KBooksCluster00
JWT_SECRET=KBooksCluster00

SUPPORT_ADMIN_EMAIL=kbookhelp@kbook.com
ADMIN_EMAIL=kbookhelp@kbook.com
ADMIN_PASSWORD=HelpKbook123

Una vez configurado el entorno, inicia el servidor backend:
```bash

node src/server.js

El backend se ejecutará por defecto en:
👉 http://localhost:4000

### 3️⃣ Configurar el Frontend

En una nueva terminal:
```bash

cd frontend
npm install
npm run dev

El frontend se ejecutará por defecto en:
👉 http://localhost:5173

### 4️⃣ Usuario administrador y datos iniciales

🧠 Importante: El proyecto ya viene configurado y poblado con datos falsos.
No es necesario crear  un usuario administrador ni ejecutar scripts de seed.
Durante el proceso de desarrollo he implementado scripts de inicialización (seeders) que,
conectan con OpenLibrary para generar un catálogo de libros, autores y usuarios de prueba, 
además de crear un administrador principal que puede acceder directamente al panel de gestión.

### 📌 Credenciales del administrador:
```bash
Email: kbookhelp@kbook.com
Contraseña: HelpKbook123


### 5️⃣ Scripts de datos y automatización

Para documentar el proceso y mostrar el control técnico sobre los datos, se incluyen varios scripts de seed dentro de la carpeta backend/src/seeds/, y utilidades en backend/scripts/.
Estos scripts permiten regenerar o repoblar el sistema si fuera necesario:

- src/seeds/generateRealCsv.js : Genera un CSV con libros reales desde OpenLibrary.
- src/seeds/seed.js : Pobla la base de datos con autores y libros en distintos formatos.
- src/seeds/seedFakeUsers.js : Genera usuarios de prueba sin afectar al administrador principal.
- src/seeds/seedFakeReviews.js : Crea reseñas falsas y valoraciones aleatorias. 
- scripts/reset-all.js : Limpia completamente la base de datos (excepto el admin) para reiniciar el entorno.
 
- scripts/ensureAdmin.js : Crea o repara el usuario administrador en caso de que haya sido eliminado.


## 🧩 Todos los scripts usan variables definidas en el archivo .env del backend, que centraliza las credenciales de conexión y los datos del administrador:
```bash

MONGODB_URI=mongodb+srv://KBOOKAdmin:1uMScuPHEGJtVP8d@kbookscluster00.4ranlxk.mongodb.net/?retryWrites=true&w=majority&appName=KBooksCluster00
JWT_SECRET=KBooksCluster00

SUPPORT_ADMIN_EMAIL=kbookhelp@kbook.com
ADMIN_EMAIL=kbookhelp@kbook.com
ADMIN_PASSWORD=HelpKbook123


JWT_SECRET=KBooksCluster00
ADMIN_EMAIL=kbookhelp@kbook.com
ADMIN_PASSWORD=HelpKbook123


### 7️⃣ 👥 Flujo de usuario

El flujo de interacción de un **usuario estándar** dentro de la plataforma **KBOOKS** se centra en la exploración del catálogo, la gestión del carrito y la publicación de reseñas.

### 🧭 Etapas principales del flujo de usuario

1. **Registro o inicio de sesión**
   - **Rutas frontend:** `/register` y `/login`
   - **Controlador backend:** `authController.js`
   - **Archivos relacionados:**  
     - `/frontend/src/pages/Register.jsx`  
     - `/frontend/src/pages/Login.jsx`
   - El usuario se autentica mediante **JWT**.  
     El token se almacena en `sessionStorage` y se adjunta automáticamente en los headers (`Authorization: Bearer <token>`).

---

2. **Exploración del catálogo**
   - **Ruta:** `/books`
   - **Controlador backend:** `bookController.js`
   - El usuario puede navegar por el catálogo, aplicar filtros, buscar por título, categoría o autor, y ordenar resultados.  
   - **Archivos relacionados:**  
     - `/frontend/src/features/user/Sites/Books/Pagebooks/BooksPage.jsx`  - usada tras la busqueda de un ejemplar, 
                                                 - contiene carpeta "pageComponents" , que almacena componentes necesarios para el archivo
                                                 
     -`/frontend/src/features/user/Sites/Books/catalogBook`
           - contiene el archivo "BookCatalogView.jsx". Que muestra el catalogo de libros en grid y en list.
           - contiene carpeta "catalogComponents". Aguarda los componentes usados en el catalogo
           
     - `/frontend/src/components/BookCard.jsx`
     
     - `/frontend/src/features/user/Sites/Books/SingularBook/B -
           - contiene el archivo "BookSingularPage.jsx". Pagina de detalle del libro.
           - contiene carpeta "DetailComponents". Aguarda los componentes usados en el detalle.
           - **Visualización del detalle de un libro**
           - **Ruta:** `/book/:id`
           -    - **Controlador backend:** `bookController.js`
                 - Muestra información completa del libro, incluyendo:  
                 - Datos del autor (biografía y foto)  
                 - Formatos disponibles (tapa blanda, dura, eBook)  
                 - Precio, stock y sinopsis  
                 - Reseñas de otros usuarios
---

4. **Gestión del carrito y compra**
   - **Rutas:** `/cart` y `/checkout`
   - **Controladores backend:** `cartController.js` y `orderController.js`
   - El usuario puede añadir o eliminar libros del carrito, revisar el pedido y confirmar la compra.
   - **Archivos relacionados:**  
     - `/frontend/src/featues/user/saleProcess `- En esta carpeta, encontramos todo el proceso de compra de un o varios ejemplares.
     - Dividio por checkout Page y orderConfirm. Cada carpeta con su archivo padre correspondiente y los pertinentes hijos que hacen posible el proceso.

---

5. **Gestión del perfil**
   - **Ruta:** `/profile`
   - **Controlador backend:** `userController.js`
   - El usuario puede editar su información personal y subir un avatar propio.
   - **Archivos relacionados:**  
     - `/frontend/src/featues/user/ProfileSite`
     - En esta carpeta encontramos :
        - El archivo "Mis Libros page"-> biblioteca del usuario
        -Profile Page, que se llena de sus componentes situados fuera de la carpeta features. 
        - ruta para componentes de profil user - `ruta: src/components/profile/`-

---

6. **Publicación de reseñas**
   - **Ruta:** `/reviews`
   - **Controlador backend:** `reviewController.js`
   - El usuario puede dejar una reseña en los libros adquiridos, incluyendo comentario y puntuación (1–5 estrellas).
   - **Archivos relacionados:**  
     - `/frontend/src/featues/user/Reviews/`
         - carpeta donde se encuentra el archivo de reviewsPage general, el archivo que almacena las reviewsPorLibro : "BookReveiwsPage"
         - dentro de la misma carpeta, tenemos los componentes referentes a los dos archivos citados.
         - componentes generales de reviews en  - `ruta: src/components/review/

---

7. **Mensajeria interna**
### 💬 Flujo de mensajes (usuario)

El sistema de mensajería permite a los usuarios autenticados comunicarse con el administrador o con mismos usuarios a través de un formulario de contacto integrado en la plataforma.

#### 🧭 Etapas del flujo

1. **Acceso al formulario de contacto**
   - **Ruta frontend:** `/contact`
   - **Archivo:** `/frontend/src/pages/Contact.jsx`
   - El usuario autenticado puede enviar un mensaje al administrador.  
   - El formulario incluye los campos:
     - Nombre  
     - Email  
     - Asunto  
     - Mensaje

2. **Envío del mensaje**
   - **Método HTTP:** `POST /api/messages`
   - **Controlador backend:** `messageController.js`
   - El mensaje se almacena en la base de datos con el ID del usuario remitente (`req.user._id`).

3. **Confirmación al usuario**
   - Si el envío es exitoso, el usuario recibe una notificación visual (`toast` o alerta) indicando que el mensaje ha sido recibido correctamente.

4. **Persistencia y acceso**
   - Los mensajes quedan registrados en la colección `messages` de MongoDB.
   - Cada mensaje incluye:
     - Remitente (`userId`)  
     - Fecha (`createdAt`)  
     - Estado (`pendiente`, `respondido`, etc., según la implementación)  
     - Contenido (`subject`, `body`)
     
 5. Mensajeria interna con otro usuario.
     -Los mensajes pueden enviarse gracias al archivo "InboxUser.jsx"
     - Sigue la metodologia de envio al admin. Pero desde la ventana "mensajes" Con la posibilidad de elegir un usuario destinatario, distinto al administrador.
---
  
### 🔁 Flujo general del usuario

```text
Registro/Login → Catálogo → Detalle del libro → Carrito → Compra → Perfil → Reseñas



### 8️⃣ 🧑‍💼 Flujo de administrador


El **administrador** dispone de un panel completo de control que le permite gestionar todos los recursos del sistema: libros, autores, usuarios, reseñas y mensajes enviados por los clientes.  
Este panel está protegido mediante autenticación **JWT** y middleware de autorización (`isAdmin`), asegurando que solo los usuarios con rol **admin** puedan acceder.

---

### 🧭 Etapas principales del flujo administrativo

1. **Inicio de sesión (rol administrador)**
   - **Ruta:** `/login`
   - **Middleware:** `isAdmin.js`
   - El backend valida que el usuario tenga rol `admin` antes de permitir el acceso al panel.  
   - **Credenciales preconfiguradas:**
     ```
     Email: kbookhelp@kbook.com
     Contraseña: HelpKbook123
     ```
   - Tras iniciar sesión, el sistema genera un token JWT con el campo `role: 'admin'` y redirige automáticamente al dashboard administrativo.

---

2. **Dashboard principal**
   - **Ruta:** `/admin/dashboard`
   - **Archivo frontend:** `/frontend/src/features/admin/pages/adminHome`
   - **Controladores backend:** `bookController.js`, `orderController.js`
   - Muestra métricas globales del sistema:
     - Total de libros disponibles y autores registrados.  
     - Libros más vendidos (`soldCount`).  
     - Número de usuarios activos.  
     - Estadísticas de ventas y reseñas.  
   - Usa **Recharts** para representar gráficas dinámicas y visuales.

---

3. **Gestión de libros**
   - **Ruta:** `/admin/books`
   - **Archivo frontend:** `/frontend/src/features/admin/pages/books/`
   - **Controlador backend:** `bookController.js`
   - CRUD completo sobre los libros del catálogo:
     - Crear nuevos libros con portada y sinopsis.  
     - Editar precios, stock, categorías y formatos (tapa blanda, dura, ebook).  
     - Eliminar libros innecesarios del catálogo.  
   - Se utilizan formularios dinámicos y subida de portadas mediante **Multer**.

---

4. **Gestión de autores**
   - **Ruta:** `/admin/authors`
   - **Archivo frontend:** `/frontend/src/features/admin/pages/authors.jsx`
   - **Controlador backend:** `authorController.js`
   - CRUD completo de autores:
     - Añadir nuevos autores con biografía y foto.  
     - Editar o eliminar registros existentes.  
   - La foto de autor se almacena en `/uploads/authors/` y se sirve desde Express.

---

5. **Gestión de usuarios**
   - **Ruta:** `/admin/users`
   - **Archivo frontend:** `/frontend/src/features/admin/pages/users/`
   - **Controlador backend:** `userController.js`
   - Permite al administrador:
     - Consultar la lista completa de usuarios.  
     - Bloquear o desbloquear cuentas.  
     - Modificar roles (promover o degradar usuarios).  
     - Eliminar usuarios inactivos.  
   - El backend protege esta ruta mediante los middlewares `isAuth` + `isAdmin`.

---

6. **Gestión de reseñas**
   - **Ruta:** `/admin/reviews`
   - **Archivo frontend:** `/frontend/src/featues/admin/pages/reviews.jsx`
   - **Controlador backend:** `reviewController.js`
   - Funcionalidades disponibles:
     - Consultar todas las reseñas publicadas por los usuarios.  
     - Eliminar reseñas inapropiadas.  
     - Filtrar reseñas por libro o usuario.  
   - Se asegura integridad de datos mediante `populate()` en MongoDB para mostrar el título del libro y el nombre del autor.

---

7. **Gestión de mensajes (mensajería interna)**
   - **Ruta:** `/admin/messages`
   - **Archivo frontend:** `/frontend/src/features/admin/contact/`
   - **Controlador backend:** `messageController.js`
   - El administrador puede visualizar y gestionar los mensajes enviados desde el formulario de contacto del usuario.
   - Funcionalidades incluidas:
     - Ver todos los mensajes recibidos.  
     - Leer el contenido completo y los datos del remitente (nombre, correo).  
     - Marcar mensajes como **leídos** o **respondidos**.  
     - Eliminar mensajes antiguos o duplicados.  
   - Los mensajes se obtienen mediante:
     ```http
     GET /api/messages
     ```
     y se gestionan individualmente con:
     ```http
     PATCH /api/messages/:id
     DELETE /api/messages/:id
     ```
   - Toda la sección está protegida con `isAdmin` y requiere autenticación JWT.

---

8. **Gestión de archivos e imágenes**
   - **Middleware:** `multerConfig.js`
   - **Ubicación de almacenamiento:** `/backend/src/uploads/`
   - Permite la subida de:
     - Portadas de libros.  
     - Fotos de autores.  
     - Avatares de usuario.  
   - Los archivos se sirven estáticamente mediante:
     ```js
     app.use('/uploads', express.static('src/uploads'))
     ```

---

### 🔁 Flujo general del administrador

```text
Login (admin)
    ↓
Dashboard general
    ↓
Gestión de libros ───▶ Gestión de autores ───▶ Gestión de usuarios
    ↓
Gestión de reseñas ───▶ Gestión de mensajes
    ↓
Estadísticas y control global del sistema



 ##9️⃣ 🎨 Diseño y experiencia de usuario

El diseño del proyecto **KBOOKS** se ha centrado en lograr una interfaz limpia, moderna y completamente funcional tanto en escritorio como en dispositivos móviles.  
El objetivo ha sido ofrecer una experiencia de usuario intuitiva, fluida y visualmente agradable, manteniendo la coherencia con la temática de una librería digital.

---

### 1️⃣0️⃣ ️⃣🧱 Uso de Styled Components

Este es el **primer proyecto** en el que se ha implementado **`styled-components`**, una librería que permite escribir estilos directamente dentro de los archivos de componentes React mediante *CSS-in-JS*.

> Aunque inicialmente la adaptación fue un reto, el resultado final ha sido muy positivo:
> - **Mayor modularidad:** los estilos están completamente encapsulados dentro del componente.  
> - **Menos archivos CSS separados:** mejora la organización y facilita el mantenimiento.  
> - **Temas globales:** se ha aplicado un `ThemeProvider` con colores, tipografía y sombras coherentes en todo el sitio.  
> - **Composición dinámica:** permite modificar estilos en función del estado o props del componente, sin necesidad de clases adicionales.  

###1️⃣1️⃣ 🔗 Conexión con la API: uso de Axios

Para la comunicación entre el frontend y el backend, se ha utilizado Axios, una librería HTTP que ofrece una sintaxis más clara y flexible que fetch.
La configuración se centraliza en /frontend/src/api/index.js, donde se define la URL base de la API y se añaden interceptores automáticos para incluir el token JWT.

### ️1️⃣2️⃣ Conclusión personal.

No me esperaba que este proyecto me llebara tanto tiempo. Siendo sincero, el resultado final deja que desear teniendo en cuenta que casi han pasado 5/6 meses desde que lo empecé. 
El proyecto no es de mi agrado. Siento que a dia de hoy podria explorar otras opciones y podria ofrecer un resultado más profesional. 
Pero antes de empezar el proyecto se me hacia una montaña lo que a dia de hoy me parece dos tardes de faena bien organizada.
He aprendido nuevas tecnicas, nuevos metodos, nuevas librerias. He aprendido por encima de lo que me esperaba y por ello salgo satisfecho con la entrega. 

Hay muchisimos puntos que mejoraria. Empezaria por distribucion estética, un fondo oscuro como principal. Saldria de la cuadriculación constante de elementos. 
Añadiria funcionalidades, tanto en user como admin. Registro de pedidos real para usuario, Preferencias avanzadas en los dos perfiles tanto user como administrador. 
Seccion de administrador para contactar con el proveedor de libros. Inventario real de los ejemplares...

Importante mejorar en la estructruacion del proyecto desde un inicio. Para evitar carpetas y carpetas.
Enfin, una larga lista de aspectos que he tenido que dejar en la libreta porque se me tiraba el tiempo encima, y creo que con la entrega paso los requisitos para conseguir el aprobado. (No busco el aprobado y ya esta, por supuesto, pero si que tiene su cierta necesariedad para el titulo, a fin de cuentas lo que te dirije hacia la excelencia es la constancia y el trabajo, entiendo )

Agradecer a el profesorado por la dedicacion sobre nuestro trabajo.

Espero que les convenza la entrega. 





