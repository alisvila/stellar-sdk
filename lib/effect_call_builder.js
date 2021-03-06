"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var call_builder_1 = require("./call_builder");
var EffectCallBuilder = (function (_super) {
    tslib_1.__extends(EffectCallBuilder, _super);
    function EffectCallBuilder(serverUrl) {
        var _this = _super.call(this, serverUrl) || this;
        _this.url.segment("effects");
        return _this;
    }
    EffectCallBuilder.prototype.forAccount = function (accountId) {
        this.filter.push(["accounts", accountId, "effects"]);
        return this;
    };
    EffectCallBuilder.prototype.forLedger = function (sequence) {
        this.filter.push([
            "ledgers",
            typeof sequence === "number" ? sequence.toString() : sequence,
            "effects",
        ]);
        return this;
    };
    EffectCallBuilder.prototype.forTransaction = function (transactionId) {
        this.filter.push(["transactions", transactionId, "effects"]);
        return this;
    };
    EffectCallBuilder.prototype.forOperation = function (operationId) {
        this.filter.push(["operations", operationId, "effects"]);
        return this;
    };
    return EffectCallBuilder;
}(call_builder_1.CallBuilder));
exports.EffectCallBuilder = EffectCallBuilder;
//# sourceMappingURL=effect_call_builder.js.map