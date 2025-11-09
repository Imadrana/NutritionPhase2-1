const { app } = require('@azure/functions');
const dataProcessing = require('../src/functions/utils/dataProcessing');

app.http('getNutritionalInsights', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Get Nutritional Insights Function triggered');
        const startTime = Date.now();
        const dietType = request.query.get('dietType') || 'All Diet Types';

        try {
            // Fetch data from Azure Blob Storage
            const records = await dataProcessing.getDataFromBlob();

            // Process nutritional insights
            const processedData = processNutritionalInsights(records, dietType);

            return {
                jsonBody: {
                    data: processedData,
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
                    error: 'Failed to retrieve nutritional insights',
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

function processNutritionalInsights(records, dietType) {
    const filteredRecords = dietType === 'All Diet Types' 
        ? records 
        : records.filter(record => 
            record.DietType.toLowerCase() === dietType.toLowerCase()
        );

    return [
        { 
            nutrient: 'Protein', 
            value: calculateAverage(filteredRecords, 'Protein') 
        },
        { 
            nutrient: 'Carbs', 
            value: calculateAverage(filteredRecords, 'Carbs') 
        },
        { 
            nutrient: 'Fat', 
            value: calculateAverage(filteredRecords, 'Fat') 
        }
    ];
}

function calculateAverage(records, nutrient) {
    if (records.length === 0) return 0;
    const total = records.reduce((sum, record) => sum + parseFloat(record[nutrient] || 0), 0);
    return Math.round(total / records.length);
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