import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { useEffect } from 'react'

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  useEffect(() => {
    const handleOpenDevice = async (devicePath) => {
      console.log('Opening device:', devicePath)
    }

    const fetchDevices = async () => {
      try {
        const connectedDevices = await window.streamDeck.getConnectedStreamDecks()
        if (connectedDevices.length === 1) {
          handleOpenDevice(connectedDevices[0].path)
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
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
