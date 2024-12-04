const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


router.use((req, res, next) => {
    bootstrap.init();
    bootstrap.initAuthLayout()
    next()
})

router.get('/login', authController.showLogin);

router.post('/api/login', authController.loginAPI);
router.get('/logout', authController.logout);

module.exports = router;