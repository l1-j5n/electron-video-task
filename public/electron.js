const { app, BrowserWindow, dialog, ipcMain, Menu } = require("electron");
const windowStateKeeper = require("electron-window-state");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
ffmpeg.setFfmpegPath(ffmpegPath);
const {
  Environment,
  PORT,
  DefaultWindowHeight,
  DefaultWindowWidth,
} = require("./common/constants");
let win;

/**
 * 
 * @param {*} inputPath Path of currently selected video
 * @param {*} outputPath Path where new clip will be stored
 * @param {*} startTime Clip start time in video
 * @param {*} duration Duration from the start time in video
 * @returns Video clip saved or not information to the renderer process
 */
const trimVideoClip = (inputPath, outputPath, startTime, duration) => {
  const durationInSeconds = duration - startTime;

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .duration(durationInSeconds)
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .run();
  });
};

// Trip clip from the video and save into user's system
ipcMain.on("trim-video", async (event, args) => {
  try {
    console.log("trim video aysnc function called :: ", args);

    // Ask user for path to save new trimmed video clip
    const filePath = await dialog.showSaveDialog({
      title: "Choose Output File Name",
      filters: [{ name: "Videos", extensions: ["mp4"] }],
    });
    console.log("filePath: ", filePath);

    // If user selects a valid path
    if (filePath?.filePath) {
      const outputPath = filePath?.filePath + ".mp4"
      console.log("outputPath: ", outputPath);
      let newVideoClip = await trimVideoClip(
        args?.inputPath,
        outputPath,
        args?.startTime,
        args?.duration
      );

      if (newVideoClip) {
        event.reply("clip-save-success", "Video saved successfully.");
      } else {
        event.reply("clip-save-error", "Error in saving video!");
      }
    } else {
      event.reply("clip-save-error", "User canceled file selection!");
    }
  } catch (err) {
    console.log("err: ", err);
    event.reply("clip-save-error", err?.message);
  }
});

// CREATE MAIN WINDOW
function createWindow() {
  console.log("starting APP ####################################");

  // If application is already running then restrict to start new app instance
  const singleInstanceData = { name: "Video Editor" };
  const gotTheLock = app.requestSingleInstanceLock(singleInstanceData);

  if (!gotTheLock) {
    app.quit();
  }

  // for manage state of window in screen
  const mainWindowState = windowStateKeeper();

  // creating new window
  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    resizable: true,
    titleBarStyle: "hidden",
    maximizable: true,
    fullscreenable: true,
    height: DefaultWindowHeight,
    width: DefaultWindowWidth,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    "web-preferences": {
      "web-security": false,
    },
  });

  if (Environment === "DEVELOPMENT") {
    // loading html from build
    win.loadURL(`http://localhost:${PORT}`);
    // open developer tool when app get start
    win.webContents.openDevTools();
  } else if (Environment === "PRODUCTION") {
    // loading html from build
    win.loadURL(`file://${path.join(__dirname, "../build/index.html#/")}`);
  }

  // managing state with "electron-window-state" library
  mainWindowState.manage(win);
}

app.whenReady().then(createWindow);

app.on('ready', () => {
  Menu.setApplicationMenu(null);
});
