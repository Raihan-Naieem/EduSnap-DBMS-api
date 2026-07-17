/** src/routes/course.routes.js — URL -> Controller mapping only. */
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const asyncHandler = require('../middleware/asyncHandler');
const { requireFields } = require('../middleware/validate');

router.post('/', requireFields(['title', 'price', 'adminId']), asyncHandler(courseController.create));
router.get('/', asyncHandler(courseController.list));
router.get('/:id', asyncHandler(courseController.getById));
router.get('/:id/stats', asyncHandler(courseController.getStats));
router.put('/:id', asyncHandler(courseController.update));
router.delete('/:id', asyncHandler(courseController.remove));

router.post('/:id/prerequisites', requireFields(['prerequisiteId']), asyncHandler(courseController.addPrerequisite));
router.get('/:id/prerequisites', asyncHandler(courseController.listPrerequisites));
router.delete('/:id/prerequisites/:prerequisiteId', asyncHandler(courseController.removePrerequisite));

module.exports = router;
