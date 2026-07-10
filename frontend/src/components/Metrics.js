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
        <div className="metric-label">Peak SPL</div>
        <div className="metric-value">{formatValue(metrics.peakSPL, 1, ' dB')}</div>
        <div className="metric-description">
          Sound pressure level at listener position
        </div>
      </div>

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
