const { app } = require('@azure/functions');
const dataProcessing = require('../src/functions/utils/dataProcessing');

app.http('getRecipes', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Get Recipes Function triggered');
        const startTime = Date.now();
        const dietType = request.query.get('dietType') || 'All Diet Types';

        try {
            // Fetch data from Azure Blob Storage
            const records = await dataProcessing.getDataFromBlob();

            // Process recipe data
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
                    'Content-Type': 'application/json',
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
                    'Content-Type': 'application/json',
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

module.exports = app;
module.exports = async function (context, req) {
  try {
    const diet = (req.query.diet || 'all').toLowerCase();
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { ok: true, function: context.executionContext.functionName, diet }
    };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
