import React, { useState, useEffect } from "react";
import api from "../api"; // <-- use the axios instance (reads VITE_AZURE_FUNCTION_URL)
import "./Dashboard.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, LineChart, Line, Legend,
  ResponsiveContainer, ScatterChart, Scatter, ZAxis
} from "recharts";

function NutritionalDashboard() {
  const [nutritionalData, setNutritionalData] = useState(null);
  const [recipeData, setRecipeData] = useState(null);
  const [clustersData, setClustersData] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const [dietType, setDietType] = useState("All Diet Types");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use LOWERCASE routes unless your Function explicitly sets a camelCase `route:`
  const ROUTES = {
    insights: "/getnutritionalinsights",
    recipes: "/getrecipes",
    clusters: "/getclusters",
  };

  const fetchData = async (selectedDietType = dietType) => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const params = { dietType: selectedDietType };

      // Do requests in parallel
      const [nutritionalRes, recipeRes, clustersRes] = await Promise.all([
        api.get(ROUTES.insights, { params }),
        api.get(ROUTES.recipes, { params }),
        api.get(ROUTES.clusters, { params }),
      ]);

      const nut = nutritionalRes?.data?.data ?? null;
      const rec = recipeRes?.data?.data ?? null;
      const clu = clustersRes?.data?.data ?? null;

      setNutritionalData(Array.isArray(nut) && nut.length ? nut : null);
      setRecipeData(Array.isArray(rec) && rec.length ? rec : null);
      setClustersData(Array.isArray(clu) && clu.length ? clu : null);

      setDietType(selectedDietType);
      setExecutionTime(performance.now() - startTime);
    } catch (e) {
      console.error("Fetch error:", e?.response?.data ?? e);
      setError(`Failed to fetch data: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div>Loading...</div>;
  if (error)   return <div style={{ color: "red" }}>Error: {error}</div>;

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
          {["All Diet Types", "Vegan", "Paleo", "Keto", "Mediterranean"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <button onClick={() => fetchData()} className="refresh-button">
          Refresh Data
        </button>
      </div>

      {executionTime && (
        <p className="execution-time">Last fetch took: {executionTime.toFixed(2)} ms</p>
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
                <Bar dataKey="value" />
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
                <Pie data={recipeData} dataKey="value" nameKey="name" label />
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
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter name="Nutritional Correlations" data={clustersData} />
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
