const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Inventario - Portafolio',
            version: '1.0.0',
            description: 'API RESTful para gestión de inventarios con autenticación, categorías, productos y subida de imágenes.',
            contact: {
                name: 'Luis Diego Condori Flores',
                email: 'luisdiego362@gmail.com'
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Servidor de Desarrollo'
            },
            // {
            //   url: 'https://mi-api-produccion.onrender.com/api',
            //   description: 'Servidor de Producción'
            // }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Aquí le decimos dónde están los archivos con las anotaciones (rutas)
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;