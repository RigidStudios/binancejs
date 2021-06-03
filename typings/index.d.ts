import { EventEmitter } from "events";

declare module 'binancejs' {
    export class Packet {
        constructor(client: Client, data: string);
        public data: Object;
        public process(): boolean;
    }

    export class BinanceSocketPacket extends Packet {
        public eventType: string; // e
        public eventString: number; // E
        public currency?: Currency; // s
        public tradeId?: number; // t || a
        public price?: string; // p
        public quantity?: number; // q
    }

    type ClientOptions = {
        apiKey?: string,
        secret?: string
    }

    export class Base extends EventEmitter {}

    export class BaseSocketPacketProcessor extends Base {
        public processPacket(data: BinanceSocketPacket): void;
    }

    export class User extends Base {

    }

    export class Client extends BaseSocketPacketProcessor {
        constructor(options: ClientOptions);
        public subscribe(depth: string[], symbol: string, fn: VoidFunction): void;
        public subscribe(depth: string, symbol: string, fn: VoidFunction): void;

        public currencies: CurrencyManager;
        public user: User;
    }

    export class CurrencyManager extends Base {
        constructor(Client: Client);
    }

    export class Currency extends BaseSocketPacketProcessor {
        constructor(Client: Client);
    }
}

