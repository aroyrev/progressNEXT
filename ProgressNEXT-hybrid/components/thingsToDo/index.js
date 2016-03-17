'use strict';

app.thingsToDo = kendo.observable({
    isDiry: false,

    onShow: function() {
        if (!app.thingsToDo.isDiry){
          var that = this;

          app.data.progressDataProvider.loadCatalogs().done(function(session, result, info){
                var dataSourceOptions = {
                    type: 'jsdo',
                    transport: {
                        jsdo: new progress.data.JSDO({ name : 'Things_To_Do'})
                    },
                    serverFiltering: true,
                    autoBind:false,
                    schema: {
                        model: {
                            fields: {
                                'Title': {
                                    field: 'Name_of_todo',
                                    defaultValue: ''
                                },
                                'Description': {
                                    field: 'Description',
                                    defaultValue: ''
                                },
                                'Location': {
                                    field: 'Location',
                                    defaultValue: ''
                                },
                                'Website': {
                                   field : 'Website',
                                   defaultValue: ''
                                }
                            }
                        }
                    },
                };

                var dataSource = new kendo.data.DataSource(dataSourceOptions);

                dataSource.fetch(function() {

                    $("#todoList").kendoMobileListView({
                         dataSource: dataSource,

                         click: function(e) {
                            if (e.dataItem){
                              // app.mobileApp.navigate('#components/sponsors/details.html?uid=' + e.dataItem.uid, "slide");
                              window.open(e.dataItem.Website, '_system');
                            }
                         },
                         template : kendo.template($("#todoListTemplate").html())
                       });
                });
            });
      }
    },
    beforeShow: function(){
      var listView =$("#todoList").data("kendoMobileListView");
      if (listView){
        listView.refresh();
      }
    },
    afterShow: function(){
      app.thingsToDo.isDiry = true;
    }
});

// START_CUSTOM_CODE_thingsToDo
// END_CUSTOM_CODE_thingsToDo
(function(parent) {
  
  
})(app.thingsToDo);

// START_CUSTOM_CODE_dataList
// END_CUSTOM_CODE_dataList