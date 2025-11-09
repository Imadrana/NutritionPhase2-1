import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const sampleData = [
  { x: 10, y: 20 },
  { x: 20, y: 30 },
  { x: 30, y: 40 },
  { x: 40, y: 50 }
];

const CustomScatterPlot = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <XAxis type="number" dataKey="x" name="Protein" />
        <YAxis type="number" dataKey="y" name="Carbs" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter data={sampleData} fill="#8884d8" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default CustomScatterPlot;