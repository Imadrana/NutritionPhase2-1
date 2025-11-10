import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

function NutritionalDashboard() {
  const [nutritionalData, setNutritionalData] = useState(null);
  const [recipeData, setRecipeData] = useState(null);
  const [clustersData, setClustersData] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const [dietType, setDietType] = useState('All Diet Types');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_AZURE_FUNCTION_URL;

  const fetchData = async (selectedDietType = dietType) => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      console.log('Fetching data from:', API_URL);
      console.log('Diet Type:', selectedDietType);

      const nutritionalResponse = await axios.get(
        `${API_URL}/getNutritionalInsights`, 
        { 
          params: { dietType: selectedDietType },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const recipeResponse = await axios.get(
        `${API_URL}/getRecipes`, 
        { 
          params: { dietType: selectedDietType },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const clustersResponse = await axios.get(
        `${API_URL}/getClusters`, 
        { 
          params: { dietType: selectedDietType },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      // Validate data before setting state
      if (!nutritionalResponse.data.data || nutritionalResponse.data.data.length === 0) {
        console.warn('No nutritional data found for selected diet type');
        setNutritionalData(null);
      } else {
        setNutritionalData(nutritionalResponse.data.data);
      }

      if (!recipeResponse.data.data || recipeResponse.data.data.length === 0) {
        console.warn('No recipe data found for selected diet type');
        setRecipeData(null);
      } else {
        setRecipeData(recipeResponse.data.data);
      }

      if (!clustersResponse.data.data || clustersResponse.data.data.length === 0) {
        console.warn('No clusters data found for selected diet type');
        setClustersData(null);
      } else {
        setClustersData(clustersResponse.data.data);
      }

      const endTime = performance.now();
      
      setDietType(selectedDietType);
      setExecutionTime(endTime - startTime);
    } catch (error) {
      console.error('Detailed Fetch Error:', {
        message: error.message,
        response: error.response ? error.response.data : 'No response',
        config: error.config
      });
      setError(`Failed to fetch data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>Error: {error}</div>;

  return (
    <div className="nutritional-dashboard">
      <div className="dashboard-header">
        <h1>Nutritional Insights Dashboard</h1>
      </div>
      
      <div className="dashboard-controls">
        <select 
          value={dietType} 
          onChange={(e) => fetchData(e.target.value)}
          className="diet-type-select"
        >
          {['All Diet Types', 'Vegan', 'Paleo', 'Keto', 'Mediterranean'].map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        
        <button 
          onClick={() => fetchData()} 
          className="refresh-button"
        >
          Refresh Data
        </button>
      </div>

      {executionTime && (
        <p className="execution-time">
          Last fetch took: {executionTime.toFixed(2)} ms
        </p>
      )}

      <div className="charts-container">
        {nutritionalData ? (
          <div className="chart">
            <h3>Nutritional Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={nutritionalData}>
                <XAxis dataKey="nutrient" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart no-data">
            <h3>No Nutritional Data Available</h3>
            <p>Try selecting a different diet type</p>
          </div>
        )}

        {recipeData ? (
          <div className="chart">
            <h3>Recipe Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={recipeData} 
                  dataKey="value" 
                  nameKey="name" 
                  fill="#82ca9d"
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart no-data">
            <h3>No Recipe Data Available</h3>
            <p>Try selecting a different diet type</p>
          </div>
        )}

        {clustersData ? (
          <div className="chart correlation-chart">
            <h3>Nutritional Correlations</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <XAxis type="number" dataKey={1} name="Protein" />
                <YAxis type="number" dataKey={2} name="Carbs" />
                <ZAxis type="number" dataKey={3} name="Fat" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Nutritional Correlations" data={clustersData} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart no-data">
            <h3>No Correlation Data Available</h3>
            <p>Try selecting a different diet type</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NutritionalDashboard;
