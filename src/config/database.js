const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Verificar si existe la variable DATABASE_URL (Típico de Neon/Render)
if (process.env.DATABASE_URL) {
    
    // --- CONFIGURACIÓN PARA PRODUCCIÓN (NEON / RENDER) ---
    console.log('Conectando a base de datos en la NUBE...');

    let connectionString = process.env.DATABASE_URL;

    // Parche de compatibilidad: Cambiar 'postgresql://' por 'postgres://'
    if (connectionString.startsWith('postgresql://')) {
        connectionString = connectionString.replace('postgresql://', 'postgres://');
    }

    sequelize = new Sequelize(connectionString, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Indispensable para que no rechace la conexión segura
            }
        }
    });

} else {

    // --- CONFIGURACIÓN PARA DESARROLLO (LOCALHOST) ---
    console.log('Conectando a base de datos LOCAL...');

    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            port: process.env.DB_PORT || 5432,
            logging: false,
            // En local NO activamos SSL para evitar errores de conexión
        }
    );
}

// Función para verificar la conexión (Opcional, pero buena práctica)
const dbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Base de datos conectada exitosamente');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        // No hacemos process.exit(1) aquí para que no mate el servidor si es un error temporal,
        // pero puedes dejarlo si prefieres que se detenga.
    }
};

module.exports = { sequelize, dbConnection };