var express = require('express');
var router = express.Router();
let pool = require('../database');

/* GET home page. */
router.get('/', async function (req, res, next) {

  res.render('index', { title: 'Express' });

});

router.get('/files', async function (req, res, next) {
  res.render('files', { title: 'Files' });
});

module.exports = router;
