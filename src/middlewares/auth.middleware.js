const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware 1: Proteger rutas (Verificar Token)
exports.protect = async (req, res, next) => {
    let token;

    // 1. Verificar si existe el header "Authorization" y empieza con "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Obtener el token (quitamos la palabra "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // 3. Verificar la firma del token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Buscar el usuario en la BD y agregarlo a la request (req.user)
            req.user = await User.findByPk(decoded.id);

            // Si el token es valido pero el usuario fue borrado de la BD
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'El usuario propietario de este token ya no existe'
                });
            }

            // 5. Permitir el paso
            next();

        } catch (error) {
            console.error('Error en middleware auth:', error);
            return res.status(401).json({
                success: false,
                message: 'No autorizado, token fallido o expirado'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No autorizado, no se envió token'
        });
    }
};

// Middleware 2: Autorizar por Roles (Solo Admin)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                message: `El rol ${req.user.rol} no está autorizado para esta acción`
            });
        }
        next();
    };
};