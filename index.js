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

// Middlewares
app.use(helmet());
app.use(cors());
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