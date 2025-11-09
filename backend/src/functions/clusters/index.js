// Ensure you are using Node.js v4 programming model conventions.

const { app } = require('@azure/functions');
// Make sure the path to your utils file is correct
const dataProcessing = require('../utils/dataProcessing');

app.http('getClusters', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Get Clusters Function triggered');
        const startTime = Date.now();
        // Use request.query.get() for v4 model
        const dietType = request.query.get('dietType') || 'All Diet Types';

        try {
            // Fetch data from Azure Blob Storage
            const records = await dataProcessing.getDataFromBlob();

            // Process cluster data
            const clusterData = processClusterData(records, dietType);

            // In V4 model, the 'jsonBody' property handles serialization and content type automatically.
            return {
                jsonBody: {
                    data: clusterData,
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
                    error: 'Failed to retrieve cluster data',
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

function processClusterData(records, dietType) {
    const filteredRecords = dietType === 'All Diet Types' 
        ? records 
        : records.filter(record => 
            record.DietType.toLowerCase() === dietType.toLowerCase()
        );

    // Calculate correlations between nutritional values
    const correlations = [
        ['', 'Protein', 'Carbs', 'Fat'],
        ['Protein', 1.0, 
            calculateCorrelation(filteredRecords, 'Protein', 'Carbs'), 
            calculateCorrelation(filteredRecords, 'Protein', 'Fat')
        ],
        ['Carbs', 
            calculateCorrelation(filteredRecords, 'Carbs', 'Protein'), 
            1.0, 
            calculateCorrelation(filteredRecords, 'Carbs', 'Fat')
        ],
        ['Fat', 
            calculateCorrelation(filteredRecords, 'Fat', 'Protein'), 
            calculateCorrelation(filteredRecords, 'Fat', 'Carbs'), 
            1.0
        ]
    ];

    return correlations;
}

function calculateCorrelation(records, nutrient1, nutrient2) {
    if (records.length < 2) return 0;

    // Extract numeric values
    const x = records.map(r => parseFloat(r[nutrient1] || 0));
    const y = records.map(r => parseFloat(r[nutrient2] || 0));

    // Calculate means
    const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
    const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;

    // Calculate covariance and standard deviations
    let covariance = 0;
    let varX = 0;
    let varY = 0;

    for (let i = 0; i < x.length; i++) {
        const diffX = x[i] - meanX;
        const diffY = y[i] - meanY;
        
        covariance += diffX * diffY;
        varX += diffX * diffX;
        varY += diffY * diffY;
    }

    covariance /= x.length;
    varX /= x.length;
    varY /= x.length;

    // Prevent division by zero
    if (varX === 0 || varY === 0) return 0;

    // Calculate correlation coefficient
    const correlation = covariance / (Math.sqrt(varX) * Math.sqrt(varY));
    
    // Round to 2 decimal places
    return Math.round(correlation * 100) / 100;
}


// The following conflicting lines have been removed:

/* 
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
*/
