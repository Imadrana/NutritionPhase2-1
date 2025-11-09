const { BlobServiceClient } = require('@azure/storage-blob');
const { parse } = require('csv-parse/sync');

async function getDataFromBlob() {
    // Get connection string from environment variables
    const connectionString = process.env.DIETS_STORAGE_CONNECTION;
    const containerName = process.env.DIETS_CONTAINER;
    const blobName = process.env.DIETS_BLOB;

    try {
        // Create blob service client
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobClient = containerClient.getBlobClient(blobName);

        // Download blob content
        const downloadResponse = await blobClient.download();
        const csvContent = await streamToString(downloadResponse.readableStreamBody);

        // Parse CSV
        const records = parse(csvContent, { 
            columns: true, 
            skip_empty_lines: true 
        });

        return records;
    } catch (error) {
        console.error('Blob Storage Error:', error);
        throw error;
    }
}

// Existing utility function to convert stream to string
async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => chunks.push(data));
        readableStream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        readableStream.on('error', reject);
    });
}

// Utility function for processing nutritional insights with case-insensitive filtering
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

// Utility function to calculate average
function calculateAverage(records, nutrient) {
    if (records.length === 0) return 0;
    const total = records.reduce((sum, record) => sum + parseFloat(record[nutrient] || 0), 0);
    return Math.round(total / records.length);
}

module.exports = {
    getDataFromBlob,
    streamToString,
    processNutritionalInsights,
    calculateAverage
};