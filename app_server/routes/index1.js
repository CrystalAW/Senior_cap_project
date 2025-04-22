const express = require('express');
const router = express.Router();
// const cntrlMain = require('../controllers/main');
const cntrlTabs = require('../controllers/tabs');
const cntrlProfile = require('../controllers/profile');
/* GET home page. */
// const homepageController = (req, res) => {
//   res.render('index', {title: 'Bubbles'});
// };
router.get('/', cntrlTabs.home);
router.get('/calendar', cntrlTabs.calendar);
router.get('/schedule', cntrlTabs.schedule);
router.get('/tasks', cntrlTabs.tasks);

router.get('/login', cntrlProfile.login);

module.exports = router;
