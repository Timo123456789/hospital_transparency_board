const express = require('express');
const router = express.Router();
const path = require('path');



router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../data/krankenhausverzeichnis-Standorte.geojson'));
  });





module.exports = router;
