# Room Acoustics Simulator

An interactive full-stack application for simulating and visualizing how speakers perform in different room configurations. Built with Python (Pyroomacoustics) for acoustic simulation and React with Three.js for 3D visualization.

## Features

- **3D Room Visualization**: Interactive 3D view of your room with speaker and listener positioning
- **Frequency Response Analysis**: See how the room affects different frequencies
- **Energy Decay Curves**: Visualize reverberation characteristics
- **SPL Heatmap**: Generate sound pressure level distribution across the room
- **Real-time Parameter Adjustment**: Change room dimensions, positions, and materials on the fly
- **Acoustic Metrics**: RT60, Direct-to-Reverberant ratio, and peak SPL calculations

## Technology Stack

### Backend
- **Python 3.8+**
- **Flask**: Web framework for API endpoints
- **Pyroomacoustics**: Room acoustics simulation engine
- **NumPy/SciPy**: Signal processing and numerical computations

### Frontend
- **React 18**: UI framework
- **Three.js**: 3D room visualization
- **Recharts**: Frequency response and energy decay charts
- **Custom Canvas**: SPL heatmap rendering

## Installation

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Start the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## Usage

1. **Adjust Room Parameters**: Use the left panel to set room dimensions, speaker/listener positions, and absorption coefficients
2. **Run Simulation**: Click "Run Simulation" to calculate acoustic response at the listener position
3. **View Results**: 
   - Frequency response shows how different frequencies are affected
   - Energy decay curve shows reverberation characteristics
   - Acoustic metrics provide quantitative analysis
4. **Generate Heatmap**: Click "Generate SPL Heatmap" to see sound distribution across the entire room (note: this takes longer)

## Understanding the Results

### Frequency Response
Shows the magnitude response across the audible frequency range. Peaks and dips indicate room resonances and nulls. Ideal response is relatively flat.

### Energy Decay Curve
Shows how sound energy decays over time. The slope indicates how reverberant the room is.

### RT60 (Reverberation Time)
Time for sound to decay by 60 dB. Ideal for listening rooms:
- **< 0.3s**: Very dead (anechoic)
- **0.3-0.6s**: Well-controlled (ideal for critical listening)
- **0.6-1.0s**: Normal living room
- **> 1.0s**: Very reverberant

### Direct-to-Reverberant Ratio
Ratio of direct sound to reflected sound energy. Higher values (more positive) mean clearer, more direct sound.

### Absorption Coefficient
Material property affecting how much sound is absorbed vs. reflected:
- **0.0**: Perfect reflection (tile, glass)
- **0.2**: Moderately reflective (typical living room)
- **0.5**: Absorptive (carpeted room with furniture)
- **1.0**: Perfect absorption (anechoic chamber)

## API Endpoints

### POST /api/simulate
Simulates acoustic response at a single listening position.

**Request Body:**
```json
{
  "roomDimensions": [5, 4, 3],
  "speakerPosition": [1, 1, 1.5],
  "listenerPosition": [3, 2, 1.2],
  "absorption": 0.2
}
```

**Response:**
```json
{
  "success": true,
  "frequencyResponse": {
    "frequencies": [...],
    "magnitude": [...]
  },
  "energyDecay": {
    "time": [...],
    "energy": [...]
  },
  "metrics": {
    "rt60": 0.45,
    "directToReverbRatio": 5.2,
    "peakSPL": 94.5
  }
}
```

### POST /api/heatmap
Generates SPL heatmap across the room.

**Request Body:**
```json
{
  "roomDimensions": [5, 4, 3],
  "speakerPosition": [1, 1, 1.5],
  "absorption": 0.2,
  "height": 1.2,
  "resolution": 15
}
```

**Response:**
```json
{
  "success": true,
  "heatmap": {
    "x": [...],
    "y": [...],
    "spl": [[...], [...], ...]
  }
}
```

## Acoustic Simulation Details

The simulation uses the **Image Source Method** for modeling room acoustics:

1. **Direct Sound**: Calculated using inverse square law
2. **Early Reflections**: First 15 orders of reflections from walls
3. **Absorption**: Frequency-independent absorption coefficient
4. **Speaker Model**: Omnidirectional point source (can be extended for directivity)

### Limitations

- Assumes rectangular room geometry
- Frequency-independent absorption (real materials vary with frequency)
- Does not model furniture or complex geometries
- Omnidirectional speaker (no directivity pattern)
- Best accuracy above 200 Hz

## Future Enhancements

- [ ] Custom room shapes (non-rectangular)
- [ ] Frequency-dependent absorption coefficients
- [ ] Speaker directivity patterns
- [ ] Multiple speakers support
- [ ] Furniture/obstacle modeling
- [ ] Export impulse responses (WAV files)
- [ ] Convolution with audio files
- [ ] Waterfall plots (3D frequency-time-amplitude)
- [ ] Low-frequency modal analysis
- [ ] Import/export room configurations

## Troubleshooting

### Backend Issues

**Import Error: No module named 'pyroomacoustics'**
```bash
pip install pyroomacoustics --break-system-packages
```

**CORS Errors**
Ensure Flask-CORS is installed and the backend is running on port 5000.

### Frontend Issues

**Three.js Import Errors**
Make sure you have the correct version of three.js:
```bash
npm install three@^0.158.0
```

**Blank 3D Visualization**
Check browser console for WebGL errors. Ensure your browser supports WebGL.

## Performance Tips

- Start with lower resolution (10-15) for heatmaps
- Reduce max_order in backend if simulation is slow
- Use lower sampling rate (fs) for faster computation (trade-off: less high-frequency accuracy)

## License

MIT License - feel free to use and modify for your projects!

## Contributing

Contributions welcome! Areas of interest:
- Adding more room shapes
- Implementing directivity patterns
- Improving visualization
- Adding more acoustic metrics
- Performance optimizations

## Acknowledgments

Built using:
- [Pyroomacoustics](https://github.com/LCAV/pyroomacoustics) - Excellent room acoustics library
- [Three.js](https://threejs.org/) - 3D visualization
- [Recharts](https://recharts.org/) - Beautiful React charts
