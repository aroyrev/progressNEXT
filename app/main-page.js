"use strict";
var viewModelModule = require("./main-view-model");
var frameModule = require('ui/frame');
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
        var uri = this.settings.serviceURI + "login?loginName=" + username + "&password=" + password + "&custId=" + this.settings.custId + "&output=json";
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
    JSDOSession.prototype.fetch = function (name, options) {
        var items = options.schema.model.fields;
        var values = Object.keys(items).map(function (key) {
            return items[key].field;
        });
        var selectQuery = "SELECT " + values.join(",") + " FROM " + name;
        var filter = JSON.stringify({ "sqlQuery": selectQuery });
        var record = {
            query: selectQuery,
            sessionId: this.sessionId,
            output: 'json'
        };
        var uri = this.settings.serviceURI + "selectQuery?" + queryString.stringify(record);
        var promise = httpModule.request({
            url: uri,
        });
        var _this = this;
        promise.then(function (result) {
            var data = JSON.parse(result.content);
            console.log(JSON.stringify(result));
        }, function (error) {
            console.error(JSON.stringify(error));
        });
    };
    return JSDOSession;
}());
exports.JSDOSession = JSDOSession;
function pageLoaded(args) {
    var page = args.object;
    var jsdoSettings = {
        serviceURI: "https://www.rollbase.com/rest/api/",
        authenticationModel: 'basic',
        custId: CUSTOMER_ID
    };
    var jsdoSession = new JSDOSession(jsdoSettings);
    var promise = jsdoSession.login(ROLLBASE_USER, ROLLBASE_PASSWORD);
    promise.done(function (data) {
        promise = jsdoSession.fetch("Session5", {
            schema: {
                model: {
                    fields: {
                        'Title': {
                            field: 'Title',
                            defaultValue: ''
                        },
                        'Room': {
                            field: 'Room',
                            defaultValue: ''
                        },
                        'Start': {
                            field: 'Start_Time',
                            defaultValue: ''
                        },
                        'End': {
                            field: 'End_Time',
                            defaultValue: ''
                        },
                        'Speaker': {
                            field: 'R168422082',
                            defaultValue: ''
                        },
                        "Description": {
                            field: 'Description',
                            defaultValue: ''
                        }
                    }
                }
            }
        });
    });
    if (page.ios) {
        var controller = frameModule.topmost().ios.controller;
        frameModule.topmost().ios.navBarVisibility = "none";
        page.ios.title = "Progress NEXT";
        var navigationBar = controller.navigationBar;
        navigationBar.barTintColor = UIColor.colorWithRedGreenBlueAlpha(53 / 255, 205 / 255, 21 / 255, 1);
        navigationBar.titleTextAttributes = new NSDictionary([UIColor.whiteColor()], [NSForegroundColorAttributeName]);
        navigationBar.barStyle = 1;
        controller.navigationBarHidden = false;
    }
    page.bindingContext = new viewModelModule.MainViewModel();
}
exports.pageLoaded = pageLoaded;
//# sourceMappingURL=main-page.js.map