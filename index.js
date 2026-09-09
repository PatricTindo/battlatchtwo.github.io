const intro = document.getElementById("intro");
const transitionBlock = document.getElementById("transitionBlock");
const app = document.getElementById("app");
const navigationItems = document.querySelectorAll(".nav-item");
const pageTitle = document.getElementById("pageTitle");
const pageContent = document.getElementById("pageContent");
const demoOutput = document.getElementById("demoOutput");

const pages = {
    dashboard: {
        title: "Dashboard"
    }
};

function logDemoState(message) {
    if (!demoOutput) {
        return;
    }

    const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    demoOutput.textContent = `${timestamp} • ${message}`;
}

const bridge = (typeof window !== "undefined" && window.uibuilder) || {
    send(msg) {
        logDemoState(`Standalone preview: ${JSON.stringify(msg)}`);
        console.log("Standalone preview payload:", msg);
    },
    onChange() {
        return undefined;
    }
};

function startApplication() {
    transitionBlock.classList.add("animate");

    setTimeout(() => {
        app.classList.add("visible");
        intro.classList.add("hidden");
    }, 1150);
}

function changePage(pageName) {
    const selectedPage = pages[pageName];

    if (!selectedPage) {
        return;
    }

    pageTitle.textContent = selectedPage.title;
    pageContent.innerHTML = `
        <div class="empty-state">
            <div class="device-wrap">
                <div class="standalone-banner">Static prototype • no Node-RED required</div>
                <div class="battery-status">
                    <button id="batteryStatusButton" type="button">BATTERY</button>
                    <span id="batteryValue">72%</span>
                </div>
                <div class="device">
                    <div id="lcdDisplay">
                        <span id="lcdJob">JOB1</span>
                        <span id="lcdDay">MON</span>
                        <span id="lcdTime">02:28</span>
                    </div>
                    <img src="battlatch.png" class="device-image" alt="BattLatch device illustration">
                    <button id="dayButton" type="button">DAY</button>
                    <button id="hourButton" type="button">HOUR</button>
                    <button id="minButton" type="button">MIN</button>
                    <button id="clearButton" type="button">CLEAR</button>
                    <button id="clockButton" type="button">CLOCK</button>
                    <button id="enterButton" type="button">ENTER</button>
                </div>
                <div id="demoOutput" class="demo-output">Preview mode active. Device actions will be logged locally.</div>
            </div>
        </div>
    `;

    wireDeviceControls();
}

function wireDeviceControls() {
    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "ALL", "SUN"];
    const jobNames = ["JOB1", "JOB2", "JOB3", "JOB4"];
    let dayIndex = 0;
    let hour = 15;
    let minute = 15;
    let jobIndex = 0;

    const dayButton = document.getElementById("dayButton");
    const hourButton = document.getElementById("hourButton");
    const minuteButton = document.getElementById("minButton");
    const lcdJob = document.getElementById("lcdJob");
    const lcdDay = document.getElementById("lcdDay");
    const lcdTime = document.getElementById("lcdTime");
    const enterButton = document.getElementById("enterButton");
    const batteryStatusButton = document.getElementById("batteryStatusButton");
    const batteryValue = document.getElementById("batteryValue");

    if (lcdJob) {
        lcdJob.textContent = jobNames[jobIndex];
    }

    if (dayButton) {
        dayButton.addEventListener("click", () => {
            dayIndex = (dayIndex + 1) % days.length;
            lcdDay.textContent = days[dayIndex];
            logDemoState(`Day set to ${days[dayIndex]}`);
        });
    }

    if (hourButton) {
        hourButton.addEventListener("click", () => {
            hour = (hour + 1) % 24;
            lcdTime.textContent = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            logDemoState(`Time updated to ${lcdTime.textContent}`);
        });
    }

    if (minuteButton) {
        minuteButton.addEventListener("click", () => {
            minute = (minute + 1) % 60;
            lcdTime.textContent = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            logDemoState(`Time updated to ${lcdTime.textContent}`);
        });
    }

    if (enterButton) {
        enterButton.addEventListener("click", () => {
            jobIndex = (jobIndex + 1) % jobNames.length;
            if (lcdJob) {
                lcdJob.textContent = jobNames[jobIndex];
            }

            const selectedDay = days[dayIndex];
            const selectedHour = String(hour).padStart(2, "0");
            const selectedMinute = String(minute).padStart(2, "0");
            const message = `${selectedDay}${selectedHour}${selectedMinute}`;

            bridge.send({
                topic: "msg/date",
                payload: message
            });

            logDemoState(`Job advanced to ${jobNames[jobIndex]} • Submitted ${message}`);
        });
    }

    if (batteryStatusButton && batteryValue) {
        batteryStatusButton.addEventListener("click", () => {
            const currentBattery = Number.parseInt(batteryValue.textContent, 10) || 72;
            const nextBattery = currentBattery >= 100 ? 20 : Math.min(100, currentBattery + 6);
            batteryValue.textContent = `${nextBattery}%`;
            bridge.send({
                topic: "msg/battery/status",
                payload: String(nextBattery)
            });
            logDemoState(`Battery simulated at ${nextBattery}%`);
        });
    }
}

navigationItems.forEach((item) => {
    item.addEventListener("click", () => {
        navigationItems.forEach((navItem) => {
            navItem.classList.remove("active");
        });

        item.classList.add("active");
        const pageName = item.dataset.page;
        changePage(pageName);
    });
});

window.addEventListener("load", () => {
    setTimeout(startApplication, 1400);
    wireDeviceControls();
    logDemoState("Preview mode active. Device actions are local-only.");
});
