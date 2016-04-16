"use strict";
var vmModule = require("./main-view-model");
var frameModule = require('ui/frame');
var detailModule = require("./details-view-model");
function pageLoaded(args) {
    var page = args.object;
    //   if (page.ios) {
    //     var controller = frameModule.topmost().ios.controller;
    //     //
    //     // frameModule.topmost().ios.navBarVisibility = "none";
    //
    //     // set the title
    //     page.ios.title = "Progress NEXT";
    //
    //     var navigationBar = controller.navigationBar;
    //
    //     navigationBar.barTintColor = UIColor.colorWithRedGreenBlueAlpha(53/255, 205/255, 21/255, 1);
    //     navigationBar.titleTextAttributes = new NSDictionary([UIColor.whiteColor()], [NSForegroundColorAttributeName]);
    //
    //     navigationBar.barStyle = 1;
    //
    //     controller.navigationBarHidden = false;
    // }
    page.bindingContext = vmModule.mainViewModel;
}
exports.pageLoaded = pageLoaded;
function listViewItemTap(args) {
    frameModule.topmost().navigate("details-page");
    detailModule.detailsViewModel.set("selectedItem", args.view.bindingContext);
}
exports.listViewItemTap = listViewItemTap;
//# sourceMappingURL=main-page.js.map