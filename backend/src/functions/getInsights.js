import { app } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
import { parse } from "csv-parse";

/**
 * Stream-parse a CSV readable stream and collect up to `limit` rows.
 * Returns { rows, processed, truncated }
 */
async function streamParseCsv(readable, limit = 500) {
  return new Promise((resolve, reject) => {
    const rows = [];
    const parser = parse({ columns: true, skip_empty_lines: true });

    let processed = 0;
    let truncated = false;

    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        processed += 1;
        if (processed <= limit) rows.push(record);
        if (processed >= limit) {
          truncated = true;
          // stop parsing further
          try {
            parser.destroy();
            if (readable.destroy) readable.destroy();
          } catch (e) {
            // ignore
          }
          break;
        }
      }
    });

    parser.on("end", () => resolve({ rows, processed, truncated }));
    parser.on("error", (err) => reject(err));

    // Pipe the blob stream into the parser
    try {
      readable.pipe(parser);
    } catch (err) {
      reject(err);
    }
  });
}

const getInsightsFunction = async (request, context) => {
  try {
    const connectionString = process.env.DIETS_STORAGE_CONNECTION || process.env.AzureWebJobsStorage || process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      context.log("No storage connection string found in environment. Set DIETS_STORAGE_CONNECTION or AzureWebJobsStorage.");
      return { status: 500, jsonBody: { error: "Storage connection not configured" } };
    }

    const containerName = process.env.DIETS_CONTAINER || "datasets";
    const blobName = process.env.DIETS_BLOB || "All_Diets_clean.csv";
    const limit = Number(request.query?.limit) || 500;

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const exists = await containerClient.exists();
    if (!exists) {
      context.log(`Container '${containerName}' not found`);
      return { status: 404, jsonBody: { error: `Container '${containerName}' not found` } };
    }

    const blobClient = containerClient.getBlobClient(blobName);
    const blobExists = await blobClient.exists();
    if (!blobExists) {
      context.log(`Blob '${blobName}' not found in container '${containerName}'`);
      const list = [];
      for await (const b of containerClient.listBlobsFlat()) {
        list.push(b.name);
      }
      return { status: 404, jsonBody: { error: `Blob '${blobName}' not found`, availableBlobs: list } };
    }

    const downloadResponse = await blobClient.download();
    const readable = downloadResponse.readableStreamBody;
    if (!readable) {
      return { status: 500, jsonBody: { error: "Failed to get blob readable stream" } };
    }

    // Stream-parse CSV and return up to `limit` rows without loading entire file into memory
    const { rows, processed, truncated } = await streamParseCsv(readable, limit);

    return {
      status: 200,
      jsonBody: {
        blob: blobName,
        container: containerName,
        returnedRows: rows.length,
        processedRows: processed,
        truncated: truncated,
        rows
      }
    };
  } catch (error) {
    context.log.error("Error in getInsights:", error);
    return { status: 500, jsonBody: { error: error.message } };
  }
};

app.http("getInsights", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: getInsightsFunction
});
