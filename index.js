require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./src/models');

const authRoutes = require('./src/routes/auth.routes');
const categoryRoutes = require('./src/routes/category.routes');
const productRoutes = require('./src/routes/product.routes');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

const app = express();

// --- CONFIGURACIÓN DE CORS (Segura y compatible) ---
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000'
];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/$/, "");
        if (allowedOrigins.includes(cleanOrigin)) {
            callback(null, true);
        } else {
            console.error(`[CORS BLOQUEO] Origen no autorizado: ${origin}`);
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
};

// 1. Aplicar CORS como primer middleware
app.use(cors(corsOptions));

// 2. Manejo de Preflight compatible con path-to-regexp v7+
// Usamos una expresión regular para evitar el error de "Missing parameter name"
app.options(/.*/, cors(corsOptions));

// --- OTROS MIDDLEWARES ---
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false
}));
app.use(morgan('dev'));
app.use(express.json());

// --- RUTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes); 

app.get('/', (req, res) => {
    res.json({ success: true, message: 'API funcionando correctamente' });
});

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Manejo de 404
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: `Ruta ${req.url} [${req.method}] no encontrada.` 
    });
});

const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        console.log('Conectando a la base de datos...');
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log('Base de datos conectada y sincronizada.');
        app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();
