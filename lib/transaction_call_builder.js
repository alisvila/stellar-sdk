"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var call_builder_1 = require("./call_builder");
var TransactionCallBuilder = (function (_super) {
    tslib_1.__extends(TransactionCallBuilder, _super);
    function TransactionCallBuilder(serverUrl) {
        var _this = _super.call(this, serverUrl) || this;
        _this.url.segment("transactions");
        return _this;
    }
    TransactionCallBuilder.prototype.transaction = function (transactionId) {
        this.filter.push(["transactions", transactionId]);
        return this;
    };
    TransactionCallBuilder.prototype.forAccount = function (accountId) {
        this.filter.push(["accounts", accountId, "transactions"]);
        return this;
    };
    TransactionCallBuilder.prototype.forLedger = function (sequence) {
        var ledgerSequence = typeof sequence === "number" ? sequence.toString() : sequence;
        this.filter.push(["ledgers", ledgerSequence, "transactions"]);
        return this;
    };
    TransactionCallBuilder.prototype.includeFailed = function (value) {
        this.url.setQuery("include_failed", value.toString());
        return this;
    };
    return TransactionCallBuilder;
}(call_builder_1.CallBuilder));
exports.TransactionCallBuilder = TransactionCallBuilder;
//# sourceMappingURL=transaction_call_builder.js.map