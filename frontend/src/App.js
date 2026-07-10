import React, { useState, useEffect } from 'react';
import RoomVisualization from './components/RoomVisualization';
import FrequencyResponse from './components/FrequencyResponse';
import EnergyDecay from './components/EnergyDecay';
import Controls from './components/Controls';
import Metrics from './components/Metrics';
import HeatmapView from './components/HeatmapView';
import './App.css';

function App() {
  const [roomDimensions, setRoomDimensions] = useState([5, 4, 3]);
  const [speakerPosition, setSpeakerPosition] = useState([1, 1, 1.5]);
  const [listenerPosition, setListenerPosition] = useState([3, 2, 1.2]);
  const [absorption, setAbsorption] = useState(0.2);
  const [simulationData, setSimulationData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const runSimulation = async () => {
    setIsSimulating(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomDimensions,
          speakerPosition,
          listenerPosition,
          absorption,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSimulationData(data);
      } else {
        console.error('Simulation failed:', data.error);
        alert('Simulation failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error running simulation:', error);
      alert('Error connecting to backend. Make sure the Python server is running.');
    } finally {
      setIsSimulating(false);
    }
  };

  const generateHeatmap = async () => {
    setIsSimulating(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/heatmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomDimensions,
          speakerPosition,
          absorption,
          height: listenerPosition[2],
          resolution: 15,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setHeatmapData(data.heatmap);
        setShowHeatmap(true);
      } else {
        console.error('Heatmap generation failed:', data.error);
        alert('Heatmap generation failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating heatmap:', error);
      alert('Error connecting to backend.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Room Acoustics Simulator</h1>
        <p>Interactive tool for simulating speaker response in a room</p>
      </header>

      <div className="main-content">
        <div className="left-panel">
          <Controls
            roomDimensions={roomDimensions}
            setRoomDimensions={setRoomDimensions}
            speakerPosition={speakerPosition}
            setSpeakerPosition={setSpeakerPosition}
            listenerPosition={listenerPosition}
            setListenerPosition={setListenerPosition}
            absorption={absorption}
            setAbsorption={setAbsorption}
            onSimulate={runSimulation}
            onGenerateHeatmap={generateHeatmap}
            isSimulating={isSimulating}
            showHeatmap={showHeatmap}
            setShowHeatmap={setShowHeatmap}
          />

          {simulationData && (
            <Metrics metrics={simulationData.metrics} />
          )}
        </div>

        <div className="center-panel">
          <RoomVisualization
            roomDimensions={roomDimensions}
            speakerPosition={speakerPosition}
            listenerPosition={listenerPosition}
            onSpeakerMove={setSpeakerPosition}
            onListenerMove={setListenerPosition}
          />
        </div>

        <div className="right-panel">
          {showHeatmap && heatmapData ? (
            <HeatmapView
              heatmapData={heatmapData}
              roomDimensions={roomDimensions}
              speakerPosition={speakerPosition}
            />
          ) : (
            <>
              {simulationData && (
                <>
                  <FrequencyResponse
                    frequencies={simulationData.frequencyResponse.frequencies}
                    magnitude={simulationData.frequencyResponse.magnitude}
                  />
                  <EnergyDecay
                    time={simulationData.energyDecay.time}
                    energy={simulationData.energyDecay.energy}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
