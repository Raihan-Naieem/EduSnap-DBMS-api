/** src/routes/teacher.routes.js — URL -> Controller mapping only. */
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');
const asyncHandler = require('../middleware/asyncHandler');
const { requireFields } = require('../middleware/validate');

router.post('/', requireFields(['name', 'email', 'password', 'adminId']), asyncHandler(teacherController.register));
router.get('/', asyncHandler(teacherController.list));
router.get('/:id', asyncHandler(teacherController.getById));
router.put('/:id', asyncHandler(teacherController.update));
router.delete('/:id', asyncHandler(teacherController.remove));

router.post('/:id/phones', requireFields(['phone']), asyncHandler(teacherController.addPhone));
router.get('/:id/phones', asyncHandler(teacherController.listPhones));
router.delete('/:id/phones/:phone', asyncHandler(teacherController.removePhone));

module.exports = router;
