from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pyroomacoustics as pra
from scipy import signal
import json

app = Flask(__name__)
CORS(app)

class RoomSimulator:
    def __init__(self, room_dims, fs=16000):
        self.room_dims = room_dims
        self.fs = fs
        self.room = None
        
    def create_room(self, materials=None):
        """Create room with specified materials (absorption coefficients)"""
        if materials is None:
            # Default: moderately absorptive (living room-like)
            materials = pra.Material(0.2)
        
        self.room = pra.ShoeBox(
            self.room_dims,
            fs=self.fs,
            materials=materials,
            max_order=15  # Number of reflections to simulate
        )
        
    def add_speaker(self, position, directivity=None):
        """Add speaker source at position"""
        if directivity is None:
            # Omnidirectional by default
            self.room.add_source(position)
        else:
            # Can add directivity pattern here
            self.room.add_source(position)
    
    def add_listener(self, position):
        """Add microphone (listener) at position"""
        mic_array = pra.MicrophoneArray(
            np.array([position]).T,
            self.fs
        )
        self.room.add_microphone_array(mic_array)
    
    def simulate(self):
        """Run the simulation"""
        self.room.simulate()
        
    def get_impulse_response(self):
        """Get room impulse response"""
        return self.room.rir[0][0]
    
    def get_frequency_response(self):
        """Calculate frequency response from impulse response"""
        ir = self.get_impulse_response()
        freqs, response = signal.freqz(ir, worN=8192, fs=self.fs)
        magnitude_db = 20 * np.log10(np.abs(response) + 1e-10)
        return freqs.tolist(), magnitude_db.tolist()
    
    def get_energy_decay(self):
        """Calculate energy decay curve (similar to RT60)"""
        ir = self.get_impulse_response()
        energy = ir ** 2
        energy_db = 10 * np.log10(np.cumsum(energy[::-1])[::-1] + 1e-10)
        
        # Normalize
        energy_db = energy_db - energy_db[0]
        
        time = np.arange(len(energy_db)) / self.fs
        return time.tolist(), energy_db.tolist()
    
    def calculate_rt60(self):
        """Estimate RT60 (reverberation time)"""
        time, energy_db = self.get_energy_decay()
        
        # Find time when energy drops by 60 dB
        try:
            idx = np.where(np.array(energy_db) < -60)[0][0]
            rt60 = time[idx]
        except:
            rt60 = time[-1]  # If never drops 60dB, use max time
            
        return rt60
    
    def get_direct_to_reverb_ratio(self):
        """Calculate direct to reverberant energy ratio"""
        ir = self.get_impulse_response()
        
        # Direct sound is roughly first 2.5ms
        direct_samples = int(0.0025 * self.fs)
        direct_energy = np.sum(ir[:direct_samples] ** 2)
        reverb_energy = np.sum(ir[direct_samples:] ** 2)
        
        ratio_db = 10 * np.log10((direct_energy + 1e-10) / (reverb_energy + 1e-10))
        return ratio_db

@app.route('/api/simulate', methods=['POST'])
def simulate():
    """Main simulation endpoint"""
    data = request.json
    
    # Extract parameters
    room_dims = data.get('roomDimensions', [5, 4, 3])
    speaker_pos = data.get('speakerPosition', [1, 1, 1.5])
    listener_pos = data.get('listenerPosition', [3, 2, 1.2])
    absorption = data.get('absorption', 0.2)
    
    try:
        # Create and run simulation
        sim = RoomSimulator(room_dims)
        sim.create_room(materials=pra.Material(absorption))
        sim.add_speaker(speaker_pos)
        sim.add_listener(listener_pos)
        sim.simulate()
        
        # Get results
        freqs, freq_response = sim.get_frequency_response()
        time, energy_decay = sim.get_energy_decay()
        rt60 = sim.calculate_rt60()
        dr_ratio = sim.get_direct_to_reverb_ratio()
        
        # Calculate SPL at listening position (simplified)
        ir = sim.get_impulse_response()
        peak_spl = 20 * np.log10(np.max(np.abs(ir)) + 1e-10) + 94  # Reference to 94dB SPL
        
        return jsonify({
            'success': True,
            'frequencyResponse': {
                'frequencies': freqs,
                'magnitude': freq_response
            },
            'energyDecay': {
                'time': time,
                'energy': energy_decay
            },
            'metrics': {
                'rt60': float(rt60),
                'directToReverbRatio': float(dr_ratio),
                'peakSPL': float(peak_spl)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/heatmap', methods=['POST'])
def generate_heatmap():
    """Generate SPL heatmap across room"""
    data = request.json
    
    room_dims = data.get('roomDimensions', [5, 4, 3])
    speaker_pos = data.get('speakerPosition', [1, 1, 1.5])
    absorption = data.get('absorption', 0.2)
    height = data.get('height', 1.2)  # Listening height
    resolution = data.get('resolution', 20)  # Grid resolution
    
    try:
        # Create grid of listening positions
        x = np.linspace(0.2, room_dims[0] - 0.2, resolution)
        y = np.linspace(0.2, room_dims[1] - 0.2, resolution)
        
        spl_grid = np.zeros((resolution, resolution))
        
        for i, xi in enumerate(x):
            for j, yj in enumerate(y):
                sim = RoomSimulator(room_dims, fs=8000)  # Lower fs for speed
                sim.create_room(materials=pra.Material(absorption))
                sim.add_speaker(speaker_pos)
                sim.add_listener([xi, yj, height])
                sim.simulate()
                
                ir = sim.get_impulse_response()
                spl_grid[j, i] = 20 * np.log10(np.max(np.abs(ir)) + 1e-10) + 94
        
        return jsonify({
            'success': True,
            'heatmap': {
                'x': x.tolist(),
                'y': y.tolist(),
                'spl': spl_grid.tolist()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
