import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const StreamDeck = ({ device }) => {
  const [buttonCount, setButtonCount] = useState(15) // Default to 8 buttons

  useEffect(() => {
    const detectStreamDeckVersion = () => {
      switch (device.productName) {
        case 'StreamDeckMini':
          setButtonCount(6)
          break
        case 'StreamDeck':
          setButtonCount(15)
          break
        case 'StreamDeckXL':
          setButtonCount(32)
          break
        case 'Streamdeck +':
          setButtonCount(8)
          break
        default:
          setButtonCount(15)
          break
      }
    }

    detectStreamDeckVersion()
  }, [device.productName])

  return (
    <div className="container">
      <div className="stream-deck">
        <div className="button-grid">
          {Array.from({ length: buttonCount }, (_, index) => (
            <div key={index} className="button">{`Button ${index + 1}`}</div>
          ))}
        </div>
        <div className="bottom-panel">
          <h2>Button Actions</h2>
          <div className="action-list">
            <div className="action">Action 1</div>
            <div className="action">Action 2</div>
            <div className="action">Action 3</div>
          </div>
        </div>
      </div>
      <div className="sidebar">
        <h2>Actions to Add:</h2>
        <div className="action-list">
          <div className="action">Action 1</div>
          <div className="action">Action 2</div>
          <div className="action">Action 3</div>
        </div>
      </div>
    </div>
  )
}

StreamDeck.propTypes = {
  device: PropTypes.object.isRequired
}

export default StreamDeck
