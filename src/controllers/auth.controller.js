const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Configuración de JWT
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE;

// Función auxiliar para generar el Token
const generarToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRE
    });
};

// --- REGISTRO DE USUARIO ---
exports.register = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // 1. Validar campos obligatorios
        if (!nombre || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos: nombre, email o password son obligatorios'
            });
        }

        // 2. Verificar si el usuario ya existe
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'El email ya se encuentra registrado'
            });
        }

        // 3. Crear el usuario
        // La contraseña se encripta automáticamente en el modelo (User hooks)
        const user = await User.create({
            nombre,
            email,
            password
        });

        // 4. Generar token
        const token = generarToken(user.id);

        // 5. Responder al cliente
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al registrar usuario',
            error: error.message
        });
    }
};

// --- LOGIN DE USUARIO ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validar campos
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Por favor ingrese email y password'
            });
        }

        // 2. Buscar usuario por email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales invalidas'
            });
        }

        // 3. Verificar contraseña
        // Usamos el método validarPassword definido en el modelo
        const isMatch = await user.validarPassword(password);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales invalidas'
            });
        }

        // 4. Generar token
        const token = generarToken(user.id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al iniciar sesion'
        });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};