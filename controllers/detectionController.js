const Detection = require('../models/detection');
const DetectionObject = require('../models/detectionObject');
const {formatDateToYMDHIS} = require("../utils/dateUtils");

const detectionController = {
    showDetection: (req, res) => {
        theme.addJavascriptFile("js/page/detection/detection.js");
        theme.addModalFile("partials/modals/_detectionDetail");
        theme.addVendors(["fslightbox", "select2"]);

        res.render(theme.getPageViewPath("detection", "detection"), {
            currentLayout: theme.getLayoutPath("default"),
        });
    },
    listDetectionAPI: async (req, res) => {
        try {
            const { draw, start = 0, length = 10, order = [], filter = [] } = req.body;

            const page = Math.floor(start / length) + 1;
            const limit = parseInt(length);

            const columns = ['id', 'object_type', 'object_count', 'confidence', 'image_path', 'created_at'];  // Örnek kolonlar

            const sortBy = order[0] && columns.includes(order[0].name) ? order[0].name : 'id';
            const orderBy = order[0] ? order[0].dir : 'asc';

            const filters = {
                object_type: filter.objects || undefined,
                source: filter.source || undefined,
                sourceName: filter.sourceName || undefined,
                anomaly: filter.anomaly === "true" ? true :  undefined,
            };
            if (filter.filterStartDate !== undefined && filter.filterEndDate !== undefined) {
                filters.startDate = new Date(filter.filterStartDate);
                filters.startDate.setHours(0, 0, 0, 0);
                filters.endDate = new Date(filter.filterEndDate);
                filters.endDate.setHours(23, 59, 59, 999);
            }


            const result = await Detection.list({
                filters,
                page,
                limit,
                sortBy,
                orderBy
            });

            const objectHistoryData = result.detections.map(objectHistory => ({
                ...objectHistory,
                created_at: objectHistory.created_at ? formatDateToYMDHIS(objectHistory.created_at) : null,
            }));

            res.json({
                draw: parseInt(draw) || 1,
                recordsTotal: result.total,
                recordsFiltered: result.total,
                data: objectHistoryData,
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

    showDetectionDetailAPI: async (req, res) => {
        try {
            const { id } = req.params;
            const detection = await Detection.findById(id);

            if (!detection) {
                return res.status(404).json({
                    success: false,
                    message: 'Kayıt bulunamadı'
                });
            }

            res.status(200).json({
                success: true,
                data: detection,
            });
        } catch (error) {
            console.error("showDetectionDetailAPI Error:", error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası oluştu',
                error: error.message,
            });
        }
    },
    detectionDeleteAPI: async (req, res) => {
        try {
            let { ids = [] } = req.query;
            if (!ids || ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'id gereklidir'
                });
            }
            if (!Array.isArray(ids)) {
                ids = [ids];
            }
            ids = ids.map(id => Number(id));

            await Detection.delete(ids);

            res.status(200).json({
                success: true,
                message: 'Silme işlemi başarılı',
            });

        } catch (error) {
            console.error("detectionDeleteAPI Error:", error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası oluştu',
                error: error.message,
            });
        }
    },
    detectionDetailObjectDeleteAPI: async (req, res) => {
        try {
            let { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'id gereklidir'
                });
            }

            await DetectionObject.delete(id);

            res.status(200).json({
                success: true,
                message: 'Silme işlemi başarılı',
            });

        } catch (error) {
            console.error("detectionDeleteAPI Error:", error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası oluştu',
                error: error.message,
            });
        }
    }
};

module.exports = detectionController;