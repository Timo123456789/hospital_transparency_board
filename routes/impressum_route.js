// Hospital Transparency Board Copyright (C) 2023  Maximilian Elfers, Ben Jannis Giese, Timo Lietmeyer, Hendrik Lüning

const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('impressum', { title: 'Impressum' })
})

module.exports = router
