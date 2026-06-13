const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  clipboard,
} = require("electron");
const path = require("path");

let win = null;
let isPinned = false;

const isDev = !app.isPackaged;

function createWindow() {
  win = new BrowserWindow({
    width: 760,
    height: 620,
    show: false,
    frame: false,
    resizable: true,
    alwaysOnTop: false,
    skipTaskbar: true,
    backgroundColor: "#fff7e8",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  win.on("blur", () => {
    if (!isPinned && win?.isVisible()) {
      win.hide();
    }
  });
}

function showWindow() {
  if (!win) return;

  win.setAlwaysOnTop(isPinned, isPinned ? "screen-saver" : "normal");
  win.center();
  win.show();
  win.focus();

  win.webContents.send("pin-state", isPinned);
  win.webContents.send("focus-search");
}

function toggleWindow() {
  if (!win) return;

  if (win.isVisible()) {
    win.hide();
    return;
  }

  showWindow();
}

function setPinned(nextPinned) {
  isPinned = Boolean(nextPinned);

  if (win) {
    win.setAlwaysOnTop(isPinned, isPinned ? "screen-saver" : "normal");
    win.webContents.send("pin-state", isPinned);
  }

  return isPinned;
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register("F2", toggleWindow);

  ipcMain.handle("hide-window", () => {
    if (win) {
      win.hide();
    }
  });

  ipcMain.handle("copy-text", (_event, text) => {
    clipboard.writeText(text);

    if (win && !isPinned) {
      win.hide();
    }
  });

  ipcMain.handle("get-pinned", () => {
    return isPinned;
  });

  ipcMain.handle("set-pinned", (_event, nextPinned) => {
    return setPinned(nextPinned);
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
