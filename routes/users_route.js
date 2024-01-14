// Hospital Transparency Board Copyright (C) 2023  Maximilian Elfers, Ben Jannis Giese, Timo Lietmeyer, Hendrik Lüning

const express = require('express')
const router = express.Router()

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource')
})

module.exports = router
