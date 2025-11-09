import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const sampleData = [
  { name: 'Vegan', value: 25 },
  { name: 'Paleo', value: 20 },
  { name: 'Keto', value: 25 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CustomPieChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={sampleData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {sampleData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomPieChart;