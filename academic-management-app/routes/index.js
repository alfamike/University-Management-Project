const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('registration/login', { title: 'University Management' });
});

module.exports = router;
