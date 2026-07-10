import React from 'react';

const Metrics = ({ metrics }) => {
  if (!metrics) return null;

  const formatValue = (value, decimals = 2, unit = '') => {
    return `${value.toFixed(decimals)}${unit}`;
  };

  const getRoomQuality = (rt60, drRatio) => {
    // Simple heuristic for room quality
    if (rt60 < 0.3) return { quality: 'Very Dead', color: '#e74c3c' };
    if (rt60 < 0.5) return { quality: 'Well Damped', color: '#2ecc71' };
    if (rt60 < 0.8) return { quality: 'Normal', color: '#3498db' };
    if (rt60 < 1.2) return { quality: 'Lively', color: '#f39c12' };
    return { quality: 'Very Reverberant', color: '#e74c3c' };
  };

  const roomQuality = getRoomQuality(metrics.rt60, metrics.directToReverbRatio);

  return (
    <div className="metrics-panel">
      <h3>Acoustic Metrics</h3>

      <div className="metric-card">
        <div className="metric-label">RT60 (Reverberation Time)</div>
        <div className="metric-value">{formatValue(metrics.rt60, 3, 's')}</div>
        <div className="metric-description">
          Time for sound to decay by 60 dB
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Direct/Reverberant Ratio</div>
        <div className="metric-value">{formatValue(metrics.directToReverbRatio, 2, ' dB')}</div>
        <div className="metric-description">
          Ratio of direct to reflected sound energy
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Relative Level</div>
        <div className="metric-value">{formatValue(metrics.peakSPL, 1, ' dB')}</div>
        <div className="metric-description">
          Direct-field level for comparing positions (not a calibrated SPL)
        </div>
      </div>

      {metrics.rt60Bands && metrics.rt60Bands.centers.length > 0 && (
        <div className="metric-card">
          <div className="metric-label">RT60 by Octave Band</div>
          <div className="rt60-bands">
            {metrics.rt60Bands.centers.map((fc, i) => {
              const val = metrics.rt60Bands.values[i];
              const label = fc >= 1000 ? `${fc / 1000}k` : `${fc}`;
              return (
                <div key={fc} className="rt60-band">
                  <span className="rt60-band-freq">{label}</span>
                  <span className="rt60-band-val">
                    {val == null ? '—' : `${val.toFixed(2)}s`}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="metric-description">
            Reverberation time per frequency (Hz). Uneven decay is normal — bass
            usually lingers longest.
          </div>
        </div>
      )}

      <div className="metric-card room-quality" style={{ borderColor: roomQuality.color }}>
        <div className="metric-label">Room Character</div>
        <div className="metric-value" style={{ color: roomQuality.color }}>
          {roomQuality.quality}
        </div>
        <div className="metric-description">
          Overall acoustic assessment
        </div>
      </div>

      <div className="info-box">
        <h4>Understanding the Metrics</h4>
        <ul>
          <li><strong>RT60:</strong> Ideal for listening rooms is 0.3-0.6s</li>
          <li><strong>D/R Ratio:</strong> Higher values mean more direct sound (clearer)</li>
          <li><strong>Peak SPL:</strong> Reference level, relative measurement</li>
        </ul>
      </div>
    </div>
  );
};

export default Metrics;
