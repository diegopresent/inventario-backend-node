const { Sequelize } = require('sequelize');
require('dotenv').config();

// 1. Preparamos la URL (Parche de seguridad para Neon/Render)
let connectionString = process.env.DATABASE_URL;

// Si la URL viene como "postgresql://", la cambiamos a "postgres://"
// Sequelize es quisquilloso con esto.
if (connectionString && connectionString.startsWith('postgresql://')) {
    connectionString = connectionString.replace('postgresql://', 'postgres://');
}

// 2. Inicializamos Sequelize
const sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    logging: false, 
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false 
        }
    }
});

// 3. Función de conexión
const dbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Base de datos conectada exitosamente (PostgreSQL)');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1); 
    }
};

module.exports = { sequelize, dbConnection };