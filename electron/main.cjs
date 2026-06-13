const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  clipboard,
} = require("electron");
const path = require("path");

let win = null;

const isDev = !app.isPackaged;

function createWindow() {
  win = new BrowserWindow({
    width: 760,
    height: 620,
    show: false,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: "#0f0f0f",
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
    if (win) win.hide();
  });
}

function toggleWindow() {
  if (!win) return;

  if (win.isVisible()) {
    win.hide();
  } else {
    win.center();
    win.show();
    win.focus();
    win.webContents.send("focus-search");
  }
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register("F2", toggleWindow);

  ipcMain.handle("hide-window", () => {
    if (win) win.hide();
  });

  ipcMain.handle("copy-text", (_event, text) => {
    clipboard.writeText(text);
    if (win) win.hide();
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
