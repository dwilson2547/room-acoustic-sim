import os

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pyroomacoustics as pra
from scipy import signal

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

FS = 44100                 # audio-rate sampling; Nyquist 22.05 kHz covers hearing
HEATMAP_FS = 11025         # heatmap only needs relative level, not HF detail
MAX_ORDER = 17             # image-source reflection order
SOUND_SPEED = 343.0        # m/s

# Octave band centres used for per-band materials and per-band RT60
OCTAVE_CENTERS = [125, 250, 500, 1000, 2000, 4000, 8000]

# Frequency-dependent absorption presets (energy absorption per octave band,
# 125 Hz .. 8 kHz). Values are representative textbook coefficients — the point
# is that real surfaces absorb unevenly across frequency, which a single scalar
# cannot express.
MATERIAL_PRESETS = {
    "brick_painted":   [0.01, 0.01, 0.02, 0.02, 0.02, 0.03, 0.03],
    "concrete_block":  [0.36, 0.44, 0.31, 0.29, 0.39, 0.25, 0.25],
    "gypsum_drywall":  [0.29, 0.10, 0.05, 0.04, 0.07, 0.09, 0.09],
    "wood_panel":      [0.19, 0.14, 0.09, 0.06, 0.06, 0.05, 0.05],
    "carpet_on_foam":  [0.08, 0.24, 0.57, 0.69, 0.71, 0.73, 0.73],
    "heavy_curtain":   [0.14, 0.35, 0.55, 0.72, 0.70, 0.65, 0.65],
    "acoustic_panel":  [0.20, 0.55, 0.85, 0.95, 0.98, 0.98, 0.98],
    "glass_window":    [0.35, 0.25, 0.18, 0.12, 0.07, 0.04, 0.04],
}


# ---------------------------------------------------------------------------
# Acoustic helpers
# ---------------------------------------------------------------------------

def build_material(absorption=None, material=None):
    """
    Build a pyroomacoustics Material.
    - `material` name -> frequency-dependent (octave-band) absorption preset.
    - `absorption` scalar -> uniform absorption across frequency (legacy).
    """
    if material and material in MATERIAL_PRESETS:
        return pra.Material(energy_absorption={
            "coeffs": MATERIAL_PRESETS[material],
            "center_freqs": OCTAVE_CENTERS,
        })
    if absorption is None:
        absorption = 0.2
    return pra.Material(float(absorption))


def make_room(room_dims, material, fs=FS, max_order=MAX_ORDER):
    return pra.ShoeBox(
        room_dims, fs=fs, materials=material,
        max_order=max_order, air_absorption=True,
    )


def estimate_rt60(ir, fs, decay_db=20.0):
    """
    RT60 via the Schroeder backward integral + a linear fit over the
    -5 dB .. -(5 + decay_db) dB segment, extrapolated to -60 dB (the ISO-3382
    T20/T30 method). Returns None when the decay never spans the fit region
    (e.g. a truncated or too-quiet impulse response), which is the honest
    answer rather than a fabricated number.
    """
    ir = np.asarray(ir, dtype=float)
    energy = ir ** 2
    total = np.sum(energy)
    if total <= 0:
        return None

    # Schroeder curve, normalised so it starts at 0 dB
    sch = np.cumsum(energy[::-1])[::-1]
    sch_db = 10.0 * np.log10(sch / sch[0] + 1e-12)

    upper, lower = -5.0, -(5.0 + decay_db)
    try:
        i0 = np.where(sch_db <= upper)[0][0]
        i1 = np.where(sch_db <= lower)[0][0]
    except IndexError:
        return None
    if i1 <= i0 + 1:
        return None

    t = np.arange(i0, i1) / fs
    slope, _ = np.polyfit(t, sch_db[i0:i1], 1)
    if slope >= 0:
        return None
    return float(-60.0 / slope)


def octave_band_rt60(ir, fs, decay_db=20.0):
    """RT60 per octave band (125 Hz .. 8 kHz). None where it can't be fit."""
    centers, values = [], []
    for fc in OCTAVE_CENTERS:
        lo, hi = fc / np.sqrt(2), fc * np.sqrt(2)
        if hi >= fs / 2:  # band above Nyquist — skip
            continue
        sos = signal.butter(4, [lo, hi], btype="band", fs=fs, output="sos")
        band = signal.sosfiltfilt(sos, ir)
        centers.append(fc)
        values.append(estimate_rt60(band, fs, decay_db))
    return centers, values


def direct_reverb_ratio_db(ir, fs, distance, half_window_ms=2.5):
    """
    Direct-to-reverberant energy ratio. The direct-sound window is centred on
    the geometric arrival time (distance / c), not a fixed offset from t=0 —
    otherwise the window can close before the direct sound even arrives.
    """
    arrival = int(round(distance / SOUND_SPEED * fs))
    half = int(round(half_window_ms * 1e-3 * fs))
    start = max(0, arrival - half)
    end = min(len(ir), arrival + half)
    if end <= start:
        return None

    direct = np.sum(ir[start:end] ** 2)
    reverb = np.sum(ir[:start] ** 2) + np.sum(ir[end:] ** 2)
    return float(10.0 * np.log10((direct + 1e-12) / (reverb + 1e-12)))


def smoothed_frequency_response(ir, fs, frac=6, f_min=20.0, f_max=20000.0, n_out=512):
    """
    Magnitude response, fractional-octave (default 1/6) power-smoothed and
    resampled onto a log frequency grid. Raw freqz on an RIR is a dense comb of
    interference nulls that neither reads well nor matches perception; smoothing
    is standard practice.
    """
    freqs, H = signal.freqz(ir, worN=8192, fs=fs)
    power = np.abs(H) ** 2

    f_max = min(f_max, fs / 2.0)
    out_freqs = np.logspace(np.log10(f_min), np.log10(f_max), n_out)
    half = 2 ** (1.0 / (2 * frac))  # half-bandwidth ratio

    out_db = np.empty(n_out)
    for i, fc in enumerate(out_freqs):
        lo, hi = fc / half, fc * half
        mask = (freqs >= lo) & (freqs <= hi)
        if not np.any(mask):
            # window narrower than the freqz bin spacing — take nearest bin
            band_power = power[np.argmin(np.abs(freqs - fc))]
        else:
            band_power = np.mean(power[mask])
        out_db[i] = 10.0 * np.log10(band_power + 1e-12)

    return out_freqs.tolist(), out_db.tolist()


def energy_decay_curve(ir, fs, n_out=800):
    """Normalised Schroeder decay curve (dB) vs time, downsampled for transport."""
    energy = ir ** 2
    sch = np.cumsum(energy[::-1])[::-1]
    sch_db = 10.0 * np.log10(sch / (sch[0] + 1e-12) + 1e-12)
    t = np.arange(len(sch_db)) / fs

    if len(sch_db) > n_out:
        idx = np.linspace(0, len(sch_db) - 1, n_out).astype(int)
        t, sch_db = t[idx], sch_db[idx]
    return t.tolist(), sch_db.tolist()


def validate_geometry(room_dims, points):
    """Raise ValueError if dims are non-positive or a point sits outside the room."""
    if len(room_dims) != 3 or any(d <= 0 for d in room_dims):
        raise ValueError("Room dimensions must be three positive numbers.")
    for name, p in points.items():
        if len(p) != 3:
            raise ValueError(f"{name} must have three coordinates.")
        for axis, (c, d) in enumerate(zip(p, room_dims)):
            if not (0 < c < d):
                raise ValueError(
                    f"{name} coordinate {axis} ({c}) must lie strictly inside "
                    f"the room (0 .. {d})."
                )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.route('/api/simulate', methods=['POST'])
def simulate():
    data = request.json or {}
    room_dims = data.get('roomDimensions', [5, 4, 3])
    speaker_pos = data.get('speakerPosition', [1, 1, 1.5])
    listener_pos = data.get('listenerPosition', [3, 2, 1.2])
    absorption = data.get('absorption', 0.2)
    material = data.get('material')  # optional preset name

    try:
        validate_geometry(room_dims, {
            "speakerPosition": speaker_pos,
            "listenerPosition": listener_pos,
        })
        distance = float(np.linalg.norm(np.array(speaker_pos) - np.array(listener_pos)))
        if distance < 1e-3:
            raise ValueError("Speaker and listener are at the same position.")

        room = make_room(room_dims, build_material(absorption, material))
        room.add_source(speaker_pos)
        room.add_microphone_array(
            pra.MicrophoneArray(np.array([listener_pos]).T, FS)
        )
        room.compute_rir()
        ir = room.rir[0][0]

        freqs, magnitude = smoothed_frequency_response(ir, FS)
        decay_time, decay_db = energy_decay_curve(ir, FS)
        rt60 = estimate_rt60(ir, FS)
        band_centers, band_rt60 = octave_band_rt60(ir, FS)
        dr_ratio = direct_reverb_ratio_db(ir, FS, distance)

        # Relative direct-field level (NOT a calibrated absolute SPL — there is
        # no source power model). Useful only for comparing positions.
        rel_level = float(20.0 * np.log10(np.max(np.abs(ir)) + 1e-12) + 94.0)

        return jsonify({
            'success': True,
            'fs': FS,
            'material': material or 'uniform',
            'frequencyResponse': {
                'frequencies': freqs,
                'magnitude': magnitude,
            },
            'energyDecay': {
                'time': decay_time,
                'energy': decay_db,
            },
            'metrics': {
                'rt60': rt60 if rt60 is not None else 0.0,
                'directToReverbRatio': dr_ratio if dr_ratio is not None else 0.0,
                'peakSPL': rel_level,
                'rt60Bands': {
                    'centers': band_centers,
                    'values': band_rt60,  # may contain nulls where unfittable
                },
            },
        })

    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/heatmap', methods=['POST'])
def generate_heatmap():
    """
    SPL (relative level) heatmap across the room.

    NOTE: this still runs one full simulation per grid point. Because image
    sources depend only on the room + source (not the receiver), the planned
    performance pass will replace this loop with a single simulation over a
    MicrophoneArray of all grid points. Kept simple here on purpose.
    """
    data = request.json or {}
    room_dims = data.get('roomDimensions', [5, 4, 3])
    speaker_pos = data.get('speakerPosition', [1, 1, 1.5])
    absorption = data.get('absorption', 0.2)
    material = data.get('material')
    height = data.get('height', 1.2)
    resolution = int(data.get('resolution', 15))

    try:
        validate_geometry(room_dims, {"speakerPosition": speaker_pos})
        if not (0 < height < room_dims[2]):
            raise ValueError("Listening height must lie inside the room.")

        x = np.linspace(0.2, room_dims[0] - 0.2, resolution)
        y = np.linspace(0.2, room_dims[1] - 0.2, resolution)
        spl_grid = np.zeros((resolution, resolution))

        for i, xi in enumerate(x):
            for j, yj in enumerate(y):
                room = make_room(
                    room_dims, build_material(absorption, material),
                    fs=HEATMAP_FS,
                )
                room.add_source(speaker_pos)
                room.add_microphone_array(
                    pra.MicrophoneArray(np.array([[xi, yj, height]]).T, HEATMAP_FS)
                )
                room.compute_rir()
                ir = room.rir[0][0]
                spl_grid[j, i] = 20.0 * np.log10(np.max(np.abs(ir)) + 1e-12) + 94.0

        return jsonify({
            'success': True,
            'heatmap': {
                'x': x.tolist(),
                'y': y.tolist(),
                'spl': spl_grid.tolist(),
            },
        })

    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/materials', methods=['GET'])
def materials():
    """List available frequency-dependent material presets."""
    return jsonify({
        'centers': OCTAVE_CENTERS,
        'presets': dict(MATERIAL_PRESETS),
    })


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})


if __name__ == '__main__':
    app.run(debug=os.environ.get('FLASK_DEBUG') == '1', port=5000)
