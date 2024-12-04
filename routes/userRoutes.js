const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {checkPermissionView, checkPermissionApi} = require("../middleware/checkPermission");
const { permissions } = require('../utils/permissionUtils');

router.use((req, res, next) => {
    bootstrap.init();
    bootstrap.initDefault();
    next();
});

router.get('/', checkPermissionView(permissions.USER_READ), userController.showUser);

router.post('/', checkPermissionApi(permissions.USER_CREATE_UPDATE), userController.userCreateUpdateAPI);
router.post('/list', checkPermissionApi(permissions.USER_READ), userController.listUserAPI);
router.get('/:id', checkPermissionApi(permissions.USER_READ), userController.getUserInformationAPI);
router.put('/status', checkPermissionApi(permissions.USER_CREATE_UPDATE), userController.statusChangeAPI);
router.put('/password/change', userController.passwordChangeApi);

module.exports = router;