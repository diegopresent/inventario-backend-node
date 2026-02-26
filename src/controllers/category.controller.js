const { Category } = require('../models');
const { Op } = require('sequelize'); // Importamos operadores para la búsqueda

// 1. OBTENER CATEGORIAS (Con Paginación y Búsqueda)
exports.getCategories = async (req, res) => {
    try {
        // Obtenemos parámetros de la URL
        // Ejemplo: /api/categories?page=1&limit=10&search=electro
        const { page = 1, limit = 10, search = '' } = req.query;

        const offset = (page - 1) * limit;

        // Construimos el filtro
        const whereClause = {
            activo: true // Siempre filtramos solo las activas por defecto
        };

        if (search) {
            // Agregamos búsqueda por nombre (insensible a mayúsculas)
            whereClause.nombre = { [Op.iLike]: `%${search}%` };
        }

        // findAndCountAll es clave para paginación
        const { count, rows } = await Category.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['nombre', 'ASC']] // Ordenamos alfabéticamente
        });

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error al obtener categorias:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};

// 2. CREAR CATEGORIA
exports.createCategory = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es obligatorio'
            });
        }

        const newCategory = await Category.create({
            nombre,
            descripcion
        });

        res.status(201).json({
            success: true,
            data: newCategory
        });
    } catch (error) {
        console.error('Error al crear categoria:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};

// 3. ACTUALIZAR CATEGORIA
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, activo } = req.body;

        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoria no encontrada'
            });
        }

        await category.update({ nombre, descripcion, activo });

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};

// 4. ELIMINAR CATEGORIA
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoria no encontrada'
            });
        }

        // Soft delete
        await category.update({ activo: false });

        res.status(200).json({
            success: true,
            message: 'Categoria eliminada correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
};