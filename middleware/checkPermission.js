const User = require("../models/user");

const checkPermissionApi = (requiredPermission) => {
    return async (req, res, next) => {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Oturum açmanız gerekiyor' });
        }

        try {
            const user = await User.findUserPermissions(req.session.userId);

            if (!user) {
                return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
            }


            const hasPermission = user.role.permissions.some(
                rp => rp.permission.name === requiredPermission
            );

            if (hasPermission) {
                next();
            } else {
                res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası' });
        }
    };
};

const checkPermissionView = (requiredPermission) => {
    return async (req, res, next) => {
        if (!req.session.userId) {
            return res.redirect('/');
        }

        try {
            const user = await User.findUserPermissions(req.session.userId);

            if (!user) {
                return res.redirect('/system/permission-denied');
            }


            const hasPermission = user.role.permissions.some(
                rp => rp.permission.name === requiredPermission
            );

            console.log(hasPermission)

            if (hasPermission) {
                next();
            } else {
                return res.redirect('/system/permission-denied');
            }
        } catch (error) {
            return res.redirect('/system/permission-denied');
        }
    };
};

module.exports = {
    checkPermissionApi,
    checkPermissionView
};