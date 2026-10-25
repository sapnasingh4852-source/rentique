const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.get('/facets', productController.getFacets);
router.get('/:id', productController.getProductById);
router.get('/:id/timeline', productController.getProductTimeline);
router.post('/', authenticate, authorize('ADMIN'), productController.createProduct);

module.exports = router;
