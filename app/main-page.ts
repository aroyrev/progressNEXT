import viewModelModule = require("./main-view-model");
import frameModule = require('ui/frame');
import observableModule = require("data/observable");
import view = require('ui/core/view');
import progressModule = require('progress-jsdo');

import BufferModule = require('buffer');
import PromiseModule = require("node-promise");
import httpModule = require('http');
import queryString = require('querystring');

var $ = {};


export class Promise {
  private _cb:(result) => void;
  done(cb: functon){
      this._cb = cb
  }
  get callback(): (result) => void {
      return this._cb;
  }
}

export class Deferred {
    private _promise;
    private static LOGIN_SUCCESS = 1;

    constructor() {
        this._promise = new Promise();
    }

    promise(){
        return this._promise;
    }
    resolve(data){
      this._promise.callback(data);
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

export class JSDOSession
{
  private sessionId;
  private settings;
  private promise;

  constructor(settings: any){
      this.settings = settings;
      this.deferred = $.Deferred();
  }

  login(username, password){
      var uri = this.settings.serviceURI + "login?loginName=" +  username  + "&password="+  password +"&custId=" + this.settings.custId + "&output=json";

     var promise = httpModule.request({
         url : uri,
         headers: { "Content-Type": "application/json" }
     });

     var _this = this;

     promise.then(function(result){
       var data = JSON.parse(result.content);

       if (data.status === "ok"){
          _this.sessionId = data.sessionId;
          _this.deferred.resolve(data);
       }
     }, function (error){
         console.error(JSON.stringify(error));
     });

     return this.deferred.promise();
  }

  fetch(name, options){
      var items = options.schema.model.fields;

      var values = Object.keys(items).map(function(key){
          return items[key].field;
      });

      // TODO process WHERE

      var selectQuery = "SELECT " + values.join(",")  + " FROM " + name;
      var filter = JSON.stringify({ "sqlQuery": selectQuery });

      var record = {
					query : selectQuery,
					sessionId: this.sessionId,
					output: 'json'
			};

      var uri  = this.settings.serviceURI + "selectQuery?" + queryString.stringify(record);

      var promise = httpModule.request({
          url : uri,
      });

      var _this = this;

      promise.then(function(result){
        var data = JSON.parse(result.content);
        console.log(JSON.stringify(result));

      }, function (error){
          console.error(JSON.stringify(error));
      });
  }
}

export function pageLoaded(args) {
    var page = args.object;

    var jsdoSettings = {
        serviceURI: "https://www.rollbase.com/rest/api/",
        authenticationModel: 'basic',
        custId: CUSTOMER_ID
    };

    var jsdoSession = new JSDOSession(jsdoSettings);
    var promise = jsdoSession.login(ROLLBASE_USER, ROLLBASE_PASSWORD);

    promise.done(function(data){
        promise = jsdoSession.fetch("Session5", {
            schema: {
                model : {
                  fields: {
                    'Title': {
                        field: 'Title',
                        defaultValue: ''
                    },
                    'Room': {
                        field: 'Room',
                        defaultValue: ''
                    },
                    'Start': {
                       field : 'Start_Time',
                       defaultValue: ''
                    },
                    'End': {
                       field : 'End_Time',
                       defaultValue: ''
                    },
                    'Speaker': {
                       field:  'R168422082',
                       defaultValue: ''
                    },
                    "Description": {
                       field:  'Description',
                       defaultValue: ''
                    }
                }
            }
          }
     });

   });

    // var progress = progressModule.progress;
    // var jsdoSession = new progress.data.JSDOSession(jsdoSettings);
    //
    // jsdoSession.login(ROLLBASE_USER, ROLLBASE_PASSWORD).done((data)=>{
    //       if (data.loginResult === 1){
    //         var addCatalog = jsdoSession.addCatalog(jsdoSettings.catalogURIs);
    //
    //
    //         addCatalog.fail(()=> {
    //             console.log("failed");
    //         });
    //       }
    //       else{
    //         console.log(data.errorObject.message);
    //       }
    //     // console.log(result.xhr.response);
    // });

    // promise.fail(function(e){
    //     console.log(e);
    // });

    if (page.ios) {
      var controller = frameModule.topmost().ios.controller;
      //
      frameModule.topmost().ios.navBarVisibility = "none";

      // set the title
      page.ios.title = "Progress NEXT";

      // list view defination here.
      // pull data from  JSDO progress next
      // do a master detail view.

      var navigationBar = controller.navigationBar;

      navigationBar.barTintColor = UIColor.colorWithRedGreenBlueAlpha(53/255, 205/255, 21/255, 1);
      navigationBar.titleTextAttributes = new NSDictionary([UIColor.whiteColor()], [NSForegroundColorAttributeName]);

      navigationBar.barStyle = 1;

      controller.navigationBarHidden = false;
  }
  page.bindingContext = new viewModelModule.MainViewModel();

}
