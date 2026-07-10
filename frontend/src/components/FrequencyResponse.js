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
} from 'recharts';

const FrequencyResponse = ({ frequencies, magnitude }) => {
  // Prepare data for chart
  const data = frequencies.map((freq, i) => ({
    frequency: freq,
    magnitude: magnitude[i],
  }));

  // Custom tick formatter for frequency axis (log scale)
  const formatFrequency = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(0);
  };

  return (
    <div className="chart-container">
      <h3>Frequency Response</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="frequency"
            type="number"
            scale="log"
            domain={[20, 20000]}
            tickFormatter={formatFrequency}
            label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5 }}
            stroke="#888"
          />
          <YAxis
            label={{ value: 'Magnitude (dB)', angle: -90, position: 'insideLeft' }}
            domain={['dataMin - 10', 'dataMax + 5']}
            stroke="#888"
          />
          <Tooltip
            formatter={(value) => [`${value.toFixed(2)} dB`, 'Magnitude']}
            labelFormatter={(value) => `${value.toFixed(0)} Hz`}
            contentStyle={{ backgroundColor: '#2d2d44', border: '1px solid #4a90e2' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="magnitude"
            stroke="#4a90e2"
            strokeWidth={2}
            dot={false}
            name="Response"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FrequencyResponse;
