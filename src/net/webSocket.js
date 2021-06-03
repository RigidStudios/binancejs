const EventEmitter = require('events');
const WebSocket = require('ws');
const HttpClient = require('./httpClient');

let grandBase = 'wss://stream.binance.com:9443';

class SocketClient extends EventEmitter {
    constructor(baseUrl) {
        super();

        this.baseUrl = baseUrl || grandBase;
        this._handlers = new Map();
        this._subscriptionIndex = 1;

        process.on('SIGINT', () => {
            this.close();
            process.exit();
        });

        this.getUserDataStream().then(() => {
            this._createSocket();
        })

        setInterval(() => {
            this.renewListenKey();
        }, 2400000)
    }

    _createSocket() {
        this._ws = new WebSocket(this.baseUrl + this._listenKey);
        this._configureSocketDefaults();
    }

    _configureSocketDefaults() {
        this._ws.onopen = () => {
            console.log("WebSocket Opened successfully.");
            this.emit('ready');
        };

        this._ws.onerror = (err) => {
            console.log("WebSocket Encountered error, sending following:");
            console.log(err);
            this.emit('error');
            this.close();
        };
        
        this._ws.onmessage = (msg) => {
            this._handleMessage(msg); // necessary because of 'this' re-distribution.
        };

        this._ws.on('pong', () => {
            console.log("Received PONG-like response from WebSocket");
        });

        this._ws.on('ping', () => {
            console.log("Received PING-like message from WebSocket, replying now.");
            this._ws.pong();
        })
    }

    _handleMessage(msg) {
        try {
            // @ts-ignore
            let processed = JSON.parse(msg.data);
            if (processed.e) {
                if (this._handlers.has(processed.e)) {
                    this._handlers.get(processed.e).forEach(callback => {
                        try {
                            callback(processed);
                        } catch (e) {console.error(e)};
                    });
                }
            }
        } catch (e) {console.error(e)};
    }

    subscribe(streams) {
        this._ws.send(JSON.stringify({
            method: "SUBSCRIBE",
            params: typeof streams == 'string' ? [streams] : streams,
            id: this._subscriptionIndex++,
        }))
    }

    addHandler(method, callback) {
        if (!this._handlers.has(method)) {
            this._handlers.set(method, []);
        }
        this._handlers.get(method).push(callback);
    }

    getUserDataStream() {
        return HttpClient.post('https://api.binance.com/api/v3/userDataStream').then((data) => {
            this._listenKey = data.data;
            return data;
        });
    }

    renewListenKey() {
        // TODO
    }

    close() {
        this._ws.close();
    }
}

module.exports = SocketClient;