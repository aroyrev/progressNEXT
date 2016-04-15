import observableModule = require("data/observable");
import jsdoSessionModule = require('./jsdoSession');

import {ObservableArray} from "data/observable-array";

export class MainViewModel extends observableModule.Observable {

    private _items: ObservableArray<DataItem>;

    constructor() {
        super();
        this.set("mainContentText", "SideDrawer for NativeScript can be easily setup in the XML definition of your page by defining main- and drawer-content. The component"
            + " has a default transition and position and also exposes notifications related to changes in its state.");
    }

    get dataItems() {
       if (!this._items) {
           this._items = new ObservableArray<DataItem>();
       }

       var jsdoSettings = {
           serviceURI: "https://www.rollbase.com/rest/api/",
           authenticationModel: 'basic',
           custId: CUSTOMER_ID
       };

       var jsdoSession = new jsdoSessionModule.JSDOSession(jsdoSettings);
       var promise = jsdoSession.login(ROLLBASE_USER, ROLLBASE_PASSWORD);

       promise.done((data) =>{
           promise = jsdoSession.fetch("Session5");

           promise.done((data)=>{
                 for (var i = 0; i < data.length; i++){
                     this._items.push(new DataItem(data[i].Title, data[i].Description));
                 }
           });
      });

      return this._items;
   }
}

export class DataItem {
    public title;
    public description;

    constructor(title: string, description: string) {
        this.title = title;
        this.description = description;
    }
}
