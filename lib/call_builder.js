"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var detect_node_1 = tslib_1.__importDefault(require("detect-node"));
var urijs_1 = tslib_1.__importDefault(require("urijs"));
var URITemplate_1 = tslib_1.__importDefault(require("urijs/src/URITemplate"));
var errors_1 = require("./errors");
var horizon_axios_client_1 = tslib_1.__importDefault(require("./horizon_axios_client"));
var version = require("../package.json").version;
var JOINABLE = ["transaction"];
var EventSource;
var anyGlobal = global;
if (anyGlobal.EventSource) {
    EventSource = anyGlobal.EventSource;
}
else if (detect_node_1.default) {
    EventSource = require("eventsource");
}
else {
    EventSource = anyGlobal.window.EventSource;
}
var CallBuilder = (function () {
    function CallBuilder(serverUrl) {
        this.url = serverUrl;
        this.filter = [];
        this.originalSegments = this.url.segment() || [];
    }
    CallBuilder.prototype.call = function () {
        var _this = this;
        this.checkFilter();
        return this._sendNormalRequest(this.url).then(function (r) {
            return _this._parseResponse(r);
        });
    };
    CallBuilder.prototype.stream = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this.checkFilter();
        this.url.setQuery("X-Client-Name", "js-stellar-sdk");
        this.url.setQuery("X-Client-Version", version);
        var es;
        var timeout;
        var createTimeout = function () {
            timeout = setTimeout(function () {
                if (es) {
                    es.close();
                }
                es = createEventSource();
            }, options.reconnectTimeout || 15 * 1000);
        };
        var createEventSource = function () {
            try {
                es = new EventSource(_this.url.toString());
            }
            catch (err) {
                if (options.onerror) {
                    options.onerror(err);
                }
            }
            createTimeout();
            if (es) {
                var onMessage = function (message) {
                    var result = message.data
                        ? _this._parseRecord(JSON.parse(message.data))
                        : message;
                    if (result.paging_token) {
                        _this.url.setQuery("cursor", result.paging_token);
                    }
                    clearTimeout(timeout);
                    createTimeout();
                    if (typeof options.onmessage !== "undefined") {
                        options.onmessage(result);
                    }
                };
                var onError = function (error) {
                    if (options.onerror) {
                        options.onerror(error);
                    }
                };
                if (es.addEventListener) {
                    es.addEventListener("message", onMessage.bind(_this));
                    es.addEventListener("error", onError.bind(_this));
                }
                else {
                    es.onmessage = onMessage.bind(_this);
                    es.onerror = onError.bind(_this);
                }
            }
            return es;
        };
        createEventSource();
        return function close() {
            clearTimeout(timeout);
            if (es) {
                es.close();
            }
        };
    };
    CallBuilder.prototype.cursor = function (cursor) {
        this.url.setQuery("cursor", cursor);
        return this;
    };
    CallBuilder.prototype.limit = function (recordsNumber) {
        this.url.setQuery("limit", recordsNumber.toString());
        return this;
    };
    CallBuilder.prototype.order = function (direction) {
        this.url.setQuery("order", direction);
        return this;
    };
    CallBuilder.prototype.join = function (include) {
        this.url.setQuery("join", include);
        return this;
    };
    CallBuilder.prototype.checkFilter = function () {
        if (this.filter.length >= 2) {
            throw new errors_1.BadRequestError("Too many filters specified", this.filter);
        }
        if (this.filter.length === 1) {
            var newSegment = this.originalSegments.concat(this.filter[0]);
            this.url.segment(newSegment);
        }
    };
    CallBuilder.prototype._requestFnForLink = function (link) {
        var _this = this;
        return function (opts) {
            if (opts === void 0) { opts = {}; }
            return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var uri, template, r;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (link.templated) {
                                template = URITemplate_1.default(link.href);
                                uri = urijs_1.default(template.expand(opts));
                            }
                            else {
                                uri = urijs_1.default(link.href);
                            }
                            return [4, this._sendNormalRequest(uri)];
                        case 1:
                            r = _a.sent();
                            return [2, this._parseResponse(r)];
                    }
                });
            });
        };
    };
    CallBuilder.prototype._parseRecord = function (json) {
        var _this = this;
        if (!json._links) {
            return json;
        }
        var _loop_1 = function (key) {
            var n = json._links[key];
            var included = false;
            if (typeof json[key] !== "undefined") {
                json[key + "_attr"] = json[key];
                included = true;
            }
            if (included && JOINABLE.indexOf(key) >= 0) {
                var record_1 = this_1._parseRecord(json[key]);
                json[key] = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                    return [2, record_1];
                }); }); };
            }
            else {
                json[key] = this_1._requestFnForLink(n);
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = Object.keys(json._links); _i < _a.length; _i++) {
            var key = _a[_i];
            _loop_1(key);
        }
        return json;
    };
    CallBuilder.prototype._sendNormalRequest = function (initialUrl) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url;
            return tslib_1.__generator(this, function (_a) {
                url = initialUrl;
                if (url.authority() === "") {
                    url = url.authority(this.url.authority());
                }
                if (url.protocol() === "") {
                    url = url.protocol(this.url.protocol());
                }
                url.setQuery("c", String(Math.random()));
                return [2, horizon_axios_client_1.default.get(url.toString())
                        .then(function (response) { return response.data; })
                        .catch(this._handleNetworkError)];
            });
        });
    };
    CallBuilder.prototype._parseResponse = function (json) {
        if (json._embedded && json._embedded.records) {
            return this._toCollectionPage(json);
        }
        return this._parseRecord(json);
    };
    CallBuilder.prototype._toCollectionPage = function (json) {
        var _this = this;
        for (var i = 0; i < json._embedded.records.length; i += 1) {
            json._embedded.records[i] = this._parseRecord(json._embedded.records[i]);
        }
        return {
            records: json._embedded.records,
            next: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var r;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this._sendNormalRequest(urijs_1.default(json._links.next.href))];
                        case 1:
                            r = _a.sent();
                            return [2, this._toCollectionPage(r)];
                    }
                });
            }); },
            prev: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var r;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this._sendNormalRequest(urijs_1.default(json._links.prev.href))];
                        case 1:
                            r = _a.sent();
                            return [2, this._toCollectionPage(r)];
                    }
                });
            }); },
        };
    };
    CallBuilder.prototype._handleNetworkError = function (error) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                if (error.response && error.response.status && error.response.statusText) {
                    switch (error.response.status) {
                        case 404:
                            return [2, Promise.reject(new errors_1.NotFoundError(error.response.statusText, error.response.data))];
                        default:
                            return [2, Promise.reject(new errors_1.NetworkError(error.response.statusText, error.response.data))];
                    }
                }
                else {
                    return [2, Promise.reject(new Error(error.message))];
                }
                return [2];
            });
        });
    };
    return CallBuilder;
}());
exports.CallBuilder = CallBuilder;
//# sourceMappingURL=call_builder.js.map