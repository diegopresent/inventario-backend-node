require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
// Importamos modelos
const { sequelize } = require('./src/models');

// Importar Rutas
const authRoutes = require('./src/routes/auth.routes');
const categoryRoutes = require('./src/routes/category.routes');
const productRoutes = require('./src/routes/product.routes');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const app = express();

// --- CONFIGURACIÓN DE CORS ---
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean).map(url => url.replace(/\/$/, ""));

console.log('[CORS] Orígenes permitidos:', allowedOrigins);

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (Postman, etc.)
        if (!origin) return callback(null, true);
        
        const cleanOrigin = origin.replace(/\/$/, "");
        
        if (allowedOrigins.includes(cleanOrigin)) {
            callback(null, true);
        } else {
            console.log(`[CORS] Intento de acceso denegado desde: ${origin}`);
            // En lugar de lanzar Error, pasamos "false" para que el navegador maneje el bloqueo
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200 // Algunas versiones de navegadores antiguos fallan con 204
};

// 1. CORS debe ir ANTES que cualquier otro middleware
app.use(cors(corsOptions));
// 2. Manejo explícito de Preflight para todas las rutas
app.options('*', cors(corsOptions));

// Resto de Middlewares
app.use(helmet({
    crossOriginResourcePolicy: false, // Evita que Helmet bloquee recursos compartidos
}));
app.use(morgan('dev'));
app.use(express.json());

// Definicion de Rutas
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes); 

// Ruta base
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API del Sistema de Inventario funcionando correctamente',
        version: '1.0.0'
    });
});

// Inicializacion
const PORT = process.env.PORT || 3000;
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexion a la base de datos establecida correctamente');

        await sequelize.sync({ alter: true, force: false });
        console.log('Modelos sincronizados y relaciones establecidas');

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });

    } catch (error) {
        console.error('Error critico al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();