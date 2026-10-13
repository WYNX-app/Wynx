const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('wynxDesktop', {
  load: () => ipcRenderer.invoke('store:load'),
  save: (data) => ipcRenderer.invoke('store:save', data),
  exportBackup: (data) => ipcRenderer.invoke('store:export', data),
  importBackup: () => ipcRenderer.invoke('store:import')
})
