import { useEffect, useState } from 'react'
import StreamDeck from './components/StreamDeck'
// import Start from './components/Start'

function App() {
  // const ipcHandle = () => window.electron.ipcRenderer.send('ping')
  const [currentInput, setCurrentInput] = useState('')

  const handleOpenDevice = async (devicePath) => {
    const devicesComponent = []
    console.log('Opening device:', devicePath)
    try {
      const deviceSpecs = await window.streamDeck.openStreamDeck(devicePath)
      console.log('Device specs:', deviceSpecs)
      devicesComponent.push(
        <StreamDeck
          key={devicePath}
          devicePath={devicePath}
          buttonCount={deviceSpecs.buttonCount}
        />
      )
    } catch (error) {
      console.error('Failed to get Stream Deck specs:', error)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event, arg) => {
      console.log('Key down:', arg)
      setCurrentInput('key down')
    }

    const handleKeyUp = (event, arg) => {
      console.log('Key up:', arg)
      setCurrentInput('key up')
    }

    const handleRotateLeft = (event, arg) => {
      console.log('Rotate left:', arg)
      setCurrentInput('rotate left')
    }

    const handleRotateRight = (event, arg) => {
      console.log('Rotate right:', arg)
      setCurrentInput('rotate right')
    }

    const handleEncoderDown = (event, arg) => {
      console.log('Encoder down', arg)
      setCurrentInput('encoder down')
    }

    const handleEncoderUp = (event, arg) => {
      console.log('Encoder up', arg)
      setCurrentInput('encoder up')
    }

    const handleLcdShortPress = (event, arg) => {
      console.log('LCD short press', arg)
      setCurrentInput('LCD short press')
    }

    const handleLcdLongPress = (event, arg) => {
      console.log('LCD long press', arg)
      setCurrentInput('LCD long press')
    }

    const handleLcdSwipe = (event, arg) => {
      console.log('LCD Swipe', arg)
      setCurrentInput('LCD swipe')
    }

    window.streamDeck.onStreamDeckKeyDown(handleKeyDown)
    window.streamDeck.onStreamDeckKeyUp(handleKeyUp)
    window.streamDeck.onStreamDeckRotateLeft(handleRotateLeft)
    window.streamDeck.onStreamDeckRotateRight(handleRotateRight)
    window.streamDeck.onStreamDeckEncoderDown(handleEncoderDown)
    window.streamDeck.onStreamDeckEncoderUp(handleEncoderUp)
    window.streamDeck.onStreamDeckLcdShortPress(handleLcdShortPress)
    window.streamDeck.onStreamDeckLcdLongPress(handleLcdLongPress)
    window.streamDeck.onStreamDeckLcdSwipe(handleLcdSwipe)

    return () => {
      window.streamDeck.removeAllListeners('stream-deck-key-down')
      window.streamDeck.removeAllListeners('stream-deck-key-up')
      window.streamDeck.removeAllListeners('stream-deck-rotate-left')
      window.streamDeck.removeAllListeners('stream-deck-rotate-right')
      window.streamDeck.removeAllListeners('stream-deck-encoder-down')
      window.streamDeck.removeAllListeners('stream-deck-encoder-up')
      window.streamDeck.removeAllListeners('stream-deck-lcd-short-press')
      window.streamDeck.removeAllListeners('stream-deck-lcd-long-press')
      window.streamDeck.removeAllListeners('stream-deck-lcd-swipe')
    }
  }, [])

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const connectedDevices = await window.streamDeck.getConnectedStreamDecks()
        for (const device of connectedDevices) {
          handleOpenDevice(device.path)
        }
        // setDevices(connectedDevices)
      } catch (error) {
        console.error('Failed to get connected Stream Decks:', error)
      }
    }

    fetchDevices()
  }, [])
  return (
    <>
      {/* <Start /> */}aaa
      {currentInput && <div className="current-input">{currentInput}</div>}
    </>
  )
}

export default App
