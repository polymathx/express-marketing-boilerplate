const express = require('express');
const router = express.Router();

/** INITIALIZE CACHING */
const CacheController = require('../controllers/CacheController');
const cache = new CacheController({
  cacheDir: './.local', 
  type: 'html',
  expiry: (3600 * 24 * 7)
});



module.exports = ({Strapi}) => {

  router.get('/', cache.cacheSuccess(), function(req, res, next) {
      res.render('index', {
        title: "Polymath Express Starter"
      });
  });

  /** IF STRAPI IS ENABLED, YOU CAN GRAB PAGE CONTENTS LIKE THIS */
  // router.get('/:page', cache.cacheSuccess(), function(req, res, next) {
  //   Strapi.getPage(req.params.page).then(page => {

  //   }).catch(next);
  // });

  return router;

}