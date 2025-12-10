const express = require('express');
const router = express.Router();
const { getHistory, getRecentSolves } = require('../controllers/historyController');

router.get('/:userId', getHistory);
router.get('/:userId/solves', getRecentSolves);

module.exports = router;
