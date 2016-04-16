import observableModule = require("data/observable");
import jsdoSessionModule = require('./jsdoSession');
import {ObservableArray} from "data/observable-array";

export class DetailsViewModel extends observableModule.Observable {

  private _items: ObservableArray<Speaker>;

  constructor() {
      super();
  }

  get dataItems() {
     this._items = new ObservableArray<Speaker>();

     var jsdoSettings = {
         serviceURI: "https://www.rollbase.com/rest/jsdo/",
         authenticationModel: 'basic'
     };

     var jsdoSession = new jsdoSessionModule.JSDOSession(jsdoSettings);

     var promise = jsdoSession.fetch("Speaker5", {
          id :  this.get("selectedItem").speaker
     });

     var _this = this;

     promise.done((data)=>{
           for (var i = 0; i < data.length; i++){
               _this._items.push(new Speaker(data[i].First_Name + " " + data[i].Last_Name, data[i].Title, data[i].Bio));
           }
     });

    return this._items;
 }
}

export class Speaker {
    public name;
    public description;
    public title;

    constructor(name: string, title: string, description: string) {
        this.name = name;
        this.description = description;
    }
}

export var detailsViewModel = new DetailsViewModel();
