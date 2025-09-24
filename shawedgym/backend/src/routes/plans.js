const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plansController');
const authMiddleware = require('../middleware/auth');

// NOTE: Temporarily disabling global auth for plans to allow frontend integration without login.
// If you want to protect these routes, re-enable the line below or apply per-route.
// router.use(authMiddleware);

router.get('/', plansController.getPlans);
router.get('/:id', plansController.getPlan);
router.post('/', plansController.createPlan);
router.put('/:id', plansController.updatePlan);
router.delete('/:id', plansController.deletePlan);

module.exports = router;



