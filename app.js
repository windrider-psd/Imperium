var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');   
var paginaRouter = require('./routes/paginas');
var usuarioRouter = require('./routes/usuario');
var edificiosRouter = require("./routes/edificio");
var browserify = require('browserify-middleware');
var session = require('express-session')
var helmet = require('helmet');
var DDDoS = require('dddos');
var RedisStore = require('connect-redis')(session);
var redis = require('redis').createClient({host : 'localhost', port : 6379});

var app = express();
browserify.settings.minify = true;
browserify.settings.insertGlobals = true;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(helmet());
app.use(new DDDoS({
  maxWeight: 100
}).express('ip', 'path'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(session({
  store : new RedisStore({host : 'localhost', port : 6379, client : redis}),
  resave: true,
  saveUninitialized : false, 
  secret : 'uijn4unip32nur324p23u'}));
app.get('/js/bundle_chart.js', browserify(['chartjs', 'chartjs-plugin-zoom']));
app.get('/js/recursos.js', function(req, res)
{
  res.setHeader("content-type", "application/javascript");
  res.sendFile(__dirname + "/model/GerenciadorRecursos.js")
});
app.use('/', paginaRouter);
app.use('/usuario', usuarioRouter);
app.use('/edificio', edificiosRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
}); 
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
