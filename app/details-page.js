"use strict";
var vmModule = require("./main-view-model");
function pageNavigatedTo(args) {
    var page = args.object;
    var selectedItem = vmModule.mainViewModel.get("selectedItem");
    page.bindingContext = selectedItem;
    if (page.ios) {
        page.ios.title = "Session";
    }
}
exports.pageNavigatedTo = pageNavigatedTo;
//# sourceMappingURL=details-page.js.map