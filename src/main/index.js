import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { listStreamDecks, openStreamDeck } from '@elgato-stream-deck/node'

const openDevices = {}
let mainWindow = null

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('get-connected-stream-decks', async () => {
    try {
      const devices = await listStreamDecks()
      return devices.map((device) => ({
        path: device.path,
        open: false,
        type: device.constructor.name
      }))
    } catch (error) {
      console.error('Failed to list Stream Decks:', error)
      return []
    }
  })

  ipcMain.handle('open-stream-deck', async (event, devicePath) => {
    try {
      const device = await openStreamDeck(devicePath)
      console.log('Device:', device) // Debugging log
      console.log('Device type:', device.constructor.name) // Debugging log

      openDevices[devicePath] = device
      device.on('down', (keyIndex, args) => {
        console.log('Key down:', keyIndex, args) // Debugging log
        mainWindow?.webContents.send('stream-deck-key-down', { path: devicePath, keyIndex })
      })

      device.on('up', (keyIndex) => {
        console.log('Key up:', keyIndex) // Debugging log
        device.fillKeyColor(keyIndex, 0, 255, 0)
        mainWindow?.webContents.send('stream-deck-key-up', { path: devicePath, keyIndex })
      })

      device.on('rotateLeft', (index, amount) => {
        mainWindow?.webContents.send('stream-deck-rotate-left', {
          path: devicePath,
          dialIndex: index,
          amount: amount
        })
      })

      device.on('rotateRight', (index, amount) => {
        mainWindow?.webContents.send('stream-deck-rotate-right', {
          path: devicePath,
          dialIndex: index,
          amount: amount
        })
      })

      device.on('encoderUp', (index) => {
        mainWindow?.webContents.send('stream-deck-encoder-up', {
          path: devicePath,
          dialIndex: index
        })
      })

      device.on('encoderDown', (index) => {
        mainWindow?.webContents.send('stream-deck-encoder-down', {
          path: devicePath,
          dialIndex: index
        })
      })

      device.on('lcdShortPress', (index, pos) => {
        mainWindow?.webContents.send('stream-deck-lcd-short-press', {
          path: devicePath,
          position: pos
        })
      })

      device.on('lcdLongPress', (index, pos) => {
        mainWindow?.webContents.send('stream-deck-lcd-long-press', {
          path: devicePath,
          position: pos
        })
      })

      device.on('lcdSwipe', (index, index2, pos, pos2) => {
        mainWindow?.webContents.send('stream-deck-lcd-swipe', {
          path: devicePath,
          start: pos,
          end: pos2
        })
      })

      return {
        model: device.device.deviceProperties.MODEL,
        productName: device.device.deviceProperties.PRODUCT_NAME,
        columns: device.device.deviceProperties.COLUMNS,
        rows: device.device.deviceProperties.ROWS,
        iconSize: device.device.deviceProperties.ICON_SIZE,
        touchButtons: device.device.deviceProperties.TOUCH_BUTTONS,
        keyDirection: device.device.deviceProperties.KEY_DIRECTION
      }
    } catch (error) {
      console.error('Failed to open Stream Deck:', error)
      return { error: error.message }
    }
  })

  ipcMain.handle('close-stream-deck', async (event, devicePath) => {
    try {
      const device = openDevices[devicePath]
      if (device) {
        device.removeAllListeners('down')
        device.removeAllListeners('up')
        device.removeAllListeners('rotateLeft')
        device.removeAllListeners('rotateRight')
        device.removeAllListeners('encoderUp')
        device.removeAllListeners('encoderDown')
        device.removeAllListeners('lcdShortPress')
        device.removeAllListeners('lcdLongPress')
        device.removeAllListeners('lcdSwipe')
        device.close()
        delete openDevices[devicePath]
        return { success: true }
      } else {
        return { error: 'Device not found or not opened' }
      }
    } catch (error) {
      console.error('Failed to close Stream Deck:', error)
      return { error: error.message }
    }
  })

  ipcMain.handle('stream-deck-key-down', (event, devicePath, args) => {
    console.log('-------------------')
    console.log(event, devicePath, args)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

listStreamDecks().then((devices) => {
  console.log(devices)
})
