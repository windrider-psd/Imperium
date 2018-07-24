var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  if(req.session.usuario)
    res.render('inicial', { session: req.session.usuario });
  else
    res.render('login');
});
router.get('/login', function(req, res) {
  if(req.session.usuario)
    res.render('inicial', { session: req.session.usuario });
  else
    res.render('login');
});
router.get('/cadastrar', function(req, res) {
  res.render('cadastrar');
});
router.get('/inicial', function(req, res) {
  if(req.session.usuario) 
    res.render('inicial', { session: req.session.usuario });
  else 
    res.render('login');
});


module.exports = router;
