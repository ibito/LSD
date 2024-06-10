const { app, BrowserWindow } = require('electron');
const path = require('path');
const { listStreamDecks } = require('@elgato-stream-deck/node');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true // Enable Node.js integration
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // List connected Stream Decks
  listStreamDecks().then(devices => {
    console.log('Connected Stream Decks:', devices);
    // Send devices list to renderer process if needed
    mainWindow.webContents.send('streamDeckDevices', devices);
  }).catch(error => {
    console.error('Error listing Stream Decks:', error);
  });
  // Example: Detect button press
//   myStreamDeck.on('down', (device, keyIndex) => {
//     console.log(`Button ${keyIndex} down on device ${device.id}`);
//     // Do something when a button is pressed
//   });

//   // Example: Detect button release
//   myStreamDeck.on('up', (device, keyIndex) => {
//     console.log(`Button ${keyIndex} up on device ${device.id}`);
//     // Do something when a button is released
//   });

  // Example: Set a button image
//   myStreamDeck.fillImageFromFile(0, path.join(__dirname, 'button-image.png'))
}

app.on('ready', createWindow);
