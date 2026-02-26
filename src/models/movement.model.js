const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Movement = sequelize.define('Movement', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    tipo: {
        type: DataTypes.ENUM('entrada', 'salida'),
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    motivo: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Ej: Venta, Devolución, Reabastecimiento, Ajuste'
    }
});

Movement.associate = (models) => {
    Movement.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'producto'
    });
    Movement.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'usuario'
    });
};

module.exports = Movement;
