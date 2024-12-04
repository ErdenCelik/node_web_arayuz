const { ObjectTypes, ObjectTypesInTurkish } = require("../utils/objectTypeUtils");
const DetectionObject = require("../models/detectionObject"); // ObjectTypes burada tanımlı

const dashboardController = {
    showDashboard: (req, res) => {
        theme.addJavascriptFile("js/page/dashboard/dashboard.js");
        res.render(theme.getPageViewPath("dashboards", "dashboard"), {
            currentLayout: theme.getLayoutPath("default"),
        });
    },

    showDashboardDataAPI: async (req, res) => {
        try {
            let { startDate, endDate, options = [] } = req.query;

            // Eğer options parametresi yoksa, default olarak 'person' ekle
            if (options.length === 0) {
                options = ["person"];
            }

            if (!startDate || !endDate) {
                const today = new Date();
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(today.getDate() - 6); // Son 7 günü kapsayacak şekilde başlangıç tarihi hesapla

                startDate = sevenDaysAgo.toISOString().split("T")[0]; // YYYY-MM-DD formatına dönüştür
                endDate = today.toISOString().split("T")[0]; // YYYY-MM-DD formatına dönüştür
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start) || isNaN(end)) {
                return res.status(400).json({
                    status: "error",
                    message: "Geçersiz tarih formatı.",
                });
            }

            // Simülasyon: ObjectTypes içindeki verilerden kategori ve değer oluştur
            const categories = [];

            // Tarih aralığını gün bazında kategorilere ayır
            for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
                categories.push(date.toISOString().split("T")[0]); // Tarihi YYYY-MM-DD formatında kaydet
            }

            // ObjectTypes üzerinden seriler oluştur
            const seriesPromises = Object.entries(ObjectTypes)
                .filter(([key, value]) => options.includes(value))
                .map(([key, value]) => {
                    // Her tarih için veri çekme işlemi
                    const dataPerDay = categories.map(async (date) => {
                        let objectCount = await DetectionObject.findDetectionObjectCount(value, date, date);
                        return objectCount; // Her bir tarih için obje sayısını döndür
                    });

                    // `data` array'ine, her bir tarihe karşılık gelen objelerin sayısını ekle
                    return Promise.all(dataPerDay).then((data) => {
                        console.log(value, data); // Her tarih için alınan veriyi logla
                        return {
                            name: ObjectTypesInTurkish[key],
                            data: data, // data her tarih için objelerin sayısı olacak şekilde diziyi döndürür
                        };
                    }).catch((error) => {
                        console.error("Error fetching data for", value, error);
                        return {
                            name: ObjectTypesInTurkish[key],
                            data: [],
                        };
                    });
                });

            // Tüm promise'leri bekleyin
            const series = await Promise.all(seriesPromises);

            // API yanıtı
            return res.status(200).json({
                categories,
                series,
            });
        } catch (err) {
            console.error("Hata:", err);
            return res.status(500).json({
                status: "error",
                message: "Bir hata oluştu.",
            });
        }
    },
};

module.exports = dashboardController;
