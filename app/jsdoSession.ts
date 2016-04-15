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

  fetch(name, filter){
      /// TODO implement filter.

      var record = {
          filter : "",
          objName : "Session5"
      };

      var uri = "https://www.rollbase.com/rest/jsdo/selectQuery?" + queryString.stringify(record);

      var basic = "Basic " + btoa(ROLLBASE_USER + "@" + CUSTOMER_ID + ":" + ROLLBASE_PASSWORD);

      var promise = httpModule.request({
         url : uri,
         headers: { "Authorization": basic}
      });

      var _this = this;

      promise.then(function(result){
        var data = JSON.parse(result.content);

        if (data[name] && data[name].length){
            _this.deferred.resolve(data[name]);
        }
      }, function (error){
          console.error(JSON.stringify(error));
      });

      return this.deferred.promise();
    }
}
