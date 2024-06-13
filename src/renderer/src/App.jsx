import { useEffect, useState } from 'react'
import StreamDeck from './components/StreamDeck'

function App() {
  // const ipcHandle = () => window.electron.ipcRenderer.send('ping')
  const [currentInput, setCurrentInput] = useState('')
  const [streamDeckDevices, setStreamDeckDevices] = useState([])

  const myActions = {
    '0_button_0': {
      text: 'Button 1',
      action: 'run_command',
      parameters: {
        command: 'spectacle -r'
      }
    }
  }

  const handleOpenDevice = async (devicePath) => {
    try {
      const deviceSpecs = await window.streamDeck.openStreamDeck(devicePath)
      // use setStreamDeckDevices to update the state but also keep the previous devices and don't duplicate them
      setStreamDeckDevices((prevDevices) => {
        if (prevDevices.find((device) => device.path === devicePath)) {
          return prevDevices
        }

        return [...prevDevices, { ...deviceSpecs, path: devicePath }]
      })
    } catch (error) {
      console.error('Failed to open Stream Deck:', error)
    }
  }

  useEffect(() => {
    console.log(streamDeckDevices)
  }, [streamDeckDevices])

  useEffect(() => {
    const handleKeyDown = (event, arg) => {
      console.log('Key down:', arg)
      setCurrentInput('key down')

      // Get the action for the key
      const action = myActions[`0_button_${arg.keyIndex}`]
      if (action) {
        console.log('Running action:', action)
        // Run the action
        if (action.action === 'run_command') {
          console.log('Running command:', action.parameters.command)
        }
      }

      // send the key down event to the main process
      window.streamDeck.onStreamDeckKeyDown('stream-deck-key-down', action)
    }

    const handleKeyUp = (event, arg) => {
      setCurrentInput('key up')
    }

    const handleRotateLeft = (event, arg) => {
      setCurrentInput('rotate left')
    }

    const handleRotateRight = (event, arg) => {
      setCurrentInput('rotate right')
    }

    const handleEncoderDown = (event, arg) => {
      setCurrentInput('encoder down')
    }

    const handleEncoderUp = (event, arg) => {
      setCurrentInput('encoder up')
    }

    const handleLcdShortPress = (event, arg) => {
      setCurrentInput('LCD short press')
    }

    const handleLcdLongPress = (event, arg) => {
      setCurrentInput('LCD long press')
    }

    const handleLcdSwipe = (event, arg) => {
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
      removeAllEventListeners()
    }
  }, [])

  const removeAllEventListeners = () => {
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

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const connectedDevices = await window.streamDeck.getConnectedStreamDecks()
        console.log(connectedDevices)
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
    <div>
      {/* <Start /> */}
      {streamDeckDevices.map((device, index) => (
        <div key={index}>
          <StreamDeck key={device.devicePath} device={device} />
        </div>
      ))}
      {currentInput && <div className="current-input">{currentInput}</div>}
      <button onClick={removeAllEventListeners}>Remove all event listeners</button>
    </div>
  )
}

export default App
