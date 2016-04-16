"use strict";
var httpModule = require('http');
var queryString = require('querystring');
var $ = {};
var Promise = (function () {
    function Promise() {
    }
    Promise.prototype.done = function (cb) {
        this._cb = cb;
    };
    Object.defineProperty(Promise.prototype, "callback", {
        get: function () {
            return this._cb;
        },
        enumerable: true,
        configurable: true
    });
    return Promise;
}());
exports.Promise = Promise;
var Deferred = (function () {
    function Deferred() {
        this._promise = new Promise();
    }
    Deferred.prototype.promise = function () {
        return this._promise;
    };
    Deferred.prototype.resolve = function (data) {
        this._promise.callback(data);
    };
    Deferred.LOGIN_SUCCESS = 1;
    return Deferred;
}());
exports.Deferred = Deferred;
;
$.Deferred = function () {
    return new Deferred();
};
global.$ = $;
global.btoa = function (str) {
    var data = NSString.stringWithString(str).dataUsingEncoding(NSUTF8StringEncoding);
    return data.base64EncodedStringWithOptions(0);
};
var JSDOSession = (function () {
    function JSDOSession(settings) {
        this.settings = settings;
        this.deferred = $.Deferred();
    }
    JSDOSession.prototype.login = function (username, password) {
        var uri = "https://www.rollbase.com/rest/api/login?loginName=" + username + "&password=" + password + "&custId=" + this.settings.custId + "&output=json";
        var promise = httpModule.request({
            url: uri,
            headers: { "Content-Type": "application/json" }
        });
        var _this = this;
        promise.then(function (result) {
            var data = JSON.parse(result.content);
            if (data.status === "ok") {
                _this.sessionId = data.sessionId;
                _this.deferred.resolve(data);
            }
        }, function (error) {
            console.error(JSON.stringify(error));
        });
        return this.deferred.promise();
    };
    JSDOSession.prototype.fetch = function (name, filter) {
        /// TODO implement filter.
        if (filter) {
            var selectQuery = "SELECT * from " + name + "  WHERE " + Object.keys(filter).map(function (key) {
                return key + "=" + filter[key];
            }).join(" AND ");
            filter = JSON.stringify({ "sqlQuery": selectQuery });
        }
        else {
            filter = "";
        }
        var record = {
            filter: filter,
            objName: name
        };
        var uri = this.settings.serviceURI + "selectQuery?" + queryString.stringify(record);
        var basic = "Basic " + btoa(ROLLBASE_USER + ":" + ROLLBASE_PASSWORD);
        console.log(basic);
        var promise = httpModule.request({
            url: uri,
            headers: { "Authorization": basic }
        });
        var _this = this;
        promise.then(function (result) {
            var data = JSON.parse(result.content);
            if (data[name] && data[name].length) {
                _this.deferred.resolve(data[name]);
            }
        }, function (error) {
            console.error(JSON.stringify(error));
        });
        return this.deferred.promise();
    };
    return JSDOSession;
}());
exports.JSDOSession = JSDOSession;
//# sourceMappingURL=jsdoSession.js.map