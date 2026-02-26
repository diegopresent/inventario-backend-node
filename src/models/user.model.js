const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    // ID Profesional: Usamos UUID en lugar de números autoincrementables
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50] // Validación: Mínimo 2 letras, máximo 50
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // No pueden haber dos usuarios con el mismo correo
        validate: {
            isEmail: true // Sequelize valida que sea formato email automáticamente
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rol: {
        type: DataTypes.ENUM('ADMIN', 'CLIENTE'),
        defaultValue: 'CLIENTE', // Por defecto, todos son clientes
        allowNull: false
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true // true = Activo, false = Banneado/Inactivo
    }
}, {
    hooks: {
        // Hook: "Antes de guardar, encripta la contraseña"
        beforeCreate: async (user) => {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        },
        // Hook: "Si actualizan la contraseña, encríptala de nuevo"
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Método personalizado para verificar contraseñas al hacer Login
User.prototype.validarPassword = async function (passwordIngresada) {
    return await bcrypt.compare(passwordIngresada, this.password);
};
// Recibimos "models" para evitar el require circular
User.associate = (models) => {
    // Un Usuario tiene muchos Productos (el que los creó)
    User.hasMany(models.Product, { 
        foreignKey: 'userId',
        as: 'productos' // Alias para cuando se haga consultas
    });
};
module.exports = User;