const EventEmitter = require("events");
const Currency = require("./currency");

class CurrencyManager extends EventEmitter {
    constructor(client) {
        super();

        this.client = client;

        this._cached = {};
        this._active = {};

        this.get("BTC").subscribe({ depth: ['m'] });
    }

    get(symbol) {
        return new Currency(this.client, symbol);
    }
}

module.exports = CurrencyManager