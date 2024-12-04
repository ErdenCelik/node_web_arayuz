const express = require('express');
const router = express.Router();
const detectionController = require('../controllers/detectionController');
const {checkPermissionView, checkPermissionApi} = require("../middleware/checkPermission");
const { permissions } = require('../utils/permissionUtils');

router.use((req, res, next) => {
    bootstrap.init();
    bootstrap.initDefault();
    next();
});

router.get('/', checkPermissionView(permissions.HISTORY_VIEW), detectionController.showDetection);
router.post('/list', checkPermissionApi(permissions.HISTORY_VIEW), detectionController.listDetectionAPI);
router.delete('/delete', checkPermissionApi(permissions.HISTORY_DELETE), detectionController.detectionDeleteAPI);
router.get('/detail/:id/objects', checkPermissionApi(permissions.HISTORY_VIEW), detectionController.showDetectionDetailAPI);
router.delete('/detail/object/:id/delete', checkPermissionApi(permissions.HISTORY_DELETE), detectionController.detectionDetailObjectDeleteAPI);
module.exports = router;