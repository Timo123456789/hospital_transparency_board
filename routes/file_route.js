const express = require('express')
const router = express.Router()
const path = require('path')

router.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../data/krankenhausverzeichnis-Standorte.geojson'))
})

router.get('/spezialisierung', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../data/Spezialisierung.json'))
})

router.get('/spezialisierungWithNumbers', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../data/spezialisierungen_number_based.json'))
})
module.exports = router
