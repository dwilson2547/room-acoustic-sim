import React from 'react';

const Controls = ({
  roomDimensions,
  setRoomDimensions,
  speakerPosition,
  setSpeakerPosition,
  listenerPosition,
  setListenerPosition,
  absorption,
  setAbsorption,
  onSimulate,
  onGenerateHeatmap,
  isSimulating,
  showHeatmap,
  setShowHeatmap,
}) => {
  const handleDimensionChange = (index, value) => {
    const newDims = [...roomDimensions];
    newDims[index] = parseFloat(value) || 0;
    setRoomDimensions(newDims);
  };

  const handleSpeakerChange = (index, value) => {
    const newPos = [...speakerPosition];
    newPos[index] = parseFloat(value) || 0;
    setSpeakerPosition(newPos);
  };

  const handleListenerChange = (index, value) => {
    const newPos = [...listenerPosition];
    newPos[index] = parseFloat(value) || 0;
    setListenerPosition(newPos);
  };

  return (
    <div className="controls-panel">
      <h2>Simulation Parameters</h2>

      <div className="control-section">
        <h3>Room Dimensions (m)</h3>
        <div className="control-group">
          <label>
            Width (X):
            <input
              type="number"
              step="0.1"
              min="1"
              max="20"
              value={roomDimensions[0]}
              onChange={(e) => handleDimensionChange(0, e.target.value)}
            />
          </label>
          <label>
            Depth (Y):
            <input
              type="number"
              step="0.1"
              min="1"
              max="20"
              value={roomDimensions[1]}
              onChange={(e) => handleDimensionChange(1, e.target.value)}
            />
          </label>
          <label>
            Height (Z):
            <input
              type="number"
              step="0.1"
              min="1"
              max="10"
              value={roomDimensions[2]}
              onChange={(e) => handleDimensionChange(2, e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="control-section">
        <h3>Speaker Position (m)</h3>
        <div className="control-group">
          <label>
            X:
            <input
              type="number"
              step="0.1"
              min="0"
              max={roomDimensions[0]}
              value={speakerPosition[0]}
              onChange={(e) => handleSpeakerChange(0, e.target.value)}
            />
          </label>
          <label>
            Y:
            <input
              type="number"
              step="0.1"
              min="0"
              max={roomDimensions[1]}
              value={speakerPosition[1]}
              onChange={(e) => handleSpeakerChange(1, e.target.value)}
            />
          </label>
          <label>
            Z:
            <input
              type="number"
              step="0.1"
              min="0"
              max={roomDimensions[2]}
              value={speakerPosition[2]}
              onChange={(e) => handleSpeakerChange(2, e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="control-section">
        <h3>Listener Position (m)</h3>
        <div className="control-group">
          <label>
            X:
            <input
              type="number"
              step="0.1"
              min="0"
              max={roomDimensions[0]}
              value={listenerPosition[0]}
              onChange={(e) => handleListenerChange(0, e.target.value)}
            />
          </label>
          <label>
            Y:
            <input
              type="number"
              step="0.1"
              min="0"
              max={roomDimensions[1]}
              value={listenerPosition[1]}
              onChange={(e) => handleListenerChange(1, e.target.value)}
            />
          </label>
          <label>
            Z:
            <input
              type="number"
              step="0.1"
              min="0"
              max={roomDimensions[2]}
              value={listenerPosition[2]}
              onChange={(e) => handleListenerChange(2, e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="control-section">
        <h3>Room Acoustics</h3>
        <div className="control-group">
          <label>
            Absorption Coefficient:
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={absorption}
              onChange={(e) => setAbsorption(parseFloat(e.target.value))}
            />
            <span className="value-display">{absorption.toFixed(2)}</span>
          </label>
          <p className="hint">
            0 = Highly reflective (tile, concrete)<br />
            0.2 = Moderately reflective (living room)<br />
            0.5 = Absorptive (carpeted, furnished)<br />
            1.0 = Anechoic (no reflections)
          </p>
        </div>
      </div>

      <div className="button-group">
        <button
          className="primary-button"
          onClick={onSimulate}
          disabled={isSimulating}
        >
          {isSimulating ? 'Simulating...' : 'Run Simulation'}
        </button>
        <button
          className="secondary-button"
          onClick={onGenerateHeatmap}
          disabled={isSimulating}
        >
          {isSimulating ? 'Generating...' : 'Generate SPL Heatmap'}
        </button>
        {showHeatmap && (
          <button
            className="secondary-button"
            onClick={() => setShowHeatmap(false)}
          >
            Back to Charts
          </button>
        )}
      </div>
    </div>
  );
};

export default Controls;
