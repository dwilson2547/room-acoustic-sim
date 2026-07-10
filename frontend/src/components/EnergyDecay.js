import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const EnergyDecay = ({ time, energy }) => {
  // Prepare data for chart
  const data = time.map((t, i) => ({
    time: t * 1000, // Convert to milliseconds
    energy: energy[i],
  }));

  return (
    <div className="chart-container">
      <h3>Energy Decay Curve</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="time"
            label={{ value: 'Time (ms)', position: 'insideBottom', offset: -5 }}
            stroke="#888"
          />
          <YAxis
            label={{ value: 'Energy (dB)', angle: -90, position: 'insideLeft' }}
            stroke="#888"
          />
          <Tooltip
            formatter={(value) => [`${value.toFixed(2)} dB`, 'Energy']}
            labelFormatter={(value) => `${value.toFixed(1)} ms`}
            contentStyle={{ backgroundColor: '#2d2d44', border: '1px solid #4a90e2' }}
          />
          <Legend />
          <ReferenceLine y={-60} stroke="#ff6b6b" strokeDasharray="5 5" label="RT60" />
          <Line
            type="monotone"
            dataKey="energy"
            stroke="#4ecdc4"
            strokeWidth={2}
            dot={false}
            name="Energy Decay"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnergyDecay;
