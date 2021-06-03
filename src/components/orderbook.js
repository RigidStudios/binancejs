const EventEmitter = require("events");

class Orderbook extends EventEmitter {
    constructor(client, symbol) {
        super();

        this.orderbook = {};
    }

    toObject() {

    }

    update(data) {

    }

    // TODO: Not assume depthUpdate
    processPacket(data) {
        switch(data.e) {
            case 'depthUpdate':
                this
        }
    }
}

module.exports = Orderbook;