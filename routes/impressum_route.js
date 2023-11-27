// Hospital Transparency Board Copyright (C) 2023  Maximilian Elfers, Ben Jannis Giese, Timo Lietmeyer, Hendrik Lüning

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('impressum', { title: 'Impressum' });
  });

module.exports = router;