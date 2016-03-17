"use strict";
var viewModelModule = require("./main-view-model");
var frameModule = require('ui/frame');
var progressModule = require('progress-jsdo');
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
var Deferred = (function () {
    function Deferred() {
        this._promise = new Promise();
    }
    Deferred.prototype.promise = function () {
        return this._promise;
    };
    Deferred.prototype.resolve = function (session, result, info) {
        this._promise.callback({ loginResult: result, errorObject: info.errorObject });
    };
    Deferred.LOGIN_SUCCESS = 1;
    return Deferred;
}());
;
$.Deferred = function () {
    return new Deferred();
};
global.$ = $;
global.btoa = function (str) {
    var data = NSString.stringWithString(str).dataUsingEncoding(NSUTF8StringEncoding);
    return data.base64EncodedStringWithOptions(0);
};
function pageLoaded(args) {
    var page = args.object;
    var jsdoSettings = {
        serviceURI: 'https://www.rollbase.com/rest/jsdo/',
        catalogURIs: 'https://www.rollbase.com/rest/jsdo/catalog/allobjects.json',
        authenticationModel: 'basic'
    };
    var progress = progressModule.progress;
    var jsdoSession = new progress.data.JSDOSession(jsdoSettings);
    jsdoSession.login(ROLLBASE_USER, ROLLBASE_PASSWORD).done(function (data) {
        if (data.loginResult == 1) {
            console.log("Success");
        }
        else {
            console.log(data.errorObject.message);
        }
        // console.log(result.xhr.response);
    });
    // promise.fail(function(e){
    //     console.log(e);
    // });
    if (page.ios) {
        var controller = frameModule.topmost().ios.controller;
        // show the navbar
        frameModule.topmost().ios.navBarVisibility = "always";
        // set the title
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