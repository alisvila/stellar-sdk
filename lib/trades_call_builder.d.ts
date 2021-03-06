/// <reference types="urijs" />
import { Asset } from "stellar-base";
import { CallBuilder } from "./call_builder";
import { ServerApi } from "./server_api";
export declare class TradesCallBuilder extends CallBuilder<ServerApi.CollectionPage<ServerApi.TradeRecord>> {
    constructor(serverUrl: uri.URI);
    forAssetPair(base: Asset, counter: Asset): this;
    forOffer(offerId: string): this;
    forAccount(accountId: string): this;
}
