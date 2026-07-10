import React from 'react';

const HeatmapView = ({ heatmapData, roomDimensions, speakerPosition }) => {
  // Hooks must run unconditionally on every render, before any early return.
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current || !heatmapData) return;

    const { x, y, spl } = heatmapData;
    const flatSPL = spl.flat();
    const minSPL = Math.min(...flatSPL);
    const maxSPL = Math.max(...flatSPL);
    const range = maxSPL - minSPL || 1;

    // Color mapping: blue (low) -> cyan -> green -> yellow -> red (high)
    const getSPLColor = (value) => {
      const normalized = (value - minSPL) / range;
      let r, g, b;
      if (normalized < 0.25) {
        const t = normalized / 0.25;
        r = 0; g = Math.floor(t * 255); b = 255;
      } else if (normalized < 0.5) {
        const t = (normalized - 0.25) / 0.25;
        r = 0; g = 255; b = Math.floor((1 - t) * 255);
      } else if (normalized < 0.75) {
        const t = (normalized - 0.5) / 0.25;
        r = Math.floor(t * 255); g = 255; b = 0;
      } else {
        const t = (normalized - 0.75) / 0.25;
        r = 255; g = Math.floor((1 - t) * 255); b = 0;
      }
      return `rgb(${r}, ${g}, ${b})`;
    };

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const cellWidth = width / x.length;
    const cellHeight = height / y.length;

    for (let i = 0; i < y.length; i++) {
      for (let j = 0; j < x.length; j++) {
        ctx.fillStyle = getSPLColor(spl[i][j]);
        ctx.fillRect(
          j * cellWidth,
          (y.length - 1 - i) * cellHeight,
          cellWidth,
          cellHeight
        );
      }
    }

    // Speaker position marker
    const speakerX = (speakerPosition[0] / roomDimensions[0]) * width;
    const speakerY = height - (speakerPosition[1] / roomDimensions[1]) * height;
    ctx.beginPath();
    ctx.arc(speakerX, speakerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= x.length; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, height);
      ctx.stroke();
    }
    for (let i = 0; i <= y.length; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(width, i * cellHeight);
      ctx.stroke();
    }
  }, [heatmapData, speakerPosition, roomDimensions]);

  if (!heatmapData) return null;

  const flatSPL = heatmapData.spl.flat();
  const minSPL = Math.min(...flatSPL);
  const maxSPL = Math.max(...flatSPL);

  return (
    <div className="heatmap-container">
      <h3>SPL Distribution (Top View)</h3>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={600}
          height={480}
          style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
        />
      </div>

      <div className="legend">
        <h4>SPL Scale</h4>
        <div className="legend-gradient">
          <div className="gradient-bar" style={{
            background: 'linear-gradient(to right, rgb(0,0,255), rgb(0,255,255), rgb(0,255,0), rgb(255,255,0), rgb(255,0,0))'
          }} />
          <div className="legend-labels">
            <span>{minSPL.toFixed(1)} dB</span>
            <span>{maxSPL.toFixed(1)} dB</span>
          </div>
        </div>
        <p className="legend-note">
          White circle = Speaker position<br />
          Showing SPL distribution at height: {speakerPosition[2].toFixed(2)}m
        </p>
      </div>

      <div className="heatmap-info">
        <h4>About This Visualization</h4>
        <p>
          This heatmap shows the relative sound level distribution across the room
          at the listening height. Warmer colors indicate higher level, cooler colors
          indicate lower level. Note that this is a simplified model and actual
          measurements may vary due to furniture, room geometry, and other factors.
        </p>
      </div>
    </div>
  );
};

export default HeatmapView;
