const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DetectionObject {

    static async delete(id) {
        try {
            id = parseInt(id, 10);

            const detectionObject = await prisma.detectionObject.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    detection_id: true,
                },
            });

            const detectionId = await prisma.detection.findUnique({
                where: {
                    id: detectionObject.detection_id,
                },
                select: {
                    id: true,
                },
            });

            await prisma.detectionObject.delete({
                where: {
                    id,
                },
            });


            const detectionObjectValues = await prisma.detectionObject.findMany({
                where: {
                    detection_id: detectionId.id,
                },
                select: {
                    id: true,
                    object_type: true,
                },
            });

            console.log(detectionObjectValues)

            const objects = []
            for (const value of detectionObjectValues) {
                objects.push(value.object_type)
            }

            if (objects.length === 0) {
                await prisma.detection.delete({
                    where: {
                        id: detectionId.id,
                    }
                })
                return;
            }
            await prisma.detection.update({
                where: {
                    id: detectionId.id,
                },
                data: {
                    object_count: objects.length,
                    detected_objects: objects,
                },
            });

        } catch (err) {
            console.error('deleteDetectionObject Error:', err);
            throw err;
        }
    }

    static async findDetectionObjectCount(object, startDate, endDate) {
        try {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const detectionObject = await prisma.detectionObject.findMany({
                where: {
                    object_type: object,
                    created_at: {
                        gte: start,
                        lte: end,
                    },
                },
                select: {
                    id: true,
                },
            });
            return detectionObject.length;
        } catch (err) {
            console.error('findDetectionObjectCount Error:', err);
            throw err;
        }
    }
}
module.exports = DetectionObject;