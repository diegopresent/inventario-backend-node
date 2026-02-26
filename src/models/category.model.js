const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // No queremos dos categorias llamadas igual
        validate: {
            notEmpty: true
        }
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});
Category.associate = (models) => {
    // Una Categoría tiene muchos Productos
    Category.hasMany(models.Product, { 
        foreignKey: 'categoryId',
        as: 'productos' 
    });
};
module.exports = Category;