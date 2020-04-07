const axios = require('axios');
const fs = require('fs');

class StrapiController {

    constructor({endpoint, user, pass}) {
        this.endpoint = endpoint;
        this.user = user;
        this.pass = pass;
        this.isCaching = false;
        //this.tokenCheck();
    }

    tokenCheck() {
        return new Promise((resolve, reject) => {
            console.log("[Strapi] Token Validation Started.");
            let cachedAuth = this.loadCache('./.local/strapi.auth.json');
            let tokenIsFresh = !!cachedAuth && cachedAuth.cachedAt && (Math.floor(Date.now() / 1000) <  (cachedAuth.cachedAt + 86400));
            if(!this.token || !tokenIsFresh) {
                console.log("[Strapi] Token Validation Done.");
                this.authenticateUser({user: this.user, pass: this.pass})
                .then(token => {
                    this.token = token;
                    return resolve(this.token);
                }).catch(reject);
            } else {
                this.token = cachedAuth.jwt;
                console.log("[Strapi] Token Validation Done.");
                return resolve(this.token);
            }
        });
    }

    loadCache(fpath) {
        if (fs.existsSync(fpath)) {
            let raw = fs.readFileSync(fpath);
            let authData = JSON.parse(raw);
            return authData;
        }
        return null;
    }

    cacheResponse(data, fpath) {
        if(!this.isCaching) {
            this.isCaching = true;
            console.log("[Strapi] Caching Response Data.");
            data.cachedAt = Math.floor(Date.now() / 1000);
            try {
                fs.writeFileSync(fpath, JSON.stringify(data))
                this.isCaching = false;
            } catch (err) {
                console.error(err);
                this.isCaching = false;
            }
        }
    }

    authenticateUser({user, pass}) {
        return new Promise((resolve, reject) => {
            console.log("[Strapi] Authenticating with Strapi Server.");
            axios.post(`${this.endpoint}auth/local`, {
                identifier: user,
                password: pass
            }).then(auth => {
                if(auth.data && auth.data.jwt) {
                    this.cacheResponse(auth.data, './.local/strapi.auth.json');
                    return resolve(auth.data.jwt);
                }
                return reject(new Error("Bad Auth Response."));
            }).catch(reject);
        });
    }

    post({model, data}) {
        return new Promise((resolve, reject) => {
            this.tokenCheck().then(token => {
                const apiPath = `${this.endpoint}${model}`; 
                return resolve(axios({
                    method: "POST",
                    url: apiPath,
                    headers: { Authorization: `Bearer ${token}` },
                    data: data
                }));
            }).catch(reject);
        });
    }

    get({model, params}) {
        return new Promise((resolve, reject) => {
            this.tokenCheck().then(token => {
                const apiPath = `${this.endpoint}${model}`;
                return resolve(axios({
                    method: "GET",
                    url: apiPath,
                    params,
                    headers: { Authorization: `Bearer ${token}` }
                }));
            }).catch(reject);
        });
    }

    getPage(identifier) {
        return new Promise((resolve, reject) => {
            this.get({
                model: 'pages',
                params: { identifier }
            }).then(response => {
                if(response.data && response.data.length > 0) {
                    console.log('[Strapi] : Got Page - ' + identifier);
                    return resolve(response.data[0]);
                } else {
                    var err = new Error();
                    if(response.status == 200) {
                        err.code = 404;
                        err.message = "Content not found.";
                    } else {
                        err.message = "Bad response data."
                        err.code = 500;
                    }
                    return reject(err);
                }
            });
        });
    }

    getConfig(identifier) {
        return new Promise((resolve, reject) => {
            this.get({
                model: 'configs',
                params: {
                    identifier: identifier
                }
            }).then(response => {
                if(response.data && response.data.length > 0) {
                    return resolve(response.data[0]);
                } else {
                    return reject(new Error("Bad Response Data"));
                }
            }).catch(reject);
        });
    }


}

module.exports = StrapiController;