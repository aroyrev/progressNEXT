"use strict";
var observableModule = require("data/observable");
var jsdoSessionModule = require('./jsdoSession');
var observable_array_1 = require("data/observable-array");
var DetailsViewModel = (function (_super) {
    __extends(DetailsViewModel, _super);
    function DetailsViewModel() {
        _super.call(this);
    }
    Object.defineProperty(DetailsViewModel.prototype, "dataItems", {
        get: function () {
            this._items = new observable_array_1.ObservableArray();
            var jsdoSettings = {
                serviceURI: "https://www.rollbase.com/rest/jsdo/",
                authenticationModel: 'basic'
            };
            var jsdoSession = new jsdoSessionModule.JSDOSession(jsdoSettings);
            var promise = jsdoSession.fetch("Speaker5", {
                id: this.get("selectedItem").speaker
            });
            var _this = this;
            promise.done(function (data) {
                for (var i = 0; i < data.length; i++) {
                    _this._items.push(new Speaker(data[i].First_Name + " " + data[i].Last_Name, data[i].Title, data[i].Bio));
                }
            });
            return this._items;
        },
        enumerable: true,
        configurable: true
    });
    return DetailsViewModel;
}(observableModule.Observable));
exports.DetailsViewModel = DetailsViewModel;
var Speaker = (function () {
    function Speaker(name, title, description) {
        this.name = name;
        this.description = description;
    }
    return Speaker;
}());
exports.Speaker = Speaker;
exports.detailsViewModel = new DetailsViewModel();
//# sourceMappingURL=details-view-model.js.map