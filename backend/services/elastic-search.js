const CONFIG = require('./../config/config');
const elasticsearch = require('elasticsearch'),
elasticClient = new elasticsearch.Client({
    host: CONFIG.ELASTICSEARCH_URL,
    log: 'trace'
});

module.exports.elasticSearchClient = elasticClient;