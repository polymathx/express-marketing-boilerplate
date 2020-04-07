const fs = require('fs');
const path = require('path');

class CacheController {

    constructor({cacheDir, type, expiry}) {
        this.validTypes = {
            'xml': 'application/xml',
            'json': 'json',
            'html': 'html',
            'text': 'text'
        };
        this.hour = 3600;
        this.directory = cacheDir || '.cache';
        this.type = type || 'text';
        this.expiry = expiry || this.hour; //1 hour default
        this.directCachePath = path.join(__dirname, '..', this.directory);
        this.typePath = path.join(__dirname, '..', this.directory, this.type);
        this.useCache = !!process.env.USE_CACHE && process.env.USE_CACHE === 'true' ? true : false;
        console.log(`[Cache] ${this.type} cache initiated:`, this.useCache);

        //Create folders if they dont exist. 
        if (!fs.existsSync(this.directCachePath)){
            fs.mkdirSync(this.directCachePath);
        }
        if (!fs.existsSync(this.typePath)){
            fs.mkdirSync(this.typePath);
        }
    }
    
    clear() {
        const getDirectories = fs.readdirSync(this.directCachePath, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
        getDirectories.forEach((e, i) => {
            let cacheFolder = path.join(this.directCachePath, e);
            fs.readdir(cacheFolder, (err, files) => {
                if (err) throw err;
                
                for (const file of files) {
                    fs.unlink(path.join(cacheFolder, file), err => {
                        if (err) throw err;
                    });
                }
            });
        });
    }

    cachePath(filePath) {
        return path.join(__dirname, '..', this.directory, this.type, encodeURIComponent(filePath) + `.${this.type}`);
    }

    createdDate(filePath) {
        const { birthtime } = fs.statSync(this.cachePath(filePath));
        return Math.floor(new Date(birthtime) / 1000);
    }

    needsFreshCache(filePath) {
        let createdAt = this.createdDate(filePath);
        let now = Math.floor(new Date() / 1000);
        let timeSince = now - createdAt;
        return timeSince > this.expiry ? true : false;
    }

    exists(filePath) {
        return fs.existsSync(this.cachePath(filePath))
    }

    write(data, filePath) {
        return new Promise((resolve, reject) => {
            try {
                fs.writeFileSync(this.cachePath(filePath), data);
                return resolve(this.cachePath(filePath));
            } catch (err) {
                return reject(err);
            }
        });
    }

    loadCache(filePath) {
        return new Promise((resolve, reject) => {
            let raw = fs.readFileSync(this.cachePath(filePath));
            return resolve(raw.toString());
        });
    }

    cacheResponse() {
        const cache = this;
        return function (req, res, next) {
            var oldWrite = res.write,
                oldEnd = res.end;
        
            var chunks = [];
            
            res.write = function(chunk) {
                chunks.push(chunk);
            
                oldWrite.apply(res, arguments);
            };
            
            res.end = function(chunk) {
                if (chunk) {
                    chunks.push(chunk);
                }
                var body = Buffer.concat(chunks).toString('utf8');
                if((res.statusCode == 200) && req.method == "GET") {
                    cache.write(body, req.originalUrl).then(res =>{ 
                        console.log(`Successfully cached ${req.originalUrl}`);
                    }).catch(err => {
                        console.error(err);
                    });
                } else {
                    console.log(`Not caching ${req.originalUrl}. Does not follow required params.`);
                }
                oldEnd.apply(res, arguments);
            };
            
            next();
        }
    }
  
    cacheSuccess() {
        return (req, res, next) => {
            if(!this.useCache) {
                return next();
            } else if(!this.exists(req.originalUrl)) {
                this.cacheResponse()(req, res, next);
            } else {
                console.log(`Active cache found for ${req.originalUrl}`);
                if(this.needsFreshCache(req.originalUrl)) {
                    console.log("Fresh Cache needed.");
                    this.cacheResponse()(req, res, next);
                } else {
                    var data = this.loadCache(req.originalUrl);
                    if(!!this.validTypes[this.type]) {
                        res.type(this.validTypes[this.type]);
                    }
                    res.sendFile(this.cachePath(req.originalUrl));
                }
            }
        }
    }

}

module.exports = CacheController;