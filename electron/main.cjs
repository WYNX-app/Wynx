const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

// Desliga aceleração de GPU — evita crashes de Dawn Graphite no Windows


const isDev = !app.isPackaged

function storePath() {
  return path.join(app.getPath('userData'), 'wynx-data.json')
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1080,
    minHeight: 700,
    title: 'WYNX — Gestão Inteligente de Estoque',
    backgroundColor: '#EFF6FF',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  app.setAppUserModelId('br.com.wynx.estoque')
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('store:load', async () => {
  const file = storePath()
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
})

ipcMain.handle('store:save', async (_event, data) => {
  const file = storePath()
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
  return true
})

ipcMain.handle('store:export', async (_event, data) => {
  const win = BrowserWindow.getFocusedWindow()
  const result = await dialog.showSaveDialog(win || undefined, {
    title: 'Exportar backup WYNX',
    defaultPath: 'wynx-backup.json',
    filters: [{ name: 'JSON', extensions: ['json'] }]
  })
  if (result.canceled || !result.filePath) return false
  fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf8')
  return true
})

ipcMain.handle('store:import', async () => {
  const win = BrowserWindow.getFocusedWindow()
  const result = await dialog.showOpenDialog(win || undefined, {
    title: 'Importar backup WYNX',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  })
  if (result.canceled || !result.filePaths[0]) return null
  try {
    return JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'))
  } catch {
    return null
  }
})