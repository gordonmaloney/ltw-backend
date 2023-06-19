const express = require('express');
const router = express.Router();
const {trackPageVisit, trackVisitor, logButtonClick, getAnalyticsData, getCampaignAnalytics, deleteAnalyticsData} = require('../controllers/analyticsController');

// Route for tracking unique visitors
router.post('/trackVisitor', trackVisitor);

// Route for recording page visits
router.post('/trackPageVisit', trackPageVisit);

// Route for logging button clicks
router.post('/logButtonClick', logButtonClick);

// Routes for getting analytics data
router.post('/masterAnalytics', getAnalyticsData);
router.post('/:uuid', getCampaignAnalytics);


//DANGER !!!!
router.delete('/deleteAll', deleteAnalyticsData)

module.exports = router;
