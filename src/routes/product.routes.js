const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    addStock,
    sellProduct,
    getProductMovements
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Operaciones de inventario y gestión de productos
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Listado de productos con filtros
 *     description: Retorna una lista paginada de productos con opción de búsqueda por nombre.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Número de página (1+)
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Cantidad por página
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         description: Palabra clave para buscar en el nombre
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente.
 */
router.get('/', getProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtener detalle técnico de un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único (UUID) del producto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Objeto producto con categoría asociada.
 *       404:
 *         description: Producto no encontrado.
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crear nuevo producto (Requiere autenticación)
 *     description: Permite registrar un producto con imagen opcional. Solo ADMIN y CLIENTE.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - precio
 *               - categoryId
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Laptop Pro"
 *               precio:
 *                 type: number
 *                 example: 1200.50
 *               stock:
 *                 type: integer
 *                 example: 10
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               sku:
 *                 type: string
 *                 example: "LP-12345"
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Producto creado.
 *       400:
 *         description: Error en datos o formato de imagen.
 */
router.post(
    '/',
    protect,
    authorize('ADMIN', 'CLIENTE'),
    upload.single('imagen'),
    createProduct
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualizar información de producto
 *     description: Permite modificar campos y cambiar la imagen. Si se sube una imagen nueva, la anterior se elimina de Cloudinary.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *               sku:
 *                 type: string
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente.
 */
router.put(
    '/:id',
    protect,
    authorize('ADMIN', 'CLIENTE'),
    upload.single('imagen'), 
    updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Eliminar producto definitivamente
 *     description: Borra el registro y su imagen asociada en Cloudinary. Solo ADMIN.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente.
 */
router.delete(
    '/:id',
    protect,
    authorize('ADMIN'),
    deleteProduct
);

/**
 * @swagger
 * /products/{id}/add-stock:
 *   post:
 *     summary: Reabastecimiento de Inventario (Entrada)
 *     description: Aumenta el stock de un producto y registra la operación en el historial.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cantidad
 *             properties:
 *               cantidad:
 *                 type: integer
 *                 description: Unidades a añadir
 *                 example: 50
 *               motivo:
 *                 type: string
 *                 description: Razón de la entrada
 *                 example: "Compra a proveedor X"
 *     responses:
 *       200:
 *         description: Stock incrementado correctamente.
 */
router.post('/:id/add-stock', protect, authorize('ADMIN', 'CLIENTE'), addStock);

/**
 * @swagger
 * /products/{id}/sell:
 *   post:
 *     summary: Registro de Venta (Salida)
 *     description: Disminuye el stock del producto tras una venta. Valida que haya unidades suficientes.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cantidad
 *             properties:
 *               cantidad:
 *                 type: integer
 *                 description: Unidades vendidas
 *                 example: 2
 *               motivo:
 *                 type: string
 *                 description: Detalle opcional
 *                 example: "Venta directa en tienda"
 *     responses:
 *       200:
 *         description: Venta registrada con éxito.
 *       400:
 *         description: Error por stock insuficiente.
 */
router.post('/:id/sell', protect, authorize('ADMIN', 'CLIENTE'), sellProduct);

/**
 * @swagger
 * /products/{id}/movements:
 *   get:
 *     summary: Historial de movimientos de un producto
 *     description: Retorna una lista cronológica de todas las entradas (reabastecimientos) y salidas (ventas) con el detalle del usuario responsable.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID del producto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listado de movimientos recuperado correctamente.
 *       404:
 *         description: Producto no encontrado.
 */
router.get('/:id/movements', protect, getProductMovements);

module.exports = router;