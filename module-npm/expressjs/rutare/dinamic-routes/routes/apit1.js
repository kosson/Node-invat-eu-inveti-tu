const express = require('express');
const router = express.Router();

router.route('/')
  .all(function clbkAllApit1(req, res, next) {
    console.log("Eu mă execut pentru orice pe /api/apit1");
    next();
  })
  .get(function clbkGetApit1 (req, res, next) {
    res.send("Bine ai venit, veveriță!");
  });

module.exports = router;
