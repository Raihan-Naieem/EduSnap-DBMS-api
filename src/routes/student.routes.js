/**
 * =============================================================================
 * src/routes/student.routes.js
 * =============================================================================
 * Endpoint definitions ONLY. No business logic.
 * =============================================================================
 */
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const asyncHandler = require('../middleware/asyncHandler');
const { requireFields } = require('../middleware/validate');

router.post('/', requireFields(['name', 'email', 'password']), asyncHandler(studentController.register));
router.get('/', asyncHandler(studentController.list));
router.get('/:id', asyncHandler(studentController.getById));
router.put('/:id', asyncHandler(studentController.update));
router.delete('/:id', asyncHandler(studentController.remove));

router.post('/:id/phones', requireFields(['phone']), asyncHandler(studentController.addPhone));
router.get('/:id/phones', asyncHandler(studentController.listPhones));
router.delete('/:id/phones/:phone', asyncHandler(studentController.removePhone));

module.exports = router;
