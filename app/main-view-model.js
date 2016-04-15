"use strict";
var observableModule = require("data/observable");
var jsdoSessionModule = require('./jsdoSession');
var observable_array_1 = require("data/observable-array");
var MainViewModel = (function (_super) {
    __extends(MainViewModel, _super);
    function MainViewModel() {
        _super.call(this);
        this.set("mainContentText", "SideDrawer for NativeScript can be easily setup in the XML definition of your page by defining main- and drawer-content. The component"
            + " has a default transition and position and also exposes notifications related to changes in its state.");
    }
    Object.defineProperty(MainViewModel.prototype, "dataItems", {
        get: function () {
            var _this = this;
            if (!this._items) {
                this._items = new observable_array_1.ObservableArray();
            }
            var jsdoSettings = {
                serviceURI: "https://www.rollbase.com/rest/api/",
                authenticationModel: 'basic',
                custId: CUSTOMER_ID
            };
            var jsdoSession = new jsdoSessionModule.JSDOSession(jsdoSettings);
            var promise = jsdoSession.login(ROLLBASE_USER, ROLLBASE_PASSWORD);
            promise.done(function (data) {
                promise = jsdoSession.fetch("Session5");
                promise.done(function (data) {
                    for (var i = 0; i < data.length; i++) {
                        _this._items.push(new DataItem(data[i].Title, data[i].Description));
                    }
                });
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
    function DataItem(title, description) {
        this.title = title;
        this.description = description;
    }
    return DataItem;
}());
exports.DataItem = DataItem;
//# sourceMappingURL=main-view-model.js.map