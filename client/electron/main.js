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

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

function toIndex() {
    const mainWindow = new BrowserWindow({
        width: 1000,
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
    const [assignmentTitle, assignmentDetails, dueDate] = data;

    console.log("Received Assignment Title: " + assignmentTitle);
    console.log("Received Assignment Details: " + assignmentDetails);
    console.log("Received Due Date: " + dueDate);
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
