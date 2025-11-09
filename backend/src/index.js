const { app } = require('@azure/functions');

require('./functions/recipes/index');
require('./functions/nutritional-insights/index');
require('./functions/clusters/index');

module.exports = app;