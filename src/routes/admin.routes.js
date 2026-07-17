/** src/routes/admin.routes.js — URL -> Controller mapping only. */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const asyncHandler = require('../middleware/asyncHandler');
const { requireFields } = require('../middleware/validate');

router.post('/', requireFields(['name', 'email', 'password']), asyncHandler(adminController.register));
router.get('/', asyncHandler(adminController.list));
router.get('/:id', asyncHandler(adminController.getById));
router.put('/:id', asyncHandler(adminController.update));
router.delete('/:id', asyncHandler(adminController.remove));

router.post('/:id/phones', requireFields(['phone']), asyncHandler(adminController.addPhone));
router.get('/:id/phones', asyncHandler(adminController.listPhones));
router.delete('/:id/phones/:phone', asyncHandler(adminController.removePhone));

module.exports = router;
