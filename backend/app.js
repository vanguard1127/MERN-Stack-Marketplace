var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
const cors          = require('cors');
const {elasticSearchClient} = require('./services/elastic-search');
const CONFIG = require('./config/config');

require('./models/ordercart');
require('./models/category');
require('./models/product');
require('./models/order');
require('./models/user');
require('./models/checkout');
require('./models/address');
require('./models/fee');
require('./models/transaction');
require('./models/userpoint');
require('./models/shipping');

const indexService  = require('./services/indexing.service');

indexService.createIndex();


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var categoryRouter = require('./routes/categories');
var productRouter = require('./routes/products');
var orderRouter = require('./routes/orders');
var cartRouter = require('./routes/ordercarts');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


function connect() {
    mongoose.connection
        .on('error', console.log)
        .on('disconnected', connect)
        .once('open', listen);
    return mongoose.connect(CONFIG.MONGO_URL, { keepAlive: 1, useNewUrlParser: true });
}
function listen()
{
    console.log("mongodb is connected!");
}
connect();

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productRouter);
app.use('/categories', categoryRouter);
app.use('/orders' , orderRouter);
app.use('/carts' , cartRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    res.render('error');
});

module.exports = app;
