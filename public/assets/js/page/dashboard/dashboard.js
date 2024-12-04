$(document).ready(function () {
    const chartElement = document.getElementById("kt_apexcharts_1");
    let selectedOptions = [];
    let startDate = null;
    let endDate = null;

    $("#dateRangePicker").daterangepicker(
        {
            locale: {
                format: "YYYY-MM-DD",
                cancelLabel: "İptal",
                applyLabel: "Uygula"
            },
            autoUpdateInput: false,
            opens: "right"
        },
        function (start, end) {
            startDate = start.format("YYYY-MM-DD");
            endDate = end.format("YYYY-MM-DD");
            $("#dateRangePicker").val(`${startDate} - ${endDate}`);
        }
    );

    const today = moment();
    const sevenDaysAgo = moment().subtract(6, 'days');
    startDate = sevenDaysAgo.format("YYYY-MM-DD");
    endDate = today.format("YYYY-MM-DD");

    $("#dateRangePicker").val(`${startDate} - ${endDate}`);

    selectedOptions = $("#dataSelector").val();
    if (selectedOptions.length === 0) {
        selectedOptions = ["person"];
    }

    fetchChartData(selectedOptions, startDate, endDate);

    $("#fetchDataButton").on("click", function () {
        selectedOptions = $("#dataSelector").val();
        fetchChartData(selectedOptions, startDate, endDate);
    });
    function fetchChartData(options, startDate, endDate) {
        let queryParams = `?startDate=${startDate}&endDate=${endDate}`;

        options.forEach(option => {
            queryParams += `&options[]=${encodeURIComponent(option)}`;
        });

        axios.get(`/dashboard/chart${queryParams}`, {
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(function (response) {
            renderChart(response.data.categories, response.data.series);
        }).catch(function (error) {
            toastr.error("Veri alınırken hata oluştu.");
        });
    }

    function renderChart(categories, series) {
        const chartHeight = parseInt(window.getComputedStyle(chartElement).height, 10);

        if (chartElement.chartInstance) {
            chartElement.chartInstance.destroy();
        }

        const chart = new ApexCharts(chartElement, {
            series: series.map((s) => ({ name: s.name, data: s.data })),
            chart: {
                type: "area",
                height: chartHeight,
                toolbar: { show: false }
            },
            xaxis: { categories },
            yaxis: { labels: { style: { fontSize: "12px" } } },
            tooltip: { x: { format: "yyyy-MM-dd" } }
        });

        chart.render();
        chartElement.chartInstance = chart;
    }
});
