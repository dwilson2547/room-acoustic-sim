# Room Acoustics Simulator - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                     http://localhost:3000                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Controls   │  │     3D       │  │    Charts    │         │
│  │   - Sliders  │  │  Visualization│  │  - Freq Resp │         │
│  │   - Inputs   │  │  (Three.js)  │  │  - Decay     │         │
│  │   - Buttons  │  │              │  │  - Heatmap   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API (HTTP/JSON)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                     Backend (Python/Flask)                       │
│                     http://localhost:5000                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  API Endpoints:                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ POST /api/simulate                                      │    │
│  │ - Single position acoustic simulation                   │    │
│  │ - Returns: frequency response, energy decay, metrics    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ POST /api/heatmap                                       │    │
│  │ - Multi-position SPL calculation                        │    │
│  │ - Returns: 2D grid of SPL values                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────────┐
│              Pyroomacoustics Simulation Engine                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Image Source Method:                                            │
│  1. Create room geometry                                         │
│  2. Add source (speaker) and receiver (listener)                 │
│  3. Calculate up to 15 orders of reflections                     │
│  4. Generate room impulse response (RIR)                         │
│  5. Compute frequency response via FFT                           │
│  6. Calculate acoustic metrics (RT60, D/R ratio)                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Single Position Simulation
```
User adjusts parameters
      ↓
Click "Run Simulation"
      ↓
Frontend sends request to /api/simulate
      ↓
Backend creates RoomSimulator instance
      ↓
Pyroomacoustics:
  - Creates room with dimensions & materials
  - Places speaker & listener
  - Runs image source method simulation
  - Generates impulse response
      ↓
Backend processes RIR:
  - FFT → frequency response
  - Energy integration → decay curve
  - Calculate RT60, D/R ratio, SPL
      ↓
Backend returns JSON response
      ↓
Frontend updates visualizations:
  - Frequency response chart (Recharts)
  - Energy decay chart (Recharts)
  - Metrics display
```

### Heatmap Generation
```
Click "Generate SPL Heatmap"
      ↓
Frontend sends request to /api/heatmap
      ↓
Backend creates grid (e.g., 15x15 points)
      ↓
For each grid point:
  - Create new RoomSimulator
  - Place listener at grid position
  - Run simulation
  - Extract peak SPL
      ↓
Build 2D SPL array
      ↓
Return to frontend
      ↓
Frontend renders heatmap on canvas
  - Color mapping (blue → red)
  - Show speaker position
  - Draw grid overlay
```

## Component Structure

### Frontend Components

```
App.js (Main Component)
├── Controls.js
│   ├── Room dimension inputs
│   ├── Speaker position controls
│   ├── Listener position controls
│   ├── Absorption coefficient slider
│   └── Action buttons
│
├── RoomVisualization.js (Three.js)
│   ├── 3D room rendering
│   ├── Speaker model (box + cone)
│   ├── Listener model (head + ears)
│   ├── Grid helper
│   └── Orbit controls
│
├── FrequencyResponse.js (Recharts)
│   └── Log-scale frequency plot
│
├── EnergyDecay.js (Recharts)
│   └── Time-domain energy plot
│
├── HeatmapView.js (Canvas)
│   ├── 2D SPL heatmap
│   ├── Color gradient legend
│   └── Speaker position marker
│
└── Metrics.js
    ├── RT60 display
    ├── D/R ratio display
    ├── Peak SPL display
    └── Room quality assessment
```

### Backend Structure

```
app.py
├── RoomSimulator class
│   ├── create_room()
│   ├── add_speaker()
│   ├── add_listener()
│   ├── simulate()
│   ├── get_impulse_response()
│   ├── get_frequency_response()
│   ├── get_energy_decay()
│   ├── calculate_rt60()
│   └── get_direct_to_reverb_ratio()
│
├── /api/simulate endpoint
│   └── Single position simulation
│
└── /api/heatmap endpoint
    └── Multi-position grid simulation
```

## Key Technologies & Libraries

### Backend
- **Flask**: Lightweight web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Pyroomacoustics**: Room acoustics simulation
  - Image source method for reflections
  - Supports arbitrary room geometry
  - Material absorption modeling
- **NumPy**: Numerical computing
- **SciPy**: Signal processing (FFT, filtering)

### Frontend
- **React**: UI framework with component architecture
- **Three.js**: 3D graphics library
  - Scene, camera, renderer setup
  - Mesh geometry for room elements
  - OrbitControls for interaction
- **Recharts**: Chart library for React
  - Responsive charts
  - Log-scale frequency axis
  - Custom tooltips
- **Canvas API**: Custom heatmap rendering

## Acoustic Simulation Details

### Image Source Method
The simulation uses the image source method, which models room reflections by creating virtual "mirror" sources:

1. **Order 0**: Direct sound from speaker to listener
2. **Order 1**: First reflections (6 sources - one per wall/ceiling/floor)
3. **Order 2**: Second-order reflections (combinations of first reflections)
4. **...up to Order 15**

Each reflection:
- Travels a specific distance (affects delay & attenuation)
- Interacts with surface material (absorption coefficient)
- Contributes to the overall impulse response

### Room Impulse Response (RIR)
The RIR is the acoustic "signature" of the room - it captures:
- Direct sound arrival time
- Early reflections pattern
- Late reverberation tail
- Frequency-dependent effects

From the RIR, we can calculate:
- **Frequency Response**: FFT of RIR
- **RT60**: Time for 60dB decay
- **Energy Decay**: Running integral of squared RIR
- **SPL**: Peak magnitude with reference level

## Performance Considerations

### Single Simulation (~1-2 seconds)
- Room geometry: O(1)
- Image sources: O(n^6) for n=15 orders
- FFT: O(n log n) for n=16000 samples

### Heatmap Generation (~10-30 seconds)
- Grid resolution: 15x15 = 225 points
- Each point requires full simulation
- Can be parallelized (future enhancement)

### Optimization Strategies
1. Reduce max_order for faster computation
2. Lower sampling rate (fs) for preview
3. Reduce heatmap resolution
4. Cache room geometry if only listener moves
5. Use multiprocessing for heatmap generation

## Extension Points

### Easy Extensions
1. **Add presets**: Living room, studio, concert hall configurations
2. **Speaker directivity**: Replace omnidirectional with real speaker patterns
3. **Multiple speakers**: Stereo, surround sound simulations
4. **Export RIR**: Save as WAV file for convolution
5. **Material library**: Predefined absorption values for common materials

### Advanced Extensions
1. **Non-rectangular rooms**: Use ray tracing or FEM
2. **Furniture modeling**: Add obstacles as absorbers
3. **Frequency-dependent absorption**: More realistic materials
4. **Modal analysis**: Low-frequency room modes
5. **Real-time auralization**: Convolve audio with RIR
6. **Optimization**: Suggest best speaker/listener positions

## Quick Start Commands

### Start Everything (Linux/Mac)
```bash
./start.sh
```

### Start Everything (Windows)
```
start.bat
```

### Manual Start

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## Project Structure
```
room-acoustics-sim/
├── backend/
│   ├── app.py                 # Flask server & simulation logic
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── RoomVisualization.js
│   │   │   ├── FrequencyResponse.js
│   │   │   ├── EnergyDecay.js
│   │   │   ├── HeatmapView.js
│   │   │   ├── Controls.js
│   │   │   └── Metrics.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── README.md
├── .gitignore
├── start.sh                   # Linux/Mac quick start
└── start.bat                  # Windows quick start
```
