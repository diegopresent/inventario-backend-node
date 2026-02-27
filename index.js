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

// --- CONFIGURACIÓN DE CORS (Blindada para Axios/Vercel) ---
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
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
            console.error(`[CORS BLOQUEO] Origen: ${origin}`);
            callback(null, false); // No lanzamos error, dejamos que el navegador bloquee
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
};

// Aplicar CORS a todo y manejar OPTIONS de forma explícita
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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

const PORT = process.env.PORT || 3000;
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