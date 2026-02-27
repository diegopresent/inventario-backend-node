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

// 1. LISTA BLANCA ESTRICTA (Tus orígenes definidos)
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://inventario-frontend-react-vite.vercel.app'
];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como Postman)
        if (!origin) return callback(null, true);
        
        const cleanOrigin = origin.replace(/\/$/, "");
        if (allowedOrigins.includes(cleanOrigin)) {
            callback(null, true);
        } else {
            console.error(`[CORS BLOQUEO] El origen ${origin} no está autorizado.`);
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200 // Vital para que el Preflight (OPTIONS) no falle
};

// 2. APLICAR CORS ANTES QUE NADA
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Responder a peticiones Preflight de forma explícita

// 3. RESTO DE MIDDLEWARES
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json());

// 4. RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes); 

app.get('/', (req, res) => {
    res.json({ success: true, message: 'API funcionando correctamente' });
});

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// 5. MANEJO DE 404 (Para depurar por qué sale 404 en el login)
app.use((req, res) => {
    console.error(`[404 NOT FOUND] Ruta buscada: ${req.method} ${req.url}`);
    res.status(404).json({ 
        success: false, 
        message: `La ruta ${req.url} con método ${req.method} no existe en este servidor.` 
    });
});

const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        app.listen(PORT, () => console.log(`Servidor seguro en puerto ${PORT}`));
    } catch (error) {
        console.error('Error al iniciar servidor:', error);
    }
};

startServer();
