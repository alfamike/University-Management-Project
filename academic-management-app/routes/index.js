const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('registration/login', { page_title: 'University Management' , error: null});
});

module.exports = router;
