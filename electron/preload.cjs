const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("stasher", {
  hideWindow: () => ipcRenderer.invoke("hide-window"),
  copyText: (text) => ipcRenderer.invoke("copy-text", text),
  onFocusSearch: (callback) => {
    ipcRenderer.on("focus-search", callback);
  },
});
