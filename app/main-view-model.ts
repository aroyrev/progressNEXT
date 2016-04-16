import observableModule = require("data/observable");
import jsdoSessionModule = require('./jsdoSession');

import {ObservableArray} from "data/observable-array";

export class MainViewModel extends observableModule.Observable {

    private _items: ObservableArray<DataItem>;

    constructor() {
        super();
    }

    get dataItems() {
       if (!this._items) {
           this._items = new ObservableArray<DataItem>();
       }

       var jsdoSettings = {
           serviceURI: "https://www.rollbase.com/rest/jsdo/",
           authenticationModel: 'basic',
           custId: CUSTOMER_ID
       };

       var jsdoSession = new jsdoSessionModule.JSDOSession(jsdoSettings);
       var promise = jsdoSession.fetch("Session5");

       promise.done((data)=>{
             for (var i = 0; i < data.length; i++){
                 this._items.push(new DataItem(data[i].Title, data[i].Description, data[i].R168422082));
             }
       });

      return this._items;
   }
}

export class DataItem {
    public title;
    public description;
    public speaker;

    constructor(title: string, description: string, speaker: string) {
        this.title = title;
        this.description = description;
        this.speaker = speaker;
    }
}

export var mainViewModel = new MainViewModel();
