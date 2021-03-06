"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var forIn_1 = tslib_1.__importDefault(require("lodash/forIn"));
var stellar_base_1 = require("stellar-base");
var AccountResponse = (function () {
    function AccountResponse(response) {
        var _this = this;
        this._baseAccount = new stellar_base_1.Account(response.account_id, response.sequence);
        forIn_1.default(response, function (value, key) {
            _this[key] = value;
        });
    }
    AccountResponse.prototype.accountId = function () {
        return this._baseAccount.accountId();
    };
    AccountResponse.prototype.sequenceNumber = function () {
        return this._baseAccount.sequenceNumber();
    };
    AccountResponse.prototype.incrementSequenceNumber = function () {
        this._baseAccount.incrementSequenceNumber();
        this.sequence = this._baseAccount.sequenceNumber();
    };
    return AccountResponse;
}());
exports.AccountResponse = AccountResponse;
//# sourceMappingURL=account_response.js.map