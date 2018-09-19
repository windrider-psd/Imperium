var createError = require('http-errors')
var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var paginaRouter = require('./routes/paginas')
var usuarioRouter = require('./routes/usuario')
var edificiosRouter = require("./routes/edificio")
var comunicacaoRouter = require('./routes/comunicacao')
var aliancaRouter = require("./routes/alianca")
var browserify = require('browserify-middleware')
var helmet = require('helmet')
var DDDoS = require('dddos')
var webpack = require('webpack');
var webpackConfig = require('./webpack.config');
var compiler = webpack(webpackConfig);
module.exports = function CriarApp(sessao)
{
  var app = express()
  browserify.settings.minify = true
  browserify.settings.insertGlobals = true

  // view engine setup
  app.set('views', path.join(__dirname, 'pages/specific'))
  app.set('view engine', 'pug')
  app.use(helmet())
  app.use(new DDDoS({
    maxWeight: 100
  }).express('ip', 'path'))

  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(express.static(path.join(__dirname, 'public')))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  
  app.get('/js/recursos.js', (req, res) =>
  {
    res.setHeader("content-type", "application/javascript")
    res.sendFile(__dirname + "/model/GerenciadorRecursos.js")
  });
  app.use(sessao)
  app.use('/', paginaRouter)
  app.use('/usuario', usuarioRouter)
  app.use('/edificio', edificiosRouter)
  app.use('/comunicacao', comunicacaoRouter)
  app.use('/alianca', aliancaRouter)
  


  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  })


  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
  });
  app.locals.enderecoIP = require('ip').address()

  app.use(require("webpack-dev-middleware")(compiler, {
    publicPath: __dirname + '/public/dist/', writeToDisk : true
  }));
  app.use(require("webpack-hot-middleware")(compiler));

  return app
}

