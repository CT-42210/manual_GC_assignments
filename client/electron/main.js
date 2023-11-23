const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const exec = require("child_process").exec;
const { execFile } = require("child_process");
const path = require("path");

const nodeConsole = require("console");
const fs = require("fs");
const myConsole = new nodeConsole.Console(process.stdout, process.stderr);
let child;

function printBoth(str) {
    console.log("main.js:    " + str);
    myConsole.log("main.js:    " + str);
}

function pushJSON(data, type) {
    const baseurl = 'https://manual-gc-assignments.ngrok.dev';
    const url = baseurl + type

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };

    fetch(url, requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log('Response data:', data);
        showSuccessPopup();
      })
      .catch(error => {
        console.error('Error:', error);
      });
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1050,
        height: 750,
        resizable: true,
        webPreferences: {
            preload: path.join(__dirname, "gui.js"),
            contextIsolation: true,
            nodeIntegration: true,
        },
    });

    const fs = require("fs");
    const rootPath = app.getAppPath();
    const tokenFilePath = path.join(rootPath, "token.json");

    console.log(tokenFilePath);

    fs.access(tokenFilePath, fs.constants.F_OK, (err) => {
        if (err) {
            mainWindow.loadFile(path.join(rootPath, "electron/login.html"));
        } else {
            mainWindow.loadFile(path.join(rootPath, "electron/index.html"));
        }
    });

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
}


app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

function toIndex() {
    const mainWindow = new BrowserWindow({
        width: 1050,
        height: 750,
        resizable: true,
        webPreferences: {
            preload: path.join(__dirname, "gui.js"),
            contextIsolation: true,
            nodeIntegration: true,
        },
    });

    mainWindow.loadFile(path.join(__dirname, "index.html"));
}

ipcMain.on("publish", (event, data) => {
    const [userEmail, assignmentTitle, assignmentDetails, dueDate] = data;
    const dueDateSplit = dueDate.split("-")
    printBoth(dueDateSplit[0])

    const jsonFormat = {
        "title": assignmentTitle,
        "description": assignmentDetails,
        "state": "PUBLISHED",
        "dueDate": {
            "year": parseInt(dueDateSplit[0]),
            "month": parseInt(dueDateSplit[1]),
            "day": parseInt(dueDateSplit[2])
        },
        "dueTime": {
            "hours": 27,
            "minutes": 59,
            "seconds": 59,
            "nanos": 0
        },
        "assigneeMode": "INDIVIDUAL_STUDENTS",
        "individualStudentsOptions": {
            "studentIds": userEmail
        },
        "submissionModificationMode": "MODIFIABLE",
        "workType": "ASSIGNMENT"
    };

    pushJSON(jsonFormat, "/create")
});

ipcMain.on("publishEdit", (event, data) => {
    const [assignmentID, userEmail, assignmentTitle, assignmentDetails, dueDate] = data;
    const dueDateSplit = dueDate.split("-")
    printBoth(dueDateSplit[0])

    const jsonFormat = {
        "id": assignmentID,
        "title": assignmentTitle,
        "description": assignmentDetails,
        "state": "PUBLISHED",
        "dueDate": {
            "year": parseInt(dueDateSplit[0]),
            "month": parseInt(dueDateSplit[1]),
            "day": parseInt(dueDateSplit[2])
        },
        "dueTime": {
            "hours": 23,
            "minutes": 59,
            "seconds": 59,
            "nanos": 0
        },
    };

    pushJSON(jsonFormat, "/edit")
});

ipcMain.on("load-edit-page", (event) => {
    console.log("executing login");
    const pythonScriptPath = "getAssignments.py";
    child = execFile("python.exe", [pythonScriptPath], (error, stdout, stderr) => {
        if (error !== null) {
            console.log("exec error: " + error);
        } else {
            event.reply("return-edit-page", stdout);
        }
    });
});

ipcMain.on("import-send", (event, arg) => {
    dialog
        .showOpenDialog({
            title: "Import Assignment",
            filters: [{ name: "JSON Files", extensions: ["json"] }],
        })
        .then((result) => {
            if (!result.canceled) {
                const filePath = result.filePaths[0];

                fs.readFile(filePath, "utf8", (err, data) => {
                    if (err) {
                        console.error("Error reading the JSON file:", err);
                        return;
                    }

                    try {
                        if (!result.canceled) {
                            event.reply("import-reply", data);
                        }
                    } catch (error) {
                        console.error("Error parsing JSON:", error);
                        console.error("JSON Data:", data);
                    }
                });
            }
        })
        .catch((error) => {
            console.error("Error during open dialog:", error);
        });
});

ipcMain.on("login", (event, arg) => {
    if (arg === "True") {
        console.log("executing login");
        const pythonScriptPath = "login.py";
        child = execFile("python3", [pythonScriptPath], (error, stdout, stderr) => {
            if (error !== null) {
                console.log("exec error: " + error);
            } else {
                printBoth(stdout);
                toIndex();
                child.on("close", (code) => {
                    printBoth(code);
                    printBoth("file generated");
                    toIndex();
                });
            }
        });
    } else if (arg === "False") {
        console.log("executing logout");
        const tokenPath = "token.json";
        child = exec(`rm ${tokenPath} login`, function (error, stdout, stderr) {
            if (error !== null) {
                console.log("exec error: " + error);
            } else {
                printBoth("token deleted");
            }
        });
    }
});

app.whenReady().then(() => {
    createWindow();

    app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
