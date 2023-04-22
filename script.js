const table = document.getElementById("table-container");
const info = document.getElementById("information-container");

const canvas = document.getElementById("canvas-container");
const ctx = document.getElementById("chart");

const dropdown = document.getElementById("forecast-time");
const allData = document.getElementById("alldata");
const navArea = document.getElementById("nav");
const moreStuff = document.getElementById("showOther");
const closeButton = document.getElementById("close");
const pageInfo = document.getElementById("pageInfo");

const degreeSymbol = '\u00B0';
const angleSymbol = '\u2220';
const amountToShow = 25;

let currentChart = null;
let currentType = "";
let minimize = false;
let isImage = false;

const print = (msg) => console.log(msg);

const showInfo = () =>
{
    info.style.display = "grid";

    table.innerHTML = "";
    canvas.style.display = "none";
    dropdown.style.display = "none";
    pageInfo.style.display = "none";
}

const hideInfo = () =>
{
    info.style.display = "none";

    canvas.style.removeProperty("display");
    pageInfo.style.removeProperty("display");
};

const toggleBG = () =>
{
    isImage = !isImage;
    const body = document.body;

    body.style.background = isImage ? "url('./resources/pexels-eberhard-grossgasteiger-844297.jpg') center center no-repeat" : "rgb(169, 144, 126)";
    body.style["backgroundSize"] = "cover";
}

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
const defaultBtn = btns["home-button"];

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

toggleBG();
toggleNav();
showHome();

async function showHome()
{
    table.innerHTML = "";

    const data = await fetchData();
    const headers = ["Row", "Type", "Value", "Time", "Date"];

    hideCanvas();
    createTableHeaders(headers);

    const dataDate = new Date(data.at(-1).date);
    const today = new Date();
    const isToday = dataDate.getDate() === today.getDate();

    createPageHeaders("Home", !isToday && dataDate.toJSON().slice(0, 10), data.at(-1).time.slice(0, -3), true);
    createTable(data.slice(-30), true);
}

async function showTemperature(isCalled = false)
{
    table.innerHTML = "";

    const symbol = `Temperature (${degreeSymbol}C)`;

    const time = dropdown.value;
    const data = await fetchData("temperature", isCalled && time === "" ? "167" : time);
    const shownData = time === "" ? data.slice(-amountToShow) : data;

    const header = ["Row", symbol, "Time", "Date"];

    showCanvas();
    createTableHeaders(header);
    createTable(shownData);

    const dataDate = new Date(data.at(-1).date);
    const today = new Date();
    const isToday = dataDate.getDate() === today.getDate();

    createPageHeaders(symbol, !isToday && dataDate.toJSON().slice(0, 10), data.at(-1).time.slice(0, -3));
    currentChart = createChart(shownData, symbol, isCalled);
}

async function showWind(isCalled = false)
{
    table.innerHTML = "";

    const symbol = "Wind Speed (m/s)";
    const time = dropdown.value;

    const data = await fetchData("wind_speed", isCalled && time === "" ? "167" : time);
    const shownData = time === "" ? data.slice(-amountToShow) : data;

    const header = ["Row", symbol, "Time", "Date"];

    showCanvas();
    createTableHeaders(header);
    createTable(shownData);

    const dataDate = new Date(data.at(-1).date);
    const today = new Date();
    const isToday = dataDate.getDate() === today.getDate();

    createPageHeaders(symbol, !isToday && dataDate.toJSON().slice(0, 10), data.at(-1).time.slice(0, -3));
    currentChart = createChart(shownData, symbol, isCalled);
}

async function showLight()
{
    table.innerHTML = "";

    const symbol = "Light Amount";
    const time = dropdown.value;

    const data = await fetchData("light", time === "" ? "167" : time);
    const shownData = time === "" ? data.slice(-amountToShow) : data;

    const header = ["Row", symbol, "Time", "Date"];

    showCanvas();
    createTableHeaders(header);
    createTable(shownData);

    const dataDate = new Date(data.at(-1).date);
    const today = new Date();
    const isToday = dataDate.getDate() === today.getDate();

    createPageHeaders(symbol, !isToday && dataDate.toJSON().slice(0, 10), data.at(-1).time.slice(0, -3));
    currentChart = createChart(shownData, symbol, true);
}

async function showRain()
{
    table.innerHTML = "";

    const symbol = "Rain Amount"
    const time = dropdown.value;
    const data = await fetchData("rain", time === "" ? "167" : time);

    const header = ["Row", symbol, "Time", "Date"];
    const shownData = time === "" ? data.slice(-amountToShow) : data;

    showCanvas();
    createTableHeaders(header);
    createTable(shownData);

    const dataDate = new Date(data.at(-1).date);
    const today = new Date();
    const isToday = dataDate.getDate() === today.getDate();

    createPageHeaders(symbol, !isToday && dataDate.toJSON().slice(0, 10), data.at(-1).time.slice(0, -3));
    currentChart = createChart(shownData, symbol, true);
}

async function showWindDir()
{
    table.innerHTML = "";

    const time = dropdown.value;

    const symbol = `Wind Direction (${angleSymbol})`;
    const data = await fetchData("wind_direction", time === "" ? "167" : time);
    const header = ["Row", symbol, "Time", "Date"];
    const shownData = time === "" ? data.slice(-amountToShow) : data;

    showCanvas();
    createTableHeaders(header);
    createTable(shownData);

    const dataDate = new Date(data.at(-1).date);
    const today = new Date();
    const isToday = dataDate.getDate() === today.getDate();

    createPageHeaders(symbol, !isToday && dataDate.toJSON().slice(0, 10), data.at(-1).time.slice(0, -3));
    currentChart = createChart(shownData, symbol, true);
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
        return console.error(err);
    }
}

function createTableHeaders(types)
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

        tableDataIndex.innerText = index;
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

function createPageHeaders(data = "", isToday = "", currentTime = "")
{
    pageInfo.innerHTML = "";
    const heading = document.createElement("h1");
    const headingTwo = document.createElement("h3");

    heading.innerText = data.toUpperCase();

    if (isToday !== "" || currentTime !== "")
    {
        headingTwo.innerText = `Last updated ${!isToday ? "today" : isToday} at ${currentTime}`;
        pageInfo.appendChild(headingTwo);
    }

    pageInfo.appendChild(heading);
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
                        color: "#FEE8B0",
                    },
                    border: {
                        color: "#FEE8B0",
                        width: 2
                    },
                    grid: {
                        display: false
                    },
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: "#FEE8B0",
                        fontSize: 20
                    },
                    border: {
                        color: "#FEE8B0",
                        width: 2
                    },
                    grid: {
                        display: true,
                    }
                },
            },
            elements: {
                bar: {
                    backgroundColor: "#DDFFBB"
                }
            }
        }
    }

    ctx.style.backgroundColor = "#675d50d9";
    Chart.defaults.color = "#F3DEBA";
    return new Chart(ctx, chartInfo);;
}