# Inventario Backend - API RESTful para Gestión de Inventarios

Este proyecto es una API RESTful robusta y escalable diseñada para la gestión de inventarios. Proporciona funcionalidades completas para la autenticación de usuarios, la administración de categorías y productos, incluyendo la carga de imágenes, **y ahora con un sistema avanzado de gestión de stock, movimientos y transacciones atómicas**. La API está construida con Node.js, Express.js y PostgreSQL, y cuenta con documentación interactiva a través de Swagger UI.

## 🌟 Características Principales

-   **Autenticación de Usuarios:** Registro y login de usuarios con JWT (JSON Web Tokens).
-   **Autorización:** Control de acceso basado en roles para proteger rutas sensibles.
-   **Gestión de Productos (CRUD):** Operaciones completas para crear, leer, actualizar y eliminar productos.
-   **Gestión de Categorías (CRUD):** Operaciones completas para crear, leer, actualizar y eliminar categorías.
-   **Gestión de Inventario Pro:** Endpoints especializados para vender productos (`sell`) y reabastecer stock (`add-stock`) con validaciones de reglas de negocio.
-   **Trazabilidad y Auditoría:** Registro automático de cada movimiento de stock en un historial detallado (quién, cuándo, cuánto y por qué).
-   **Integridad de Datos:** Implementación de **Transacciones de Base de Datos (Sequelize Transactions)** para asegurar la consistencia absoluta entre el stock y el historial de movimientos.
-   **Carga de Imágenes:** Integración con Cloudinary para el almacenamiento y gestión de imágenes de productos.
-   **API RESTful:** Diseño de API siguiendo principios REST para una comunicación clara y eficiente.
-   **Base de Datos PostgreSQL:** Uso de Sequelize como ORM para una interacción robusta con la base de datos relacional.
-   **Documentación Interactiva:** Acceso a la documentación de la API mediante Swagger UI para facilitar la exploración y prueba de los endpoints.

## 🚀 Tecnologías Utilizadas

-   **Node.js**: Entorno de ejecución JavaScript.
-   **Express.js**: Framework web para Node.js, para construir la API de manera rápida y eficiente.
-   **PostgreSQL**: Sistema de gestión de bases de datos relacionales.
-   **Sequelize**: ORM (Object-Relational Mapper) para Node.js, que facilita la interacción con bases de datos SQL como PostgreSQL. Se utilizan **Transacciones SQL** para operaciones críticas de inventario.
-   **JSON Web Tokens (JWT)**: Para la autenticación segura y la gestión de sesiones de usuario.
-   **Bcryptjs**: Librería para el hashing de contraseñas, garantizando un almacenamiento seguro.
-   **Cloudinary**: Servicio en la nube para la gestión y optimización de imágenes.
-   **Multer**: Middleware de Express para manejar `multipart/form-data`, utilizado principalmente para la carga de archivos (imágenes).
-   **Dotenv**: Para cargar variables de entorno desde un archivo `.env`, manteniendo la configuración sensible fuera del control de versiones.
-   **CORS**: Middleware para habilitar el Cross-Origin Resource Sharing.
-   **Helmet**: Middleware para mejorar la seguridad de la aplicación mediante la configuración de cabeceras HTTP.
-   **Morgan**: Middleware para el registro de solicitudes HTTP, útil para el desarrollo y la depuración.
-   **Swagger-jsdoc**: Genera la especificación OpenAPI (Swagger) a partir de comentarios JSDoc en el código.
-   **Swagger-ui-express**: Sirve la interfaz de usuario de Swagger para visualizar y probar la API.
-   **Nodemon**: Herramienta de desarrollo que reinicia automáticamente el servidor al detectar cambios en los archivos.

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

-   **Node.js**: [Versión LTS recomendada](https://nodejs.org/es/download/)
-   **npm** (viene con Node.js) o **Yarn**
-   Una instancia de **PostgreSQL**: Puede ser local (usando Docker, PostgreSQL App, o instalación nativa) o en la nube (como ElephantSQL, Heroku Postgres, Neon, Render PostgreSQL).
-   Una cuenta de **Cloudinary**: [Regístrate aquí](https://cloudinary.com/users/register/with_google) para obtener tus credenciales.

## ⚙️ Instalación y Configuración

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local:

### 1. Clonar el Repositorio

```bash
git clone https://github.com/diegopresent/inventario-backend.git
cd inventario-backend
```

### 2. Instalar Dependencias

```bash
npm install
# o si usas yarn
# yarn install
```

### 3. Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (al mismo nivel que `package.json`) y configura las siguientes variables:

```dotenv
PORT=3000
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="una_cadena_secreta_fuerte_para_jwt"
CLOUDINARY_CLOUD_NAME="tu_cloud_name_de_cloudinary"
CLOUDINARY_API_KEY="tu_api_key_de_cloudinary"
CLOUDINARY_API_SECRET="tu_api_secret_de_cloudinary"
```

-   `PORT`: El puerto en el que la API escuchará las solicitudes (por defecto 3000).
-   `DATABASE_URL`: La cadena de conexión a tu base de datos PostgreSQL.
    -   **Nota para servicios como Neon/Render:** Si tu URL de PostgreSQL comienza con `postgresql://`, el código lo ajustará automáticamente a `postgres://` para compatibilidad con Sequelize. Asegúrate de incluir los parámetros SSL si tu proveedor lo requiere (ej. `?sslmode=require`).
-   `JWT_SECRET`: Una cadena de texto secreta y fuerte utilizada para firmar los tokens JWT. Es crucial para la seguridad de la aplicación.
-   `CLOUDINARY_CLOUD_NAME`: Tu "Cloud Name" de Cloudinary.
-   `CLOUDINARY_API_KEY`: Tu "API Key" de Cloudinary.
-   `CLOUDINARY_API_SECRET`: Tu "API Secret" de Cloudinary.

### 4. Conexión y Sincronización de la Base de Datos

La aplicación se conectará automáticamente a la base de datos PostgreSQL al iniciar, utilizando la `DATABASE_URL` proporcionada. Los modelos de Sequelize (`src/models`) se sincronizarán con la base de datos, creando o alterando las tablas según sea necesario sin perder datos existentes (`alter: true`, `force: false`).

La configuración de la base de datos se encuentra en `src/config/database.js`.

### 5. Iniciar la Aplicación

#### Modo Desarrollo

```bash
npm run dev
```

Esto iniciará el servidor utilizando `nodemon`, que recargará automáticamente la aplicación cada vez que se detecten cambios en los archivos.

#### Modo Producción

```bash
npm start
```

Esto iniciará el servidor de forma estándar con Node.js.

## 🗺️ Estructura del Proyecto

El proyecto sigue una estructura modular y organizada para facilitar el desarrollo y mantenimiento:

```
inventario-backend/
├── src/                     # Código fuente de la aplicación
│   ├── config/              # Archivos de configuración global
│   │   ├── cloudinary.js    # Configuración de Cloudinary
│   │   ├── database.js      # Conexión PostgreSQL con Sequelize
│   │   └── swagger.js       # Configuración de OpenAPI (Swagger)
│   ├── controllers/         # Lógica de negocio (Controladores)
│   │   ├── auth.controller.js     # Autenticación
│   │   ├── category.controller.js # CRUD de categorías
│   │   └── product.controller.js  # CRUD de productos e Inventario (Stock/Movimientos)
│   ├── middlewares/         # Middlewares (Pre-procesamiento)
│   │   ├── auth.middleware.js     # Verificación JWT y Roles
│   │   └── upload.middleware.js   # Manejo de imágenes con Multer
│   ├── models/              # Modelos de base de datos (Sequelize)
│   │   ├── category.model.js # Modelo de Categorías
│   │   ├── movement.model.js # NUEVO: Modelo de historial de movimientos de stock
│   │   ├── product.model.js  # Modelo de Productos
│   │   └── user.model.js     # Modelo de Usuarios
│   └── routes/              # Definición de rutas de la API
└── uploads/                 # Directorio para archivos temporales
```

### Explicación Detallada de Carpetas y Archivos Clave:

-   **`index.js`**: Es el corazón de la aplicación. Aquí se configura Express, se conecta a la base de datos, se registran los middlewares globales, se definen las rutas principales y se inicia el servidor. También incluye la configuración para Swagger UI.
-   **`src/config/`**:
    -   `cloudinary.js`: Contiene la configuración necesaria para conectar la aplicación con el servicio de Cloudinary, utilizando las variables de entorno para las credenciales.
    -   `database.js`: Establece la conexión con la base de datos PostgreSQL utilizando Sequelize, y define cómo se recupera la URL de conexión desde las variables de entorno.
    -   `swagger.js`: Configura `swagger-jsdoc` para generar automáticamente la documentación de la API. Define metadatos de la API, esquemas de seguridad (JWT) y especifica dónde encontrar los comentarios JSDoc para generar la documentación.
-   **`src/controllers/`**: Cada archivo aquí es responsable de la lógica de negocio asociada a un recurso (ej. `auth`, `category`, `product`). Un controlador recibe una solicitud, interactúa con el modelo y los servicios si es necesario, y envía una respuesta.
-   **`src/middlewares/`**: Contiene funciones que se ejecutan antes de que las solicitudes lleguen a los controladores finales.
    -   `auth.middleware.js`: Verifica la validez del token JWT presente en la cabecera de autorización de una solicitud, asegurando que solo usuarios autenticados y autorizados puedan acceder a ciertas rutas.
    -   `upload.middleware.js`: Utiliza Multer para procesar la carga de archivos (`multipart/form-data`), por ejemplo, para subir imágenes de productos, y luego las envía a Cloudinary.
-   **`src/models/`**: Define la estructura de las tablas de la base de datos y sus relaciones utilizando Sequelize. Cada archivo `*.model.js` representa una tabla (ej. `User`, `Category`, `Product`).
    -   `index.js`: Este archivo es crucial; importa la instancia de `sequelize` configurada en `database.js`, importa todos los demás modelos definidos en la carpeta, establece las asociaciones entre ellos (ej. un producto pertenece a una categoría, un usuario puede crear productos) y los exporta para que puedan ser utilizados en el resto de la aplicación.
-   **`src/routes/`**: Organiza los endpoints de la API. Cada archivo `*.routes.js` define un conjunto de rutas relacionadas y las mapea a las funciones del controlador correspondiente.
-   **`uploads/`**: Aunque no siempre es el destino final, este directorio se puede usar para el almacenamiento temporal de archivos que se están subiendo antes de ser enviados a un servicio de almacenamiento en la nube como Cloudinary.

## 🔌 Endpoints de la API

La API proporciona los siguientes grupos de endpoints, documentados completamente en Swagger UI.

### Autenticación (`/api/auth`)

-   `POST /api/auth/register`: Registra un nuevo usuario.
-   `POST /api/auth/login`: Autentica a un usuario y devuelve un token JWT.

### Categorías (`/api/categories`)

Requiere token de autenticación para operaciones de creación, actualización y eliminación.

-   `GET /api/categories`: Obtiene todas las categorías disponibles.
-   `GET /api/categories/:id`: Obtiene una categoría específica por su ID.
-   `POST /api/categories`: Crea una nueva categoría.
-   `PUT /api/categories/:id`: Actualiza una categoría existente por su ID.
-   `DELETE /api/categories/:id`: Elimina una categoría por su ID.

### Productos e Inventario (`/api/products`)

-   `GET /api/products`: Obtiene todos los productos (soporta búsqueda y paginación).
-   `GET /api/products/:id`: Detalle completo de un producto.
-   `POST /api/products`: Crea un nuevo producto con imagen.
-   `PUT /api/products/:id`: Actualiza información e imagen del producto.
-   `DELETE /api/products/:id`: Elimina producto y limpia Cloudinary.
-   **`POST /api/products/:id/add-stock`**: Reabastecimiento de stock (Entrada). Registra el movimiento en el historial.
-   **`POST /api/products/:id/sell`**: Registro de venta (Salida). Valida existencias y genera registro de auditoría.
-   **`GET /api/products/:id/movements`**: Recupera el historial cronológico de movimientos del producto.

## 📄 Documentación de la API (Swagger UI)

Una vez que la aplicación esté corriendo, puedes acceder a la documentación interactiva de la API a través de Swagger UI en la siguiente URL:

```
http://localhost:PUERTO_DE_TU_APP/api-docs
```

(Reemplaza `PUERTO_DE_TU_APP` por el puerto configurado en tu archivo `.env`, por defecto `3000`).

La documentación te permitirá explorar todos los endpoints disponibles, ver sus parámetros de solicitud y respuestas, y probarlos directamente desde el navegador.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor, sigue estos pasos:

1.  Haz un "fork" del repositorio.
2.  Crea una nueva rama (`git checkout -b feature/nombre-de-la-feature`).
3.  Realiza tus cambios y asegúrate de que el código pase los tests (si los hay).
4.  Haz "commit" de tus cambios (`git commit -m 'feat: Añade nueva característica X'`).
5.  Sube tu rama (`git push origin feature/nombre-de-la-feature`).
6.  Abre un "Pull Request".

## 📝 Licencia

Este proyecto está bajo la Licencia ISC.

---

Desarrollado con ❤️ por [diegopresent](https://github.com/diegopresent)
