import viewModelModule = require("./main-view-model");
import frameModule = require('ui/frame');
import observableModule = require("data/observable");
import view = require('ui/core/view');
import progressModule = require('progress-jsdo');

import BufferModule = require('buffer');
import PromiseModule = require("node-promise");

var $ = {};

class Promise {
  private _cb:(result) => void;
  done(cb: functon){
      this._cb = cb
  }
  get callback(): (result) => void {
      return this._cb;
  }
}

class Deferred {
    private _promise;
    private static LOGIN_SUCCESS = 1;

    constructor() {
        this._promise = new Promise();
    }

    promise(){
        return this._promise;
    }
    resolve(session, result, info){
      this._promise.callback({ loginResult : result, errorObject: info.errorObject });
    }
};

$.Deferred = () => {
  return new Deferred();
};

global.$ = $;
global.btoa = function (str) {
  var data =  NSString.stringWithString(str).dataUsingEncoding(NSUTF8StringEncoding);
  return data.base64EncodedStringWithOptions(0);
};

export function pageLoaded(args) {
    var page = args.object;

    var jsdoSettings = {
        serviceURI: 'https://www.rollbase.com/rest/jsdo/',
        catalogURIs: 'https://www.rollbase.com/rest/jsdo/catalog/allobjects.json',
        authenticationModel: 'basic'
    };

    var progress = progressModule.progress;
    var jsdoSession = new progress.data.JSDOSession(jsdoSettings);

    jsdoSession.login(ROLLBASE_USER, ROLLBASE_PASSWORD).done((data)=>{
          if (data.loginResult == 1){
              console.log("Success");
          }
          else{
            console.log(data.errorObject.message);
          }

        // console.log(result.xhr.response);
    });

    // promise.fail(function(e){
    //     console.log(e);
    // });

    if (page.ios) {
      var controller = frameModule.topmost().ios.controller;

      // show the navbar
      frameModule.topmost().ios.navBarVisibility = "always";

      // set the title
      page.ios.title = "Progress NEXT";

      var navigationBar = controller.navigationBar;

      navigationBar.barTintColor = UIColor.colorWithRedGreenBlueAlpha(53/255, 205/255, 21/255, 1);
      navigationBar.titleTextAttributes = new NSDictionary([UIColor.whiteColor()], [NSForegroundColorAttributeName]);
      navigationBar.barStyle = 1;

      controller.navigationBarHidden = false;
  }
  page.bindingContext = new viewModelModule.MainViewModel();

}
