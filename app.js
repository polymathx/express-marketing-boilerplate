/** INCLUDES */
require('dotenv').config();
const EventEmitter = require('events');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const routes = require('./routes');
const TemplateHelper = require('./helpers/TemplateHelpers.js');
const MarkdownIt = require('markdown-it');
const { StrapiController } = require('./controllers');
const { AppMiddleware } = require('./middleware');


class App extends EventEmitter {

    constructor() {
        super();
        /** Strapi Init */
        this.Strapi = null;
        if(!!process.env.STRAPI_HOST && !!process.env.STRAPI_USER && !!process.env.STRAPI_PASS) {
          this.Strapi = new StrapiController({
              endpoint: process.env.STRAPI_HOST,
              user: process.env.STRAPI_USER,
              pass: process.env.STRAPI_PASS
          });
        }

        /** Prepare the variables we need to pass to all Routes */
        this.routeVars = {
          Strapi: this.Strapi
        };

        this.app = express();

        this.init();
        this.ready();

        // // You can defer your server bootup until other things are ready. See the example below, using strapi. 
        // if(!!this.Strapi) {
        //   this.Strapi.getConfig('polymath-config').then(conf => {
        //       this.app.locals.config = conf;
        //       this.ready();
        //   }).catch(e => {
        //       console.error(e);
        //       return process.exit(1);
        //   });
        // } else {
        //   console.log('[Strapi] Disabled');
        //   this.ready();
        // }

    }

    init() {
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set('view engine', 'ejs');
        this.app.locals.helpers = TemplateHelper;
        this.app.locals.md = new MarkdownIt({
            html: true,
            linkify: true,
            typographer: true,
        });

        // Middlewares
        this.app.use(AppMiddleware.removeTrailingSlash);
        this.app.use(logger('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());

        // Public routes
        this.app.use(express.static(path.join(__dirname, 'public')));

        // App Routes
        this.app.use('/', routes.root(this.routeVars));
        //Put other routes here.

        // Catch Errors
        this.app.use(AppMiddleware.catchNotFound);
        this.app.use(AppMiddleware.handleErrors);
    }

    ready() {
      //Bug with event emitter -- 1s timeout defers to next tick. 
      setTimeout(() =>{ 
        this.emit('ready');
      }, 1);
    }

}

module.exports = App;
