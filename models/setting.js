const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Setting {

    static async getSettingById(id) {
        try {
            return await prisma.systemSetting.findUnique({
                where: {
                    id: parseInt(id, 10)
                }
            });
        } catch (err) {
            throw err;
        }
    }
    static async getSettings() {
        try {
            return await prisma.systemSetting.findMany();
        } catch (err) {
            throw err;
        }
    }
    static async getApiData() {
        try {
            return await prisma.systemSetting.findMany({
                where: {
                    setting_key: {
                        in: ['pyHost', 'wsPort', 'apiPort']
                    }
                },
                select: {
                    id: true,
                    setting_key: true,
                    setting_value: true,
                }
            })
        } catch (err) {
            throw err;
        }
    }


    static async updateSetting(id, value) {
        try {
            return await prisma.systemSetting.update({
                where: {
                    id: parseInt(id, 10)
                },
                data: {
                    setting_value: value,
                }
            });
        } catch (err) {
            console.error("updateSetting Error:", err);
            throw err;
        }
    }
}

module.exports = Setting;
