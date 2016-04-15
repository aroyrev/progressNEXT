import viewModelModule = require("./main-view-model");
import frameModule = require('ui/frame');
import observableModule = require("data/observable");
import view = require('ui/core/view');
import progressModule = require('progress-jsdo');
import BufferModule = require('buffer');
import PromiseModule = require("node-promise");

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
  page.bindingContext = new viewModelModule.MainViewModel();

}
