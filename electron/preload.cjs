const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("stasher", {
  hideWindow: () => ipcRenderer.invoke("hide-window"),

  copyText: (text) => ipcRenderer.invoke("copy-text", text),

  getPinned: () => ipcRenderer.invoke("get-pinned"),

  setPinned: (nextPinned) => ipcRenderer.invoke("set-pinned", nextPinned),

  onFocusSearch: (callback) => {
    ipcRenderer.on("focus-search", () => callback());
  },

  onPinState: (callback) => {
    ipcRenderer.on("pin-state", (_event, isPinned) => callback(isPinned));
  },
});
