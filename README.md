# Express Marketing Boilerplate
The ultimate NodeJS + Express Boilerplate project for fast, effective, and high ranking marketing sites.

## Setting Up
- Clone the repository
- `npm i` - Install
- `npm run start` - Starts the express development server.
- `npm run styles` - Watches the SCSS folder for changes.
- `npm run build` - Builds the client side JS with webkit, and watches for changes.
- `npm run sync` - Creates a browsersync server for debugging, and to auto refresh the browser on change.

## Environment Variables

**General**
- `USE_CACHE` - If set to true, server side static response caching will be enabled
- `PORT` - Port to run on

**Strapi Specific** 

By adding these variables, you will auto-enable the strapi plugin.

- `STRAPI_HOST` - Host for your strapi install
- `STRAPI_USER` - User for Strapi
- `STRAPI_PASS` - Password for Strapi

## Integrations
A handful of out of the box integrations can be found in the Controllers section. These were built to aid with rapid development. They can be easily disabled, or not used. 

**Strapi**

We have a server side controller for using the Strapi CMS in NodeJS. This controller facilitates auth over the Strapi API. It also provides helper methods for retrieving content, and a few methods specifically for retrieving certain names models (pages, and configs specifically). 

**Static Response Cache**

A custom static file response cache to speed up page loads. 

