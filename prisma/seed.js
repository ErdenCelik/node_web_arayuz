const { PrismaClient } = require('@prisma/client');
const { hash } = require("bcrypt");
const { permissions, roles, rolePermissions } = require('../utils/permissionUtils');
const { systemDefaultSettings } = require('../utils/systemSettingsUtils');
const prisma = new PrismaClient();

async function seed() {
    try {
        console.log('Seed işlemi başlatılıyor...');

        // 1. İzinleri Oluştur
        for (const [key, value] of Object.entries(permissions)) {
            const existingPermission = await prisma.permission.findUnique({
                where: { name: value }
            });

            if (!existingPermission) {
                await prisma.permission.create({
                    data: {
                        name: value,
                        description: `Permission for ${value}`
                    }
                });
                console.log(`${value} izni oluşturuldu`);
            } else {
                console.log(`${value} izni zaten mevcut`);
            }
        }

        // 2. Rolleri Oluştur ve İzinleri Ata
        for (const [key, value] of Object.entries(roles)) {
            const existingRole = await prisma.role.findUnique({
                where: { name: value }
            });

            if (!existingRole) {
                const role = await prisma.role.create({
                    data: {
                        name: value
                    }
                });

                // Rol izinlerini ata
                const rolePermission = rolePermissions[value];
                for (const permissionName of rolePermission) {
                    const permission = await prisma.permission.findUnique({
                        where: { name: permissionName }
                    });

                    if (permission) {
                        await prisma.rolePermission.create({
                            data: {
                                role_id: role.id,
                                permission_id: permission.id
                            }
                        });
                    }
                }
                console.log(`${value} rolü ve izinleri oluşturuldu`);
            } else {
                console.log(`${value} rolü zaten mevcut`);
            }
        }

        // 3. Örnek Kullanıcıları Oluştur
        const defaultUsers = [
            {
                first_name: 'Erden',
                last_name: 'Çelik',
                email: 'erdenclk@gmail.com',
                password: '123456',
                role: roles.ADMIN
            },
            {
                first_name: 'Süpervizör',
                last_name: 'Kullanıcı',
                email: 'supervisor@example.com',
                password: '123456',
                role: roles.SUPERVISOR
            },
            {
                first_name: 'Operatör',
                last_name: 'Kullanıcı',
                email: 'operator@example.com',
                password: '123456',
                role: roles.OPERATOR
            },
            {
                first_name: 'İzleyici',
                last_name: 'Kullanıcı',
                email: 'viewer@example.com',
                password: '123456',
                role: roles.VIEWER
            }
        ];

        for (const userData of defaultUsers) {
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email }
            });

            if (!existingUser) {
                const role = await prisma.role.findUnique({
                    where: { name: userData.role }
                });

                if (role) {
                    await prisma.user.create({
                        data: {
                            first_name: userData.first_name,
                            last_name: userData.last_name,
                            email: userData.email,
                            password: await hash(userData.password, 10),
                            role_id: role.id,
                            created_at: new Date(),
                        },
                    });
                    console.log(`${userData.role} rolünde ${userData.email} kullanıcısı oluşturuldu`);
                }
            } else {
                console.log(`${userData.email} kullanıcısı zaten mevcut`);
            }
        }

        // 4. Sistem Ayarlarını Oluştur
        for (const setting of systemDefaultSettings) {
            const existingSetting = await prisma.systemSetting.findFirst({
                where: {
                    setting_key: setting.key,
                },
            });
            if (!existingSetting) {
                await prisma.systemSetting.create({
                    data: {
                        setting_key: setting.key,
                        setting_value: setting.value,
                        setting_type: setting.type,
                        setting_description: setting.description,
                    }
                });
                console.log(`${setting.key} ayarı eklendi`);
            } else {
                console.log(`${setting.key} ayarı zaten mevcut`);
            }
        }

    } catch (error) {
        console.error('\nSeed işlemi sırasında hata oluştu:', error);
        throw error;
    }
}

seed()
    .catch((e) => {
        console.error('Seed işlemi başarısız oldu:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });