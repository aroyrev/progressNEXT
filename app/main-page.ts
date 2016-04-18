import vmModule = require("./main-view-model");
import frameModule = require('ui/frame');
import view = require('ui/core/view');
import detailModule = require("./details-view-model");

export function pageLoaded(args) {
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

export function listViewItemTap(args: listView.ItemEventData) {
    frameModule.topmost().navigate("details-page");

    detailModule.detailsViewModel.set("selectedItem", args.view.bindingContext);
}
