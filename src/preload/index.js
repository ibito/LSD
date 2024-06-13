import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

const streamDeck = {
  openStreamDeck: (devicePath) => ipcRenderer.invoke('open-stream-deck', devicePath),
  closeStreamDeck: (devicePath) => ipcRenderer.invoke('close-stream-deck', devicePath),
  getConnectedStreamDecks: () => ipcRenderer.invoke('get-connected-stream-decks'),
  getStreamDeckSpecs: (devicePath) => ipcRenderer.invoke('get-stream-deck-specs', devicePath),
  onStreamDeckKeyDown: (callback) =>
    ipcRenderer.on('stream-deck-key-down', (event, arg) => {
      console.log(arg)
      callback(event, arg)
    }),
  onStreamDeckKeyUp: (callback) =>
    ipcRenderer.on('stream-deck-key-up', (event, arg) => callback(event, arg)),
  onStreamDeckRotateLeft: (callback) =>
    ipcRenderer.on('stream-deck-rotate-left', (event, arg) => callback(event, arg)),
  onStreamDeckRotateRight: (callback) =>
    ipcRenderer.on('stream-deck-rotate-right', (event, arg) => callback(event, arg)),
  onStreamDeckEncoderUp: (callback) =>
    ipcRenderer.on('stream-deck-encoder-up', (event, arg) => callback(event, arg)),
  onStreamDeckEncoderDown: (callback) =>
    ipcRenderer.on('stream-deck-encoder-down', (event, arg) => callback(event, arg)),
  onStreamDeckLcdShortPress: (callback) =>
    ipcRenderer.on('stream-deck-lcd-short-press', (event, arg) => callback(event, arg)),
  onStreamDeckLcdLongPress: (callback) =>
    ipcRenderer.on('stream-deck-lcd-long-press', (event, arg) => callback(event, arg)),
  onStreamDeckLcdSwipe: (callback) =>
    ipcRenderer.on('stream-deck-lcd-swipe', (event, arg) => callback(event, arg)),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('streamDeck', streamDeck)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
