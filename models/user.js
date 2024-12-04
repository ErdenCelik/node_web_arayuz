const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const {getUtc3Date, formatDateToYMDHIS} = require("../utils/dateUtils");
const prisma = new PrismaClient();

class User {
    static async findByEmail(email) {
        try {
            return await prisma.user.findUnique({
                where: {
                    email: email
                },
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            });
        } catch (err) {
            throw err;
        }
    }
    static async findById(id) {
        try {
            return await prisma.user.findFirst({
                where: {
                    id: parseInt(id, 10)
                },
                include: {
                    role: true
                }
            });
        } catch (err) {
            throw err;
        }
    }
    static async findUserPermissions(id) {
        try {
            return await prisma.user.findFirst({
                where: {
                    id: parseInt(id, 10)
                },
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            });
        } catch (err) {
            throw err;
        }
    }
    static async create(firstName, lastName, email, roleId, status, password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            return await prisma.user.create({
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    password: hashedPassword,
                    role_id: parseInt(roleId, 10),
                    is_active: status,
                    created_at: getUtc3Date()
                }
            });
        } catch (err) {
            throw err;
        }
    }
    static async update(id, firstName, lastName, email, password, roleId, status) {
        try {
            const data = {
                first_name: firstName,
                last_name: lastName,
                email: email,
                role_id: parseInt(roleId, 10),
                is_active: status,
            };
            if (password) {
                data.password = await bcrypt.hash(password, 10);
            }

            return await prisma.user.update({
                where: {
                    id: parseInt(id, 10),
                },
                data: data,
            });
        } catch (err) {
            throw err;
        }
    }
    static async updateLastLogin(id) {
        try {
            return await prisma.user.update({
                where: {
                    id: id
                },
                data: {
                    last_login: getUtc3Date()
                }
            });
        } catch (err) {
            throw err;
        }
    }
    static async updatePassword(id, password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            return await prisma.user.update({
                where: {
                    id: id
                },
                data: {
                    password: hashedPassword
                }
            });
        } catch (err) {
            throw err;
        }
    }
    static async list({ filters, page, limit, sortBy, orderBy }) {
        try {
            const users = await prisma.user.findMany({
                where: filters,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    [sortBy]: orderBy,
                },
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    is_active: true,
                    last_login: true,
                    role_id: true,
                    role: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            });
            const totalUsers = await prisma.user.count({
                where: filters,
            });

            return {
                users,
                total: totalUsers,
            };
        } catch (err) {
            throw err;
        }
    }

    static async statusChange(id, status) {
        try {
            return await prisma.user.update({
                where: {
                    id: id
                },
                data: {
                    is_active: status
                }
            });
        } catch (err) {
            throw err;
        }
    }
}

module.exports = User;
