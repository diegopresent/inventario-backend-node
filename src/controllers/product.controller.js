const { Product, Category, User, Movement, sequelize } = require('../models');
const { Op } = require('sequelize');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// --- FUNCIÓN AUXILIAR PARA VALIDAR UUID ---
const isUUID = (id) => {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(id);
};

// 1. OBTENER TODOS LOS PRODUCTOS
exports.getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause.nombre = { [Op.iLike]: `%${search}%` };
        }

        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            include: [
                { model: Category, as: 'categoria', attributes: ['id', 'nombre'] },
                { model: User, as: 'usuario', attributes: ['id', 'nombre'] }
            ]
        });

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
};

// 2. OBTENER UN PRODUCTO POR ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validación de seguridad
        if (!isUUID(id)) {
            return res.status(400).json({ success: false, message: 'El ID proporcionado no es válido (UUID)' });
        }

        const product = await Product.findByPk(id, {
            include: [{ model: Category, as: 'categoria' }]
        });

        if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
};

// 3. CREAR PRODUCTO
exports.createProduct = async (req, res) => {
    try {
        const { nombre, precio, stock, categoryId, sku } = req.body;
        const userId = req.user.id;

        if (!nombre || !precio || !categoryId) {
            // Si falta info y subieron foto, la borramos para no dejar basura
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
        }

        let imagenUrl = 'https://placehold.co/300x200/000000/FFFFFF?text=Sin+Imagen';
        let publicId = null;

        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'inventario_productos'
                });
                imagenUrl = result.secure_url;
                publicId = result.public_id;
                
                fs.unlinkSync(req.file.path);
            } catch (error) {
                console.error('Error subiendo imagen:', error);
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                return res.status(500).json({ success: false, message: 'Error al subir imagen' });
            }
        }

        const newProduct = await Product.create({
            nombre,
            precio,
            stock,
            categoryId,
            userId,
            sku,
            imagen: imagenUrl,
            public_id: publicId
        });

        res.status(201).json({ success: true, data: newProduct });

    } catch (error) {
        console.error(error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
};

// 4. ACTUALIZAR PRODUCTO
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isUUID(id)) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'El ID proporcionado no es válido' });
        }

        const product = await Product.findByPk(id);

        if (!product) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        let datosActualizados = { ...req.body };

        if (req.file) {
            try {
                if (product.public_id) {
                    await cloudinary.uploader.destroy(product.public_id);
                }
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'inventario_productos'
                });
                datosActualizados.imagen = result.secure_url;
                datosActualizados.public_id = result.public_id;
                fs.unlinkSync(req.file.path);
            } catch (error) {
                console.error('Error actualizando imagen:', error);
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                return res.status(500).json({ success: false, message: 'Error al procesar imagen' });
            }
        }

        await product.update(datosActualizados);
        res.status(200).json({ success: true, data: product });

    } catch (error) {
        console.error(error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
};

// 5. ELIMINAR PRODUCTO
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isUUID(id)) return res.status(400).json({ success: false, message: 'ID no válido' });

        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ success: false, message: 'No encontrado' });

        if (product.public_id) {
            await cloudinary.uploader.destroy(product.public_id);
        }
        await product.destroy();
        res.status(200).json({ success: true, message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
};

// 6. AGREGAR STOCK (Entrada)
exports.addStock = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { cantidad, motivo } = req.body;

        if (!isUUID(id)) return res.status(400).json({ success: false, message: 'ID no válido' });
        if (!cantidad || cantidad <= 0) return res.status(400).json({ success: false, message: 'Cantidad debe ser mayor a 0' });

        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

        product.stock += parseInt(cantidad);
        await product.save({ transaction });

        await Movement.create({
            tipo: 'entrada',
            cantidad: parseInt(cantidad),
            motivo: motivo || 'Reabastecimiento',
            productId: id,
            userId: req.user.id
        }, { transaction });

        await transaction.commit();
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
};

// 7. VENDER PRODUCTO (Salida)
exports.sellProduct = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { cantidad, motivo } = req.body;

        if (!isUUID(id)) return res.status(400).json({ success: false, message: 'ID no válido' });
        if (!cantidad || cantidad <= 0) return res.status(400).json({ success: false, message: 'Cantidad debe ser mayor a 0' });

        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

        if (product.stock < cantidad) {
            return res.status(400).json({ success: false, message: 'Stock insuficiente' });
        }

        product.stock -= parseInt(cantidad);
        await product.save({ transaction });

        await Movement.create({
            tipo: 'salida',
            cantidad: parseInt(cantidad),
            motivo: motivo || 'Venta',
            productId: id,
            userId: req.user.id
        }, { transaction });

        await transaction.commit();
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
};

// 8. OBTENER MOVIMIENTOS DE UN PRODUCTO
exports.getProductMovements = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isUUID(id)) return res.status(400).json({ success: false, message: 'ID no válido' });

        const movements = await Movement.findAll({
            where: { productId: id },
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'usuario', attributes: ['id', 'nombre', 'email'] }
            ]
        });

        res.status(200).json({ success: true, data: movements });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
};
