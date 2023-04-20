const table = document.getElementById("table-container");
const info = document.getElementById("information-container");

const canvas = document.getElementById("canvas-container");
const ctx = document.getElementById("chart");

const dropdown = document.getElementById("forecast-time");
const allData = document.getElementById("alldata");
const navArea = document.getElementById("nav");
const moreStuff = document.getElementById("showOther");
const closeButton = document.getElementById("close");

const degreeSymbol = '\u00B0';
const angleSymbol = '\u2220';
const amountToShow = 25;

let currentChart = null;
let currentType = "";
let minimize = false;

const print = (msg) => console.log(msg);

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
};

const showCanvas = () =>
{
    allData.style["grid-template-columns"] = "";
    canvas.style["display"] = "";

    dropdown.style.removeProperty("color");
    dropdown.style.removeProperty("display");
    dropdown.removeAttribute("disabled");
};

const hideCanvas = () =>
{
    allData.style["grid-template-columns"] = "none";
    canvas.style.display = "none";

    dropdown.style.color = "grey";
    dropdown.setAttribute("disabled", "disabled");
};

const toggleNav = (onlyMinimize = false) =>
{
    minimize = !minimize;
    if (onlyMinimize) minimize = true;

    const classToAdd = minimize ? "minimize" : "maximize";
    const classToRemove = minimize ? "maximize" : "minimize";

    navArea.classList.add(classToAdd);
    navArea.classList.remove(classToRemove);
};

const btns = document.getElementsByTagName("button");
const defaultBtn = btns["temp-button"];

currentFunction = defaultBtn.onclick;
defaultBtn.style.color = "sandybrown";
const newbtn = Array.from(btns).filter(elem =>
{
    return elem !== closeButton;
});

document.addEventListener("click", e =>
{
    for (let i = 0; i < newbtn.length; i++)
    {
        newbtn[i].style["color"] = "";

        if (e.target === newbtn[i])
        {
            currentFunction = newbtn[i].onclick;
        }
    }

    for (let i = 0; i < newbtn.length; i++)
    {
        if (newbtn[i].onclick !== currentFunction) continue;
        newbtn[i].style.color = "sandybrown";
    }

    if (navArea.contains(e.target) || closeButton.contains(e.target)) return;
    toggleNav(true);
});

const update = () =>
{
    if (typeof (currentFunction) === "function")
        currentFunction();
}

toggleNav();
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

async function showTemperature(isCalled = false)
{
    table.innerHTML = "";

    const time = dropdown.value;
    const data = await fetchData("temperature", isCalled && time === "" ? "167" : time);
    const shownData = time === "" ? data.slice(-amountToShow) : data;

    const header = ["Row", `Temperature (${degreeSymbol}C)`, "Time", "Date"];

    showCanvas();
    createHeaders(header);
    createTable(shownData);

    currentChart = createChart(shownData, `Temperature (${degreeSymbol}C)`, isCalled);
}

async function showWind(isCalled = false)
{
    table.innerHTML = "";

    const time = dropdown.value;

    const fetcher = time === "" && !isCalled ? "Wind_speed" : "wind_speed";
    const data = await fetchData(fetcher, isCalled && time === "" ? "167" : time);
    const shownData = time === "" ? data.slice(-amountToShow) : data;

    const header = ["Row", "Wind Speed (m/s)", "Time", "Date"];

    showCanvas();
    createHeaders(header);
    createTable(shownData);

    currentChart = createChart(shownData, "Wind Speed (m/s)", isCalled);
}

async function showLight()
{
    table.innerHTML = "";

    const time = dropdown.value;
    const data = await fetchData("light", time === "" ? "167" : time);
    const header = ["Row", "Light", "Time", "Date"];
    const shownData = time === "" ? data.slice(-amountToShow) : data;

    showCanvas();
    createHeaders(header);

    createTable(shownData);
    currentChart = createChart(shownData, "Light Amount", true);
}

async function showRain()
{
    table.innerHTML = "";

    const time = dropdown.value;
    const data = await fetchData("rain", time === "" ? "167" : time);
    const header = ["Row", "Rain", "Time", "Date"];
    const shownData = time === "" ? data.slice(-amountToShow) : data;

    showCanvas();
    createHeaders(header);

    createTable(shownData);
    currentChart = createChart(shownData, "Rain Amount", true);
}

async function showWindDir()
{
    table.innerHTML = "";

    const time = dropdown.value;

    const data = await fetchData("wind_direction", time === "" ? "167" : time);
    const header = ["Row", `Wind Direction (${angleSymbol})`, "Time", "Date"];
    const shownData = time === "" ? data.slice(-amountToShow) : data;

    showCanvas();
    createHeaders(header);
    createTable(shownData);

    currentChart = createChart(shownData, `Wind Direction (${angleSymbol})`, true);
}


async function fetchData(type = "", customTime = "")
{
    hideInfo();
    if (currentChart) currentChart.destroy();

    currentType = type;

    const defaultURL = `http://webapi19sa-1.course.tamk.cloud/v1/weather`;
    const URL = type === "" ? defaultURL : `http://webapi19sa-1.course.tamk.cloud/v1/weather/${type}/${customTime}`;

    print(URL);

    try
    {
        const response = await fetch(URL);
        const json = await response.json();

        json.sort((a, b) =>
        {
            return new Date(a.date_time) - new Date(b.date_time);
        });

        json.forEach(elem =>
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

        return json;
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

            tableData.innerText = Number(values) ? Number(values).toFixed(2) : values;
            rows.appendChild(tableData);
        });

        table.appendChild(rows);
    });
}

function createChart(data, type, extra = false)
{
    const xValues = data.flatMap(elem => elem.time.slice(0, -3));
    const yValues = data.flatMap(elem =>
    {
        const dataType = Object.keys(elem)[0];
        return elem[dataType];
    });

    const chartType = extra ? "line" : "bar";

    const chartInfo = {
        type: chartType,
        data: {
            labels: xValues,
            datasets: [{
                label: type,
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

function createTimeInfo(time)
{
    switch (time)
    {
        case "":
            return "Current";
        case "23":
            return "Today's";
        case "47":
            return "2 day's";
        case "71":
            return "3 day's";
        case "167":
            return "This week's";
        default:
            return "";
    }
}