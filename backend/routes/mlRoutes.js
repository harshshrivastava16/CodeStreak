const express = require('express');
const router = express.Router();
const { getCachedInsights, manualRefreshInsights, markProblemSolved } = require('../controllers/mlController');

router.get('/:userId', getCachedInsights);
router.post('/:userId/refresh', manualRefreshInsights);
router.post('/:userId/recommended/solve', markProblemSolved);

module.exports = router;
