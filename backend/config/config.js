require('dotenv').config();//instatiate environment variables

let CONFIG = {} //Make this global to use all over the application

CONFIG.app          = process.env.APP   || 'dev';
CONFIG.port         = process.env.PORT  || '3030';

CONFIG.MONGO_URL    = process.env.MONGODB_URL || 'mongodb://localhost:27017/marketplacedb';
CONFIG.jwt_encryption  = process.env.JWT_ENCRYPTION || 'abcdefghi';
CONFIG.jwt_expiration  = process.env.JWT_EXPIRATION || '10000';
CONFIG.TWILIO_ACCOUNT_SID =process.env.TWILIO_ACCOUT_SID || 'AC3ea7e8cbf66b02a516183be5897538d0';
CONFIG.TWILIO_ACCOUNT_TOKEN=    process.env.TWILIO_ACCOUNT_TOOKEN || 'c21f8df7517b1b815703540cc1f105a1';
CONFIG.ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
CONFIG.USE_ELASTIC_SEARCH = process.env.USE_ELASTIC_SEARCH || 'true';
CONFIG.ELASTIC_SEARCH_INDEX = process.env.ELASTIC_SEARCH_INDEX || 'marketplace';
CONFIG.SENDING_EMAIL = process.env.SENDING_EMAIL || 'peonygarden44@gmail.com';
CONFIG.SENDING_EMAIL_PASS = process.env.SENDING_EMAIL_PASS || 'freelancer4$';
module.exports = CONFIG;