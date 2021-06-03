const EventEmitter = require("events");
const { type } = require("node:os");
const CurrencyManager = require("../components/currencyManager");
const User = require("../components/user");
const SocketClient = require("../net/webSocket");


class Client extends EventEmitter {
    constructor() {
        super();

        // Initialize Components
        this.currencies = new CurrencyManager();
        this.user = new User();
        this.socket = new SocketClient('wss://stream.binance.com:9443');

        this._processReadyState();
        this.socket.on('packet', this.processPacket);
    }

    /**
     * m = mark, P = price change, c = last price
     * p = diff depth
     */
    subscribe(depth, symbol, cb) {
        for (let stream of typeof depth === "string" ? [depth] : depth) {
            switch(stream) {
                case 'm': case 'P': case 'c':
                    this.socket.subscribe(`${symbol}@ticker`);
                    break;
                case 'p':
                    this.socket.subscribe(`${symbol}@depth`);
                    break;
            }
        }
    }

    processPacket(data) {
        if (data && data.s) {
            this.currencies.get(data.s).processPacket(data);
        }
    }

    _processReadyState() {
        Promise.all([this.currencies, this.user].map((component) => {
            return new Promise((res, rej) => {
                component.on('ready', res);
                component.on('error', rej);
            });
        })).then(() => {
            this.emit('ready');
        }).catch(e => {
            console.error(e);
        });
    }
}


let Binance = new Client();

Binance.on('ready', () => {
    Binance.socket.on('event', () => {});
});

Binance.currencies.get();

module.exports = Client;