const http = require('https');
const axios = require('axios').default;
const privateStorage = require('../../../private.json');

axios.defaults.headers.post['X-MBX-APIKEY'] = privateStorage.APIKEY;

module.exports = class HttpClient {
    /**
     * @description Creates a GET 
     * @param {String} url 
     * @param {Object} query 
     * @returns {Promise<Object>}
     */
    static get(url, query) {
        return new Promise((resolve, reject) => {
            http.get(url + this.parseQuery(query), (res) => {
                let unconstructedData = "";
                let { statusCode } = res;

                if (!(statusCode >= 200 && statusCode < 300)) {
                    console.log("wtfoopsiedoopsie");
                }

                res.on('data', (chunk) => {
                    unconstructedData += chunk;
                });

                res.on('end', () => {
                    resolve(JSON.parse(unconstructedData));
                });
            }).on('error', (e) => {
                reject(e);
            });
        });
    }

    static parseQuery(query) {
        if (!query) return "";
        let q = "?";
    
        for (let x of Object.keys(query)) {
            q += x + "=" + query[x] + "&";
        }
    
        return q.replace(/\&$/, '');
    }

    static requestWebsocket(url, onopen, cb) {
        let WS = new WebSocket(url);

        WS.onopen = onopen;
        WS.onmessage = cb;

        return WS;
    }

    static post(url, body) {
        /** @type {URL} */
        let pUrl = new URL(url);

        return new Promise((resolve, reject) => {
            axios
                .post(url, body).then(data => {
                    resolve(data.data);
                })
                .catch(reject);
        })

        return new Promise((resolve, reject) => {
            let req = http.request({
                host: "proxy",
                port: 8080,
                path: url,
                method: 'POST',
                headers: {
                    'X-MBX-APIKEY': privateStorage.APIKEY,
                    'Host': pUrl.hostname
                }
            }, (res) => {
                let unconstructedData = "";
                let { statusCode } = res;

                if (!(statusCode >= 200 && statusCode < 300)) {
                    console.log("wtfoopsiedoopsie");
                }

                res.on('data', (chunk) => {
                    unconstructedData += chunk;
                });

                res.on('end', () => {
                    resolve(JSON.parse(unconstructedData));
                });
            })
            
            req.on('error', (e) => {
                reject(e);
            });

            req.write(JSON.stringify(body));

            req.end();
        });
    }

    static put(url, body) {
        /** @type {URL} */
        let pUrl = new URL(url);

        return new Promise((resolve, reject) => {
            let req = http.request({
                hostname: pUrl.hostname,
                port: 8080,
                path: pUrl.pathname,
                method: 'PUT',
                headers: {
                    'X-MBX-APIKEY': privateStorage.APIKEY,
                }
            }, (res) => {
                let unconstructedData = "";
                let { statusCode } = res;

                if (!(statusCode >= 200 && statusCode < 300)) {
                    console.log("wtfoopsiedoopsie");
                }

                res.on('data', (chunk) => {
                    unconstructedData += chunk;
                });

                res.on('end', () => {
                    resolve(JSON.parse(unconstructedData));
                });
            }).on('error', (e) => {
                reject(e);
            });

            req.write(JSON.stringify(body));

            req.end();
        });
    }
}
