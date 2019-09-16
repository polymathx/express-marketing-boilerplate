const createError = require('http-errors');

class AppMiddleware {

    static removeTrailingSlash(req, res, next) {
      const test = /\?[^]*\//.test(req.url);
      if (req.url.substr(-1) === '/' && req.url.length > 1 && !test) {
        res.redirect(301, req.url.slice(0, -1));
      } else {
        next();
      }
    }

    static catchNotFound(req, res, next) {
        next(createError(404));
    }

    static handleErrors(err, req, res, next) {
        res.locals.message = err.message || 'Unidentified Error';
        res.locals.error = req.app.get('env') !== 'production' ? err : {};
        res.status(err.status || 500);
        res.render('error');
    }

}

module.exports = AppMiddleware;