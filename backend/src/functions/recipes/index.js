// Ensure you are using Node.js v4 programming model conventions
// This file only contains one function registration.

const { app } = require('@azure/functions');
// Make sure the path to your utils file is correct
const dataProcessing = require('../utils/dataProcessing'); 

app.http('getRecipes', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Get Recipes Function triggered');
        const startTime = Date.now();
        // Use request.query.get() for v4 model
        const dietType = request.query.get('dietType') || 'All Diet Types';

        try {
            // Fetch data from Azure Blob Storage
            const records = await dataProcessing.getDataFromBlob();

            // Process recipe data
            const recipeData = processRecipeData(records, dietType);

            // In V4 model, you return the response object directly, 
            // the 'jsonBody' property handles serialization and content type automatically.
            return {
                jsonBody: {
                    data: recipeData,
                    metadata: {
                        dietType: dietType,
                        executionTime: Date.now() - startTime,
                        timestamp: new Date().toISOString()
                    }
                },
                headers: {
                    // Content-Type is set automatically for jsonBody
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            };
        } catch (error) {
            context.log(`Error: ${error.message}`);
            return {
                status: 500,
                jsonBody: { 
                    error: 'Failed to retrieve data',
                    details: error.message 
                },
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            };
        }
    }
});

function processRecipeData(records, dietType) {
    const filteredRecords = dietType === 'All Diet Types' 
        ? records 
        : records.filter(record => 
            record.DietType.toLowerCase() === dietType.toLowerCase()
        );

    const dietTypeCounts = {};
    filteredRecords.forEach(record => {
        const diet = record.DietType || 'Unknown';
        dietTypeCounts[diet] = (dietTypeCounts[diet] || 0) + 1;
    });

    return Object.entries(dietTypeCounts).map(([name, value]) => ({ name, value }));
}

// In the v4 model, you do not need 'module.exports = app;' at the bottom of the function file itself.
// The presence of the app.http() call at the top level is enough for the host to detect it.

// The conflicting v3 export has been removed.
