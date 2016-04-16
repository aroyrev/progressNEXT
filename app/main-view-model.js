"use strict";
var observableModule = require("data/observable");
var jsdoSessionModule = require('./jsdoSession');
var observable_array_1 = require("data/observable-array");
var MainViewModel = (function (_super) {
    __extends(MainViewModel, _super);
    function MainViewModel() {
        _super.call(this);
    }
    Object.defineProperty(MainViewModel.prototype, "dataItems", {
        get: function () {
            var _this = this;
            if (!this._items) {
                this._items = new observable_array_1.ObservableArray();
            }
            var jsdoSettings = {
                serviceURI: "https://www.rollbase.com/rest/jsdo/",
                authenticationModel: 'basic',
                custId: CUSTOMER_ID
            };
            var jsdoSession = new jsdoSessionModule.JSDOSession(jsdoSettings);
            var promise = jsdoSession.fetch("Session5");
            promise.done(function (data) {
                for (var i = 0; i < data.length; i++) {
                    _this._items.push(new DataItem(data[i].Title, data[i].Description, data[i].R168422082));
                }
            });
            return this._items;
        },
        enumerable: true,
        configurable: true
    });
    return MainViewModel;
}(observableModule.Observable));
exports.MainViewModel = MainViewModel;
var DataItem = (function () {
    function DataItem(title, description, speaker) {
        this.title = title;
        this.description = description;
        this.speaker = speaker;
    }
    return DataItem;
}());
exports.DataItem = DataItem;
exports.mainViewModel = new MainViewModel();
//# sourceMappingURL=main-view-model.js.map