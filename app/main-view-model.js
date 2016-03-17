"use strict";
var observableModule = require("data/observable");
var MainViewModel = (function (_super) {
    __extends(MainViewModel, _super);
    function MainViewModel() {
        _super.call(this);
        this.set("mainContentText", "SideDrawer for NativeScript can be easily setup in the XML definition of your page by defining main- and drawer-content. The component"
            + " has a default transition and position and also exposes notifications related to changes in its state.");
    }
    return MainViewModel;
}(observableModule.Observable));
exports.MainViewModel = MainViewModel;
//# sourceMappingURL=main-view-model.js.map