const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const {checkPermissionView, checkPermissionApi} = require("../middleware/checkPermission");
const { permissions } = require('../utils/permissionUtils');

router.use((req, res, next) => {
    bootstrap.init();
    bootstrap.initDefault();
    next();
});

router.get('/', checkPermissionView(permissions.SETTINGS_VIEW), settingController.showSetting);
router.put('/update', checkPermissionApi(permissions.SETTINGS_EDIT), settingController.updateSettingAPI);

module.exports = router;