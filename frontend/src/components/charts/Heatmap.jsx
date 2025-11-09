import React from 'react';
import { ResponsiveContainer } from 'recharts';

const Heatmap = () => {
  const heatmapData = [
    ['', 'Protein', 'Carbs', 'Fat'],
    ['Protein', 1, 0.5, 0.3],
    ['Carbs', 0.5, 1, 0.2],
    ['Fat', 0.3, 0.2, 1]
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '5px',
        height: '100%'
      }}>
        {heatmapData.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <div 
              key={`${rowIndex}-${colIndex}`} 
              style={{ 
                backgroundColor: rowIndex === 0 || colIndex === 0 
                  ? '#2196F3' 
                  : `rgba(33, 150, 243, ${cell})`,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
            >
              {cell}
            </div>
          ))
        )}
      </div>
    </ResponsiveContainer>
  );
};

export default Heatmap;