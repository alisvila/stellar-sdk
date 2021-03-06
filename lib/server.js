"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
var isEmpty_1 = tslib_1.__importDefault(require("lodash/isEmpty"));
var merge_1 = tslib_1.__importDefault(require("lodash/merge"));
var stellar_base_1 = require("stellar-base");
var urijs_1 = tslib_1.__importDefault(require("urijs"));
var call_builder_1 = require("./call_builder");
var config_1 = require("./config");
var errors_1 = require("./errors");
var account_call_builder_1 = require("./account_call_builder");
var account_response_1 = require("./account_response");
var assets_call_builder_1 = require("./assets_call_builder");
var effect_call_builder_1 = require("./effect_call_builder");
var friendbot_builder_1 = require("./friendbot_builder");
var ledger_call_builder_1 = require("./ledger_call_builder");
var offer_call_builder_1 = require("./offer_call_builder");
var operation_call_builder_1 = require("./operation_call_builder");
var orderbook_call_builder_1 = require("./orderbook_call_builder");
var path_call_builder_1 = require("./path_call_builder");
var payment_call_builder_1 = require("./payment_call_builder");
var strict_receive_path_call_builder_1 = require("./strict_receive_path_call_builder");
var strict_send_path_call_builder_1 = require("./strict_send_path_call_builder");
var trade_aggregation_call_builder_1 = require("./trade_aggregation_call_builder");
var trades_call_builder_1 = require("./trades_call_builder");
var transaction_call_builder_1 = require("./transaction_call_builder");
var horizon_axios_client_1 = tslib_1.__importStar(require("./horizon_axios_client"));
exports.SUBMIT_TRANSACTION_TIMEOUT = 60 * 1000;
var STROOPS_IN_LUMEN = 10000000;
function _getAmountInLumens(amt) {
    return new bignumber_js_1.default(amt).div(STROOPS_IN_LUMEN).toString();
}
var Server = (function () {
    function Server(serverURL, opts) {
        if (opts === void 0) { opts = {}; }
        this.serverURL = urijs_1.default(serverURL);
        var allowHttp = typeof opts.allowHttp === "undefined"
            ? config_1.Config.isAllowHttp()
            : opts.allowHttp;
        var customHeaders = {};
        if (opts.appName) {
            customHeaders["X-App-Name"] = opts.appName;
        }
        if (opts.appVersion) {
            customHeaders["X-App-Version"] = opts.appVersion;
        }
        if (!isEmpty_1.default(customHeaders)) {
            horizon_axios_client_1.default.interceptors.request.use(function (config) {
                config.headers = merge_1.default(customHeaders, config.headers);
                return config;
            });
        }
        if (this.serverURL.protocol() !== "https" && !allowHttp) {
            throw new Error("Cannot connect to insecure horizon server");
        }
    }
    Server.prototype.fetchTimebounds = function (seconds, _isRetry) {
        if (_isRetry === void 0) { _isRetry = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var currentTime;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentTime = horizon_axios_client_1.getCurrentServerTime(this.serverURL.hostname());
                        if (currentTime) {
                            return [2, {
                                    minTime: 0,
                                    maxTime: currentTime + seconds,
                                }];
                        }
                        if (_isRetry) {
                            return [2, {
                                    minTime: 0,
                                    maxTime: Math.floor(new Date().getTime() / 1000) + seconds,
                                }];
                        }
                        return [4, horizon_axios_client_1.default.get(urijs_1.default(this.serverURL).toString())];
                    case 1:
                        _a.sent();
                        return [4, this.fetchTimebounds(seconds, true)];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    };
    Server.prototype.fetchBaseFee = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var response;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.feeStats()];
                    case 1:
                        response = _a.sent();
                        return [2, parseInt(response.last_ledger_base_fee, 10) || 100];
                }
            });
        });
    };
    Server.prototype.feeStats = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var cb;
            return tslib_1.__generator(this, function (_a) {
                cb = new call_builder_1.CallBuilder(urijs_1.default(this.serverURL));
                cb.filter.push(["fee_stats"]);
                return [2, cb.call()];
            });
        });
    };
    Server.prototype.submitTransaction = function (transaction) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var tx;
            return tslib_1.__generator(this, function (_a) {
                tx = encodeURIComponent(transaction
                    .toEnvelope()
                    .toXDR()
                    .toString("base64"));
                return [2, horizon_axios_client_1.default.post(urijs_1.default(this.serverURL)
                        .segment("transactions")
                        .toString(), "tx=" + tx, { timeout: exports.SUBMIT_TRANSACTION_TIMEOUT })
                        .then(function (response) {
                        if (!response.data.result_xdr) {
                            return response.data;
                        }
                        var responseXDR = stellar_base_1.xdr.TransactionResult
                            .fromXDR(response.data.result_xdr, "base64");
                        var results = responseXDR.result().value();
                        var offerResults;
                        var hasManageOffer;
                        if (results.length) {
                            offerResults = results
                                .map(function (result, i) {
                                if (result.value().switch().name !== "manageBuyOffer" &&
                                    result.value().switch().name !== "manageSellOffer") {
                                    return null;
                                }
                                hasManageOffer = true;
                                var amountBought = new bignumber_js_1.default(0);
                                var amountSold = new bignumber_js_1.default(0);
                                var offerSuccess = result
                                    .value()
                                    .value()
                                    .success();
                                var offersClaimed = offerSuccess
                                    .offersClaimed()
                                    .map(function (offerClaimed) {
                                    var claimedOfferAmountBought = new bignumber_js_1.default(offerClaimed.amountBought().toString());
                                    var claimedOfferAmountSold = new bignumber_js_1.default(offerClaimed.amountSold().toString());
                                    amountBought = amountBought.add(claimedOfferAmountSold);
                                    amountSold = amountSold.add(claimedOfferAmountBought);
                                    var sold = stellar_base_1.Asset.fromOperation(offerClaimed.assetSold());
                                    var bought = stellar_base_1.Asset.fromOperation(offerClaimed.assetBought());
                                    var assetSold = {
                                        type: sold.getAssetType(),
                                        assetCode: sold.getCode(),
                                        issuer: sold.getIssuer(),
                                    };
                                    var assetBought = {
                                        type: bought.getAssetType(),
                                        assetCode: bought.getCode(),
                                        issuer: bought.getIssuer(),
                                    };
                                    return {
                                        sellerId: stellar_base_1.StrKey.encodeEd25519PublicKey(offerClaimed.sellerId().ed25519()),
                                        offerId: offerClaimed.offerId().toString(),
                                        assetSold: assetSold,
                                        amountSold: _getAmountInLumens(claimedOfferAmountSold),
                                        assetBought: assetBought,
                                        amountBought: _getAmountInLumens(claimedOfferAmountBought),
                                    };
                                });
                                var effect = offerSuccess.offer().switch().name;
                                var currentOffer;
                                if (typeof offerSuccess.offer().value === "function" &&
                                    offerSuccess.offer().value()) {
                                    var offerXDR = offerSuccess.offer().value();
                                    currentOffer = {
                                        offerId: offerXDR.offerId().toString(),
                                        selling: {},
                                        buying: {},
                                        amount: _getAmountInLumens(offerXDR.amount().toString()),
                                        price: {
                                            n: offerXDR.price().n(),
                                            d: offerXDR.price().d(),
                                        },
                                    };
                                    var selling = stellar_base_1.Asset.fromOperation(offerXDR.selling());
                                    currentOffer.selling = {
                                        type: selling.getAssetType(),
                                        assetCode: selling.getCode(),
                                        issuer: selling.getIssuer(),
                                    };
                                    var buying = stellar_base_1.Asset.fromOperation(offerXDR.buying());
                                    currentOffer.buying = {
                                        type: buying.getAssetType(),
                                        assetCode: buying.getCode(),
                                        issuer: buying.getIssuer(),
                                    };
                                }
                                return {
                                    offersClaimed: offersClaimed,
                                    effect: effect,
                                    operationIndex: i,
                                    currentOffer: currentOffer,
                                    amountBought: _getAmountInLumens(amountBought),
                                    amountSold: _getAmountInLumens(amountSold),
                                    isFullyOpen: !offersClaimed.length && effect !== "manageOfferDeleted",
                                    wasPartiallyFilled: !!offersClaimed.length && effect !== "manageOfferDeleted",
                                    wasImmediatelyFilled: !!offersClaimed.length && effect === "manageOfferDeleted",
                                    wasImmediatelyDeleted: !offersClaimed.length && effect === "manageOfferDeleted",
                                };
                            })
                                .filter(function (result) { return !!result; });
                        }
                        return Object.assign({}, response.data, {
                            offerResults: hasManageOffer ? offerResults : undefined,
                        });
                    })
                        .catch(function (response) {
                        if (response instanceof Error) {
                            return Promise.reject(response);
                        }
                        return Promise.reject(new errors_1.BadResponseError("Transaction submission failed. Server responded: " + response.status + " " + response.statusText, response.data));
                    })];
            });
        });
    };
    Server.prototype.accounts = function () {
        return new account_call_builder_1.AccountCallBuilder(urijs_1.default(this.serverURL));
    };
    Server.prototype.ledgers = function () {
        return new ledger_call_builder_1.LedgerCallBuilder(urijs_1.default(this.serverURL));
    };
    Server.prototype.transactions = function () {
        return new transaction_call_builder_1.TransactionCallBuilder(urijs_1.default(this.serverURL));
    };
    Server.prototype.offers = function (resource) {
        var resourceParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            resourceParams[_i - 1] = arguments[_i];
        }
        return new (offer_call_builder_1.OfferCallBuilder.bind.apply(offer_call_builder_1.OfferCallBuilder, tslib_1.__spreadArrays([void 0, urijs_1.default(this.serverURL),
            resource], resourceParams)))();
    };
    Server.prototype.orderbook = function (selling, buying) {
        return new orderbook_call_builder_1.OrderbookCallBuilder(urijs_1.default(this.serverURL), selling, buying);
    };
    Server.prototype.trades = function () {
        return new trades_call_builder_1.TradesCallBuilder(urijs_1.default(this.serverURL));
    };
    Server.prototype.operations = function () {
        return new operation_call_builder_1.OperationCallBuilder(urijs_1.default(this.serverURL));
    };
    Server.prototype.paths = function (source, destination, destinationAsset, destinationAmount) {
        console.warn("`Server#paths` is deprecated. Please use `Server#strictReceivePaths`.");
        return new path_call_builder_1.PathCallBuilder(urijs_1.default(this.serverURL), source, destination, destinationAsset, destinationAmount);
    };
    Server.prototype.strictReceivePaths = function (source, destinationAsset, destinationAmount) {
        return new strict_receive_path_call_builder_1.StrictReceivePathCallBuilder(urijs_1.default(this.serverURL), source, destinationAsset, destinationAmount);
    };
    Server.prototype.strictSendPaths = function (sourceAsset, sourceAmount, destination) {
        return new strict_send_path_call_builder_1.StrictSendPathCallBuilder(urijs_1.default(this.serverURL), sourceAsset, sourceAmount, destination);
    };
    Server.prototype.payments = function () {
        return new payment_call_builder_1.PaymentCallBuilder(urijs_1.default(this.serverURL));
    };
    Server.prototype.effects = function () {
        return new effect_call_builder_1.EffectCallBuilder(urijs_1.default(this.serverURL));
    };
    Server.prototype.friendbot = function (address) {
        return new friendbot_builder_1.FriendbotBuilder(urijs_1.default(this.serverURL), address);
    };
    Server.prototype.assets = function () {
        return new assets_call_builder_1.AssetsCallBuilder(urijs_1.default(this.serverURL));
    };
    Server.prototype.loadAccount = function (accountId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var res;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.accounts()
                            .accountId(accountId)
                            .call()];
                    case 1:
                        res = _a.sent();
                        return [2, new account_response_1.AccountResponse(res)];
                }
            });
        });
    };
    Server.prototype.tradeAggregation = function (base, counter, start_time, end_time, resolution, offset) {
        return new trade_aggregation_call_builder_1.TradeAggregationCallBuilder(urijs_1.default(this.serverURL), base, counter, start_time, end_time, resolution, offset);
    };
    return Server;
}());
exports.Server = Server;
//# sourceMappingURL=server.js.map