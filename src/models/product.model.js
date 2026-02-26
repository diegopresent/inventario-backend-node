const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // URL pública para mostrar en el frontend
    imagen: {
        type: DataTypes.STRING,
        defaultValue: 'https://placehold.co/300x200/000000/FFFFFF?text=Sin+Imagen'
    },
    // NUEVO CAMPO: ID interno de Cloudinary para poder borrar la foto
    public_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

// --- ASOCIACIONES ---
Product.associate = (models) => {
    Product.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'categoria'
    });
    Product.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'usuario'
    });
    Product.hasMany(models.Movement, {
        foreignKey: 'productId',
        as: 'movimientos'
    });
};

module.exports = Product;