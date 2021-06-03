const EventEmitter = require("events");
const Orderbook = require("./orderbook");

class Currency extends EventEmitter {
    constructor(Client, symbol) {
        super();

        this.client = Client;
        this._symbol = symbol;

        this.orderbook = new Orderbook(Client, symbol);
    }

    subscribe({ depth }) {
        this.client.subscribe({ depth, symbol: this._symbol});
    }

    processPacket(data) {

    }
}

module.exports = Currency;