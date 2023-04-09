const table = document.getElementById("table-container");
const info = document.getElementById("information-container");

const canvas = document.getElementById("canvas-container");
const ctx = document.getElementById("chart");

const dropdown = document.getElementById("forecast-time");
const allData = document.getElementById("alldata");
const navArea = document.getElementById("nav");

const degreeSymbol = '\u00B0';
let currentChart = null;
let showNav = false;

const showInfo = () =>
{
    info.style.display = "grid";

    table.innerHTML = "";
    canvas.style.display = "none";
    dropdown.style.display = "none";
}

const hideInfo = () =>
{
    info.style.display = "none";
    canvas.style.removeProperty("display");
    dropdown.style.removeProperty("display");
};

const showCanvas = () =>
{
    allData.style["grid-template-columns"] = "";
    canvas.style["display"] = "";
};

const hideCanvas = () =>
{
    allData.style["grid-template-columns"] = "none";
    canvas.style.display = "none";
};

const toggleNav = () =>
{
    showNav = !showNav;
    navArea.style.width = showNav ? "17vw" : "0";
};

showTemperature();

async function showHome()
{
    table.innerHTML = "";

    const data = await fetchData();
    const headers = ["Row", "Type", "Value", "Time", "Date"];

    hideCanvas();
    createHeaders(headers);
    createTable(data.slice(-30), true);
}

async function showTemperature(timeLength = 0)
{
    table.innerHTML = "";

    const data = await fetchData("temperature");
    const header = ["Row", `Temperature (${degreeSymbol}C)`, "Time", "Date"];

    showCanvas();
    createHeaders(header);
    createTable(data.slice(-20));
    currentChart = createChart(data.slice(-20), `Temperature (${degreeSymbol}C)`);
}

async function showWind()
{
    table.innerHTML = "";

    const data = await fetchData("wind_speed");
    const header = ["Row", "Wind Speed (m/s)", "Time", "Date"];

    showCanvas();
    createHeaders(header);
    createTable(data.slice(-20));
    currentChart = createChart(data.slice(-20), "Wind Speed (m/s)");
}

async function fetchData(type)
{
    hideInfo();
    if (currentChart) currentChart.destroy();
    const response = await fetch("http://webapi19sa-1.course.tamk.cloud/v1/weather");
    const json = await response.json();

    try
    {
        const sorted = json.sort((a, b) =>
        {
            return new Date(a.date_time) - new Date(b.date_time);
        });

        sorted.forEach(elem =>
        {
            const [date, time] = elem.date_time.split("T");

            for (const key in elem.data)
            {
                elem.type = key;
                elem.value = elem.data[key];
            }

            elem.time = time.substring(0, time.length - 5);
            elem.date = date;

            delete elem.date_time;
            delete elem.id;
            delete elem.data;
            delete elem.device_id;
        });

        if (type === undefined)
            return json;

        return json.filter(elem => elem.type === type);
    }
    catch (err)
    {
        console.error(err);
        return null;
    }
}

function createHeaders(types)
{
    if (types === null) return;

    const headerRow = document.createElement("tr");

    types.forEach(value =>
    {
        const headers = document.createElement("th");
        headers.innerText = value;

        headerRow.appendChild(headers);
    });

    table.appendChild(headerRow);
}


function createTable(data, showAll = false)
{
    let index = 0;

    data.forEach(elem =>
    {
        if (!showAll) delete elem.type;
        index++;

        const rows = document.createElement("tr");
        const tableDataIndex = document.createElement("td");

        tableDataIndex.innerHTML = index;
        rows.appendChild(tableDataIndex);

        Object.values(elem).forEach(values =>
        {
            const tableData = document.createElement("td");

            tableData.innerHTML = Number.isFinite(values) ? values.toFixed(2) : values;
            rows.appendChild(tableData);
        });


        table.appendChild(rows);
    });
}

function createChart(data, type)
{
    const xValues = data.flatMap(elem => elem.time.slice(0, -3));
    const yValues = data.flatMap(elem => elem.value);

    const hasNextDay = data.every((elem, index) =>
    {
        elem.date < data[index + 1].date;
    });

    console.log(hasNextDay);

    const chartInfo = {
        type: "bar",
        data: {
            labels: xValues,
            datasets: [{
                label: "Current " + type,
                data: yValues,
                borderWidth: 2,
                borderColor: "#F7F1E5",
                scaleFontColor: "white",
            }]
        },
        options: {
            responsive: true,
            animation: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 20,
                    bottom: 10,
                    left: 10,
                    right: 10
                }
            },

            scales: {
                x: {
                    ticks: {
                        color: "#F3DEBA",
                    },
                    border: {
                        color: "#A9907E",
                        width: 2
                    },
                    grid: {
                        display: false
                    },
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: "#F3DEBA",
                        fontSize: 20
                    },
                    border: {
                        color: "#A9907E",
                        width: 2
                    },
                    grid: {
                        display: true,
                    }
                },
            },
            elements: {
                bar: {
                    backgroundColor: "#ABC4AA"
                }
            }
        }
    }

    ctx.style.backgroundColor = "#675D50";
    Chart.defaults.color = "#F3DEBA";
    return new Chart(ctx, chartInfo);;
}