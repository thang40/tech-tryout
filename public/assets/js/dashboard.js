var options = {
    chart: {
        type: "line",
        height: "400",
    },
    stroke: {
        curve: "smooth",
    },
    series: [
        {
            name: "sales",
            data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
        },
    ],
    xaxis: {
        categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
    },
    yaxis: {
        show: false,
    },
    grid: {
        show: false,
    },
};

var splineChartOpt = {
    chart: {
        type: "area",
        offsetX: 0,
    },
    stroke: {
        curve: "smooth",
    },
    series: [
        {
            name: "Usage",
            data: [11, 22, 33, 55, 44, 22, 11],
        },
    ],
    xaxis: {
        categories: ["sun", "mon", "tue", "wed", "fri", "thu", "sat"],
    },
    yaxis: {
        show: false,
    },
    grid: {
        show: false,
    },
};

var options2 = {
    chart: {
        type: "radar",
        height: "400",
    },
    series: [
        {
            name: "TEMP",
            data: [45, 52, 38, 24, 33, 10],
        },
        {
            name: "HUMIDITY",
            data: [26, 21, 20, 6, 8, 15],
        },
    ],
    stroke: {
        show: true,
        width: 2,
        colors: [],
        dashArray: 0,
    },
    labels: ["12 AM", "2 AM", "4 AM", "6 AM", "8 AM", "10 AM"],
};

var columnChartOpt = {
    series: [
        {
            data: [2.3, 3.1, 4.0, 10.1, 4.0],
        },
    ],
    chart: {
        type: "bar",
    },
    grid: {
        show: false,
    },
    xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May"],
    },
    yaxis: {
        show: false,
    },
};

var circleChartOpt = {
    series: [42],
    chart: {
        type: "radialBar",
    },
    dataLabels: {
        enabled: true,
    },
    labels: ["Humidity Room #2"],
    plotOptions: {
        radialBar: {
            hollow: {
                size: "70%",
            },
            dataLabels: {
                show: true,
                name: {
                    show: true,
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "black",
                },
                value: {
                    show: true,
                    fontSize: "30px",
                    color: "blue",
                },
            },
        },
    },
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
var chart2 = new ApexCharts(document.querySelector("#chart2"), options2);
var splineChart = new ApexCharts(document.querySelector("#splineChart"), splineChartOpt);
var colChart = new ApexCharts(document.querySelector("#colChart"), columnChartOpt);
var circleChart = new ApexCharts(document.querySelector("#circleChart"), circleChartOpt);

chart.render();
chart2.render();
splineChart.render();
colChart.render();
circleChart.render();
