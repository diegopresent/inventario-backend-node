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

// Configuración de CORS con lista blanca
const allowedOrigins = [
    'http://localhost:5173', // Vite (Frontend común)
    'http://localhost:3000', // Swagger o Local
    process.env.FRONTEND_URL  // URL de Vercel (Producción)
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como herramientas de prueba tipo Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por políticas de CORS de este Servidor'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
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