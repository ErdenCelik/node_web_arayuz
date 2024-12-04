const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Detection {

    static async findById(id) {
        try {
            id = parseInt(id, 10);
            return await prisma.detection.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    uuid: true,
                    source: true,
                    source_name: true,
                    object_count: true,
                    detected_objects: true,
                    image_path: true,
                    created_at: true,
                    objects: true,
                },
            });
        } catch (err) {
            console.error('findByIdDetection Error:', err);
            throw err;
        }
    }

    static async list({ filters, page, limit, sortBy, orderBy }) {
        try {
            const whereConditions = {};

            if (filters.object_type && filters.object_type.length > 0) {
                whereConditions.objects = {
                    some: {
                        object_type: {
                            in: filters.object_type,
                        },
                    },
                };
            }
            if (filters.source){
                whereConditions.source = filters.source
            }
            if (filters.sourceName){
                whereConditions.source_name = filters.sourceName
            }
            if (filters.startDate && filters.endDate){
                whereConditions.created_at = {
                    gte: filters.startDate,
                    lte: filters.endDate,
                }
            }
            if (filters.anomaly !== undefined){
                whereConditions.is_anomaly = filters.anomaly
            }


            const detections = await prisma.detection.findMany({
                where: whereConditions,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    [sortBy]: orderBy,
                },
                select: {
                    id: true,
                    uuid: true,
                    source: true,
                    source_name: true,
                    object_count: true,
                    detected_objects: true,
                    is_anomaly: true,
                    image_path: true,
                    created_at: true,
                }
            });

            const totalDetections = await prisma.detection.count({
                where: whereConditions,
            });


            return {
                detections,
                total: totalDetections,
            };
        } catch (err) {
            console.error('listDetection Error:', err);
            throw err;
        }
    }

    static async delete(ids) {
        try {
            await prisma.detection.deleteMany({
                where: {
                    id: {
                        in: ids,
                    },
                },
            });
        } catch (err) {
            console.error('deleteDetection Error:', err);
            throw err;
        }
    }
}

module.exports = Detection;
