"use strict";
var vmModule = require("./details-view-model");
// Event handler for Page "navigatedTo" event attached in details-page.xml
function pageNavigatedTo(args) {
    var page = args.object;
    page.bindingContext = vmModule.detailsViewModel;
    if (page.ios) {
        page.ios.title = "Session";
    }
}
exports.pageNavigatedTo = pageNavigatedTo;
//# sourceMappingURL=details-page.js.map