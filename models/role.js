const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Role {
    static async findByName(name) {
        try {
            return await prisma.role.findUnique({
                where: {
                    name: name,
                },
            });
        } catch (err) {
            console.error('findByNameRole Error:', err);
            throw err;
        }
    }
}

module.exports = Role;
