"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var call_builder_1 = require("./call_builder");
var PaymentCallBuilder = (function (_super) {
    tslib_1.__extends(PaymentCallBuilder, _super);
    function PaymentCallBuilder(serverUrl) {
        var _this = _super.call(this, serverUrl) || this;
        _this.url.segment("payments");
        return _this;
    }
    PaymentCallBuilder.prototype.forAccount = function (accountId) {
        this.filter.push(["accounts", accountId, "payments"]);
        return this;
    };
    PaymentCallBuilder.prototype.forLedger = function (sequence) {
        this.filter.push([
            "ledgers",
            typeof sequence === "number" ? sequence.toString() : sequence,
            "payments",
        ]);
        return this;
    };
    PaymentCallBuilder.prototype.forTransaction = function (transactionId) {
        this.filter.push(["transactions", transactionId, "payments"]);
        return this;
    };
    return PaymentCallBuilder;
}(call_builder_1.CallBuilder));
exports.PaymentCallBuilder = PaymentCallBuilder;
//# sourceMappingURL=payment_call_builder.js.map