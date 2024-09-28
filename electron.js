// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const { app, BrowserWindow } = require('electron')

const createWindow = () => {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  win.loadURL('http://localhost:19006')

  win.on('closed', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    win = null
  })
}

app.on('ready', createWindow)
