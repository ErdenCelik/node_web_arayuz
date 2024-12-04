const User = require('../models/User');
const bcrypt = require('bcrypt');

const authController = {
    showLogin: (req, res) => {
        theme.addJavascriptFile("js/page/auth/login.js");
        res.render(theme.getPageViewPath("auth", "login"), { currentLayout: theme.getLayoutPath("auth") });
    },

    // Api login endpoint
    loginAPI: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email ve şifre gereklidir'
                });
            }

            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bulunamadı'
                });
            }
            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı aktif değil'
                });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                const hashedPassword = await bcrypt.hash(password, 10);
                return res.status(401).json({
                    success: false,
                    message: 'Hatalı şifre ' + hashedPassword
                });
            }
            await User.updateLastLogin(user.id);
            const permissions = user.role.permissions.map(rp => rp.permission.name);

            req.session.userId = user.id;
            req.session.user = {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role.name,
                permissions: permissions
            };
            res.status(200).json({
                success: true,
                message: 'Giriş başarılı',
            });

        } catch (error) {
            console.error("loginAPI Error:", error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası oluştu',
                error: error.message
            });
        }
    },

    logout: async (req, res) => {
        req.session.destroy();
        res.redirect('/auth/login');
    }
};

module.exports = authController;