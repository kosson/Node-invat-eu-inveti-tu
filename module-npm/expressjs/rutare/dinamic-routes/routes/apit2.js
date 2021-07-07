const express = require('express');
const router = express.Router();

router.route('/')
  .all(function clbkAllApit2(req, res, next) {
    console.log("Eu mă execut pentru orice pe /api/apit2");
    next();
  })
  .get(function clbkGetApit2 (req, res, next) {
    res.send("Bine ai venit, pritene la una dinamică!");
  });

module.exports = router;
