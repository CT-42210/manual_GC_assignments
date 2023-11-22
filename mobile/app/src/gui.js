const { exec, execFile} = require("child_process");
const fs = require("fs");
const nodeConsole = require("console");
const { ipcRenderer, dialog } = require("electron");

const terminalConsole = new nodeConsole.Console(process.stdout, process.stderr);
let child;

ipcRenderer.send("run-command", "ls");
ipcRenderer.on("run-command-result", (event, result) => {
    if (result.error) {
        console.error("Error:", result.error);
    } else {
        console.log("Output:", result.output);
    }
});

const printBoth = (str) => {
    console.log(`Javascript: ${str}`);
    terminalConsole.log(`Javascript: ${str}`);
};


const userData = (c, callback) => {
    if (!fs.existsSync("login")) {
        console.log('The "login" file does not exist.');
        return;
    }

    fs.readFile("login", "utf8", (err, data) => {
        if (err) {
            console.error('Error reading the "login" file:', err);
            return;
        }

        const lines = data.trim().split("\n");
        printBoth(lines)

        if (lines.length >= 2) {
            const userName = lines[0];
            const userEmail = lines[1];
            console.log("Line 1:", userName);
            console.log("Line 2:", userEmail);
            if (c === 0) {
                callback(userName);
            }
            if (c === 1) {
                callback(userEmail);
            }
        } else {
            console.error('The "login" file does not contain at least two lines.');
        }
    });
};


const sendToProgram = (str) => {
    child.stdin.write(str);
    child.stdout.on("data", (data) => {
        printBoth(`Following data has been piped from python program: ${data.toString("utf8")}`);
    });
};

const login = () => {
    printBoth("attempting login");
    ipcRenderer.send("login", "True");
};

const logout = () => {
    printBoth("attempting logout");
    ipcRenderer.send("login", "False");
};

function importFile() {
    printBoth("attempting import");
    ipcRenderer.send("import-send");
}

ipcRenderer.on("import-reply", (event, data) => {
    printBoth("triggered");

    const assignmentData = JSON.parse(data);
    printBoth(assignmentData);

    const importTitle = assignmentData["title"];
    const importDescription = assignmentData["details"];
    const importDate = assignmentData["dueDate"];

    document.getElementById("assignmentTitle").value = importTitle;
    document.getElementById("assignmentDetails").value = importDescription;
    document.getElementById("dueDate").value = importDate;
});

function publish(event) {
    event.preventDefault();

    const assignmentTitle = document.getElementById("assignmentTitle").value;
    const assignmentDetails = document.getElementById("assignmentDetails").value;
    const dueDate = document.getElementById("dueDate").value;

    if (assignmentTitle.trim() === "" || assignmentDetails.trim() === "" || dueDate.trim() === "") {
        alert("Please fill in all form fields.");
        return;
    }

    console.log("Assignment Title: " + assignmentTitle);
    console.log("Assignment Details: " + assignmentDetails);
    console.log("Due Date: " + dueDate);

    userData(1, (result) => {
            userEmail = result;
        });

    const data = [userEmail, assignmentTitle, assignmentDetails, dueDate];
    printBoth("attempting publish");
    ipcRenderer.send("publish", data);

    window.location.reload();
    document.getElementById("assignmentTitle").value = "";
    document.getElementById("assignmentDetails").value = "";
    document.getElementById("dueDate").value = "";
}

function loadEditPage() {
    ipcRenderer.send("load-edit-page");
}

ipcRenderer.on("return-edit-page", (event, data) => {
    const dataArray = JSON.parse(data.replace(/'/g, '"'));

    const dropdown = document.getElementById("assignmentDropdown");

    const option = document.createElement("option");
    option.value = "default"; // Use the assignment Id as the option value
    option.text = "TITLE - ID"; // Use the assignment title as the option text
    dropdown.add(option);

    for (let i = 0; i < dataArray.length; i++) {
        const option = document.createElement("option");
        option.value = dataArray[i][1]; // Use the assignment Id as the option value
        option.text = (dataArray[i][0] + " - " + dataArray[i][1]); // Use the assignment title as the option text
        dropdown.add(option);
    }
});

function edit(event) {
    event.preventDefault();

    const assignmentID = 122345

    const assignmentTitle = document.getElementById("assignmentTitle").value;
    const assignmentDetails = document.getElementById("assignmentDetails").value;
    const dueDate = document.getElementById("dueDate").value;

    if (assignmentTitle.trim() === "" || assignmentDetails.trim() === "" || dueDate.trim() === "") {
        alert("Please fill in all form fields.");
        return;
    }

    console.log("Assignment Title: " + assignmentTitle);
    console.log("Assignment Details: " + assignmentDetails);
    console.log("Due Date: " + dueDate);

    userData(1, (result) => {
            userEmail = result;
        });

    const data = [assignmentID, userEmail, assignmentTitle, assignmentDetails, dueDate];
    printBoth("attempting edit");
    ipcRenderer.send("edit", data);

    window.location.reload();
    document.getElementById("assignmentTitle").value = "";
    document.getElementById("assignmentDetails").value = "";
    document.getElementById("dueDate").value = "";
}


function exportFile(event) {
    event.preventDefault();

    const assignmentTitle = document.getElementById("assignmentTitle").value;
    const assignmentDetails = document.getElementById("assignmentDetails").value;
    const dueDate = document.getElementById("dueDate").value;

    if (assignmentTitle.trim() === "" || assignmentDetails.trim() === "" || dueDate.trim() === "") {
        alert("Please fill in all form fields.");
        return;
    }

    console.log("Assignment Title: " + assignmentTitle);
    console.log("Assignment Details: " + assignmentDetails);
    console.log("Due Date: " + dueDate);

    const assignmentData = {
        title: assignmentTitle,
        details: assignmentDetails,
        dueDate: dueDate,
    };

    const jsonData = JSON.stringify(assignmentData);

    dialog
        .showSaveDialog({
            title: "Export Assignment",
            defaultPath: "assignment.json", // Default file name and extension
            filters: [{ name: "JSON Files", extensions: ["json"] }],
        })
        .then((result) => {
            // Check if the user chose a file location
            if (!result.canceled) {
                const filePath = result.filePath;

                fs.writeFile(filePath, jsonData, (err) => {
                    if (err) {
                        console.error("Error writing the JSON file:", err);
                    } else {
                        console.log("JSON file saved successfully:", filePath);
                    }
                });
            }
        })
        .catch((error) => {
            console.error("Error during save dialog:", error);
        });

    window.location.reload();
    document.getElementById("assignmentTitle").value = "";
    document.getElementById("assignmentDetails").value = "";
    document.getElementById("dueDate").value = "";
}

function exportFileAdvanced(event) {
    event.preventDefault();

    const assignmentTitle = document.getElementById("assignmentTitle").value;
    const assignmentDetails = document.getElementById("assignmentDetails").value;
    const dueDate = document.getElementById("dueDate").value;

    if (assignmentTitle.trim() === "" || assignmentDetails.trim() === "" || dueDate.trim() === "") {
        alert("Please fill in all form fields.");
        return;
    }

    console.log("Assignment Title: " + assignmentTitle);
    console.log("Assignment Details: " + assignmentDetails);
    console.log("Due Date: " + dueDate);

    const assignmentData = {
        title: assignmentTitle,
        details: assignmentDetails,
        dueDate: dueDate,
    };

    // Convert the object to a JSON string
    const jsonData = JSON.stringify(assignmentData);

    dialog
        .showSaveDialog({
            title: "Export Assignment",
            defaultPath: "assignment.json", // Default file name and extension
            filters: [{ name: "JSON Files", extensions: ["json"] }],
        })
        .then((result) => {
            // Check if the user chose a file location
            if (!result.canceled) {
                const filePath = result.filePath;

                fs.writeFile(filePath, jsonData, (err) => {
                    if (err) {
                        console.error("Error writing the JSON file:", err);
                    } else {
                        console.log("JSON file saved successfully:", filePath);
                    }
                });
            }
        })
        .catch((error) => {
            console.error("Error during save dialog:", error);
        });

    window.location.reload();
    document.getElementById("assignmentTitle").value = "";
    document.getElementById("assignmentDetails").value = "";
    document.getElementById("dueDate").value = "";
}

document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login");
    if (loginButton) {
        loginButton.addEventListener("click", login);
    }

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }

    const publishButton = document.getElementById("publishButton");
    if (publishButton) {
        publishButton.addEventListener("click", publish);
    }

    const editPublishButton = document.getElementById("editPublishButton");
    if (editPublishButton) {
        editPublishButton.addEventListener("click", edit);
    }

    const assignmentDropdown = document.getElementById("assignmentDropdown");
    if (assignmentDropdown) {
        loadEditPage();
    }

    const exportButton = document.getElementById("exportButton");
    if (exportButton) {
        exportButton.addEventListener("click", exportFile);
    }

    const importButton = document.getElementById("importButton");
    if (importButton) {
        importButton.addEventListener("click", importFile);
    }

    const publishButtonAdvanced = document.getElementById("publishButtonAdvanced");
    if (publishButtonAdvanced) {
        publishButtonAdvanced.addEventListener("click", publishAdvanced);
    }

    var username = document.getElementById("username");
    if (username) {
        printBoth("username");
        userData(0, (result) => {
            username.innerHTML = result;
            console.log(result);
        });
    }

    var useremail = document.getElementById("useremail");
    if (useremail) {
        printBoth("useremail");
        userData(1, (result) => {
            username.innerHTML = result;
            console.log(result);
        });
    }
});