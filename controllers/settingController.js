const Setting = require('../models/Setting');

const settingController = {
    showSetting: async (req, res) => {

        const settings = await Setting.getSettings()

        theme.addJavascriptFile("js/page/setting/setting.js");
        res.render(theme.getPageViewPath("setting", "setting"), {
            currentLayout: theme.getLayoutPath("default"),
            settings: settings
        });
    },
    updateSettingAPI: async (req, res) => {
        try {
        let {id, value} = req.body;
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Ayar ID bilgisi eksik.'
                });
            }
            const setting = await Setting.getSettingById(id);
            if (!setting) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Ayar bulunamadı.'
                });
            }

            if (setting.setting_type === "int" || setting.setting_type === "float") {
                let convertedValue;

                if (setting.setting_type === "int") {
                    value = parseInt(value, 10);
                    if (isNaN(value)) {
                        return res.status(400).json({
                            status: 'error',
                            message: 'Bu değer bir Integer olmalı.'
                        });
                    }
                    value = value.toString();
                } else if (setting.setting_type === "float") {
                    value = parseFloat(value);
                    if (isNaN(value)) {
                        return res.status(400).json({
                            status: 'error',
                            message: 'Bu değer bir Float olmalı.'
                        });
                    }
                    value = value.toString();
                }
            }

            if (setting.setting_type === "json") {
                if (value === undefined ) {
                    value = null;
                }
                if (value !== null && setting.setting_type === "json"){
                    value = JSON.stringify(value);
                }
            }

            await Setting.updateSetting(id, value)
            return res.json({
                status: 'success',
                message: 'Ayar başarı ile güncellendi.'
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Sunucu hatası oluştu',
                error: error.message,
            });
        }
    }

};

module.exports = settingController;