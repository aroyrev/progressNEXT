import pages = require("ui/page");
import observable = require("data/observable");
import vmModule = require("./main-view-model");

// Event handler for Page "navigatedTo" event attached in details-page.xml
export function pageNavigatedTo(args: observable.EventData) {
    var page = <pages.Page>args.object;

    var selectedItem =  vmModule.mainViewModel.get("selectedItem");

    page.bindingContext = selectedItem;

    


    if (page.ios){
       page.ios.title = "Session";
    }
}
