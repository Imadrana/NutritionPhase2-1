import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const sampleData = [
  { nutrient: 'Protein', value: 25 },
  { nutrient: 'Carbs', value: 50 },
  { nutrient: 'Fat', value: 25 }
];

const CustomBarChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sampleData}>
        <XAxis dataKey="nutrient" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CustomBarChart;