const { app, BrowserWindow, screen } = require("electron");
const windowStateKeeper = require("electron-window-state");
const path = require("path");
const { Environment, PORT, DefaultWindowHeight, DefaultWindowWidth } = require("./common/constants");
let win;

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
    resizable: false,
    height: DefaultWindowHeight,
    width: DefaultWindowWidth,
    // frame: false,
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
