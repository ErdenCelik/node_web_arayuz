const User = require('../models/User');
const Role = require('../models/Role');
const {formatDateToYMDHIS} = require("../utils/dateUtils");

const userController = {
    showUser: (req, res) => {
        theme.addJavascriptFile("js/page/user/users.js");
        theme.addModalFile("partials/modals/_userCreateEdit.ejs");

        //theme.addVendors(["amcharts", "amcharts-maps", "amcharts-stock"]);
        res.render(theme.getPageViewPath("user", "user"), {
            currentLayout: theme.getLayoutPath("default"),
        });
    },
    getUserInformationAPI: async (req, res) => {
        try {
            const {id} = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Kullanıcı id gereklidir.'
                });
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Kullanıcı bulunamadı.'
                });
            }
            return res.status(200).json({
                success: true,
                data: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    role_id: user.role_id,
                    role_name: user.role.name,
                    isActive: user.is_active
                }
            });
        }catch (error) {
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası oluştu',
            });
        }
    },
    userCreateUpdateAPI: async (req, res) => {
        try {
            const {id, firstName, lastName, email, password, status, roleName} = req.body;

            const userStatus = (status === undefined || status === null) ? false : true;

            if (id){
                if (!firstName || !lastName || !email || !roleName) {
                    return res.status(400).json({
                        success: false,
                        message: 'Tüm alanlar gereklidir.'
                    });
                }

                let role = await Role.findByName(roleName);
                if (!role) {
                    return res.status(404).json({
                        success: false,
                        message: 'Rol bulunamadı.'
                    });
                }

                const userUpdate = await User.update(
                    id,
                    firstName,
                    lastName,
                    email,
                    password,
                    role.id,
                    userStatus
                );
                if (!userUpdate) {
                    return res.status(500).json({
                        success: false,
                        message: 'Kullanıcı güncellenemedi.'
                    });
                }
                res.status(200).json({
                    success: true,
                    message: 'Kullanıcı başarıyla güncellendi.'
                });

            }else{
                if (!firstName || !lastName || !email || !password || !roleName) {
                    return res.status(400).json({
                        success: false,
                        message: 'Tüm alanlar gereklidir.'
                    });
                }

                let role = await Role.findByName(roleName);
                if (!role) {
                    return res.status(404).json({
                        success: false,
                        message: 'Rol bulunamadı.'
                    });
                }

                const userAdd = await User.create(
                    firstName,
                    lastName,
                    email,
                    role.id,
                    userStatus,
                    password
                );
                if (!userAdd) {
                    return res.status(500).json({
                        success: false,
                        message: 'Kullanıcı eklenemedi.'
                    });
                }
                res.status(200).json({
                    success: true,
                    message: 'Kullanıcı başarıyla eklendi.'
                });

            }

        }catch (error) {
            console.error("userCreateUpdateAPI Error:", error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası oluştu',
                error: error.message,
            });
        }
    },

    listUserAPI: async (req, res) => {
        try {
            const { draw, start = 0, length = 10, order = [] } = req.body;

            const page = Math.floor(start / length) + 1;
            const limit = parseInt(length);

            const columns = ['id', 'first_name', 'last_name', 'email', 'is_active', 'last_login'];  // Örnek kolonlar

            const sortBy = order[0] && columns.includes(order[0].name) ? order[0].name : 'id';
            const orderBy = order[0] ? order[0].dir : 'asc';



            const filters = {
                //lastLogin: new Date(Date.now() - 60 * 60 * 1000),
            };

            const result = await User.list({
                filters,
                page,
                limit,
                sortBy,
                orderBy
            });

            const userData = result.users.map(user => ({
                ...user,
                last_login: user.last_login ? formatDateToYMDHIS(user.last_login) : null,
            }));

            res.json({
                draw: parseInt(draw) || 1,
                recordsTotal: result.total,
                recordsFiltered: result.total,
                data: userData,
            });
        } catch (error) {
            console.error("listUserAPI Error:", error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası oluştu',
                error: error.message,
            });
        }
    },

    statusChangeAPI: async (req, res) => {
        try {
            const {id, status} = req.body;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Kullanıcı id gereklidir.'
                });
            }
            const user = await User.statusChange(id, status);
            if (!user) {
                return res.status(500).json({
                    success: false,
                    message: 'Kullanıcı durumu değiştirilemedi.'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Kullanıcı durumu başarıyla değiştirildi.'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası oluştu',
                error: error.message
            });
        }
    },
    passwordChangeApi: async (req, res) => {
        try {
            const {password, passwordConfirmation} = req.body;

            if (!password || !passwordConfirmation) {
                return res.status(400).json({
                    success: false,
                    message: 'Tüm alanlar gereklidir.'
                });
            }
            if (password !== passwordConfirmation) {
                return res.status(400).json({
                    success: false,
                    message: 'Şifreler eşleşmiyor.'
                });
            }

            const passwordChange = await User.updatePassword(req.session.user.id, password);
            if (!passwordChange) {
                return res.status(500).json({
                    success: false,
                    message: 'Şifre değiştirilemedi.'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Şifre başarıyla değiştirildi.'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası oluştu',
                error: error.message
            });
        }

    }

};

module.exports = userController;