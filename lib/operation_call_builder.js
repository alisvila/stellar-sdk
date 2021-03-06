"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var call_builder_1 = require("./call_builder");
var OperationCallBuilder = (function (_super) {
    tslib_1.__extends(OperationCallBuilder, _super);
    function OperationCallBuilder(serverUrl) {
        var _this = _super.call(this, serverUrl) || this;
        _this.url.segment("operations");
        return _this;
    }
    OperationCallBuilder.prototype.operation = function (operationId) {
        this.filter.push(["operations", operationId]);
        return this;
    };
    OperationCallBuilder.prototype.forAccount = function (accountId) {
        this.filter.push(["accounts", accountId, "operations"]);
        return this;
    };
    OperationCallBuilder.prototype.forLedger = function (sequence) {
        this.filter.push([
            "ledgers",
            typeof sequence === "number" ? sequence.toString() : sequence,
            "operations",
        ]);
        return this;
    };
    OperationCallBuilder.prototype.forTransaction = function (transactionId) {
        this.filter.push(["transactions", transactionId, "operations"]);
        return this;
    };
    OperationCallBuilder.prototype.includeFailed = function (value) {
        this.url.setQuery("include_failed", value.toString());
        return this;
    };
    return OperationCallBuilder;
}(call_builder_1.CallBuilder));
exports.OperationCallBuilder = OperationCallBuilder;
//# sourceMappingURL=operation_call_builder.js.map