let createError = require('http-errors')
let express = require('express')
let path = require('path')
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let logger = require('morgan')
let paginaRouter = require('./routes/paginas')
let usuarioRouter = require('./routes/usuario')
let edificiosRouter = require("./routes/edificio")
let comunicacaoRouter = require('./routes/comunicacao')
let aliancaRouter = require("./routes/alianca")
let mapaRouter = require("./routes/mapa")
let militarRouter = require('./routes/militar')

let helmet = require('helmet')
let DDDoS = require('dddos')
let webpack = require('webpack');
let webpackConfig = require('./webpack.config');
let compiler = webpack(webpackConfig);
let yargs = require('yargs').argv
require('dotenv')

module.exports = function CriarApp(sessao)
{
  let app = express()

  // view engine setup
  app.set('views', path.join(__dirname, 'dist'))
  app.set('view engine', 'pug')
  app.use(helmet())
  app.use(new DDDoS({
    maxWeight: 100
  }).express('ip', 'path'))

  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(express.static(path.join(__dirname, 'dist')))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  
  app.use(sessao)
  app.use('/', paginaRouter)
  app.use('/usuario', usuarioRouter)
  app.use('/edificio', edificiosRouter)
  app.use('/comunicacao', comunicacaoRouter)
  app.use('/alianca', aliancaRouter)
  app.use('/mapa', mapaRouter)
  app.use('/militar', militarRouter)


  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  })


  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}
    console.log(err);
    // render the error page
    res.status(err.status || 500)
    res.json(err)
  });
  app.locals.enderecoIP = require('ip').address()
  console.log(`Modo: ${process.env.MODE}`)
  if(process.env.MODE == 'development' && !yargs.nowebpack)
  {
    app.use(require("webpack-dev-middleware")(compiler, {
      publicPath: __dirname + '/dist/', writeToDisk : true
    }));
  
    app.use(require("webpack-hot-middleware")(compiler));
  }
  

  

  return app
}

