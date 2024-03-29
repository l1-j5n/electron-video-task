const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  globalShortcut,
} = require("electron");
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

  // Trim video with ffmpeg library
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

/**
 *
 * @param {*} inputPath Path of currently selected video
 * @param {*} outputPath Path where new clip will be stored
 * @param {*} startTime Clip start time in video
 * @param {*} duration Duration from the start time in video
 * @returns Video clip saved or not information to the renderer process
 */
const cutVideoClip = async (
  inputPath,
  outputPath,
  startTime,
  endTime,
  maxRight
) => {
  // Cut clip from video with ffmpeg library
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputPath)
      .inputOptions(`-ss ${0}`)
      .inputOptions(`-t ${startTime}`)
      .input(inputPath)
      .inputOptions(`-ss ${endTime}`)
      .inputOptions(`-t ${maxRight}`)
      .complexFilter("[0:v][1:v]concat=n=2:v=1:a=0[outv]")
      .map("[outv]")
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .run();
  });
};

// Trip clip from the video and save into user's system
ipcMain.on("trim-video", async (event, args) => {
  try {
    // Ask user for path to save new trimmed video clip
    const filePath = await dialog.showSaveDialog(
      BrowserWindow.getFocusedWindow(),
      {
        title: "Choose Output File Name",
        filters: [{ name: "Videos", extensions: ["mp4"] }],
      }
    );

    // If user selects a valid path
    if (filePath?.filePath) {
      const outputPath = filePath?.filePath + ".mp4";
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

// Cut clip from the video and save into user's system
ipcMain.on("cut-video", async (event, args) => {
  try {
    // Ask user for path to save new cut video clip
    const filePath = await dialog.showSaveDialog(
      BrowserWindow.getFocusedWindow(),
      {
        title: "Choose Output File Name",
        filters: [{ name: "Videos", extensions: ["mp4"] }],
      }
    );

    // If user selects a valid path
    if (filePath?.filePath) {
      const outputPath = filePath?.filePath + ".mp4";
      let newVideoClip = await cutVideoClip(
        args?.inputPath,
        outputPath,
        args?.startTime,
        args?.endTime,
        args?.maxRight
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

  // Manage state/position of window in screen
  const mainWindowState = windowStateKeeper();

  // Create new window
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

  // Managing state with "electron-window-state" library
  mainWindowState.manage(win);
}

app.whenReady().then(() => {
  createWindow();

  // Restrict user from open devtools while in production mode
  if (Environment === "PRODUCTION") {
    globalShortcut.register("Control+Shift+I", () => {
      return false;
    });
  }
});

// Hide menus of the toolbar
app.on("ready", () => {
  Menu.setApplicationMenu(null);
});
