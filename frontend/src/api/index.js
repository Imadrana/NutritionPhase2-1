import { app } from "@azure/functions";

app.http("getnutritionalinsights", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "getnutritionalinsights",
}, async (req, ctx) => {
  return { jsonBody: { ok: true, route: "getnutritionalinsights" } };
});

app.http("getrecipes", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "getrecipes",
}, async (req, ctx) => {
  return { jsonBody: { ok: true, route: "getrecipes" } };
});

app.http("getclusters", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "getclusters",
}, async (req, ctx) => {
  return { jsonBody: { ok: true, route: "getclusters" } };
});
