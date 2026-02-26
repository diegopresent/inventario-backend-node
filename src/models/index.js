const { sequelize } = require('../config/database');

// 1. Importar todos los modelos
const User = require('./user.model');
const Product = require('./product.model');
const Category = require('./category.model');
const Movement = require('./movement.model');

// 2. Empaquetarlos en un objeto
const models = {
    User,
    Product,
    Category,
    Movement
};

// 3. Recorrer cada modelo y ver si tiene el método "associate"
// Esto permite definir las relaciones DENTRO de cada archivo de modelo
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// 4. Exportar los modelos ya conectados y la conexión
module.exports = {
    ...models,
    sequelize
};