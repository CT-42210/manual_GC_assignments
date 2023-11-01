const { app, BrowserWindow, ipcMain, dialog, } = require("electron");
const fs = require("fs");

ipcMain.on('import-send', (event, arg) => {
  dialog.showOpenDialog({
    title: 'Import Assignment',
    filters: [{ name: 'JSON Files',
      extensions: ['json'] }],
  })
    .then((result) => {
      if (!result.canceled) {
        const filePath = result.filePaths[0];

        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading the JSON file:', err);
            return;
          }

          try {
            const assignmentData = JSON.parse(data);

            console.log(assignmentData)

            event.sender.send('import-reply', assignmentData)

          } catch (error) {
            console.error('Error parsing JSON:', error);
            console.error('JSON Data:', data);
          }
        });
      }
    })
    .catch((error) => {
      console.error('Error during open dialog:', error);
    });
})
