"use strict";
var viewModelModule = require("./main-view-model");
function pageLoaded(args) {
    var page = args.object;
    page.bindingContext = new viewModelModule.MainViewModel();
}
exports.pageLoaded = pageLoaded;
//# sourceMappingURL=main-page.js.map