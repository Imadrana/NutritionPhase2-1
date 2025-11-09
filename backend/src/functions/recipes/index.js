const { app } = require('@azure/functions');
const dataProcessing = require('../utils/dataProcessing'); 

app.http('getRecipes', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Get Recipes Function triggered');
        const startTime = Date.now();
        const dietType = request.query.get('dietType') || 'All Diet Types';

        try {
            const records = await dataProcessing.getDataFromBlob();

            const recipeData = processRecipeData(records, dietType);

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