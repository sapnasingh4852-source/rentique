const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

router.get('/serviceability', deliveryController.checkServiceability);
router.get('/coverage', deliveryController.getCoverage);

module.exports = router;
