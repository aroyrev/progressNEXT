'use strict';

app.sponsors = kendo.observable({
    isDiry: false,

    onShow: function() {
        if (!app.sponsors.isDiry){
          var that = this;

          app.data.progressDataProvider.loadCatalogs().done(function(session, result, info){
                var dataSourceOptions = {
                    type: 'jsdo',
                    transport: {
                        jsdo: new progress.data.JSDO({ name : 'Sponsor7'})
                    },
                    serverFiltering: true,
                    autoBind:false,
                    schema: {
                        model: {
                            fields: {
                                'Sponsor': {
                                    field: 'Sponsor_Name',
                                    defaultValue: ''
                                },
                                'Short': {
                                    field: 'Short_Description',
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

                    $("#sponsorList").kendoMobileListView({
                         dataSource: dataSource,

                         click: function(e) {
                            if (e.dataItem){
                              // app.mobileApp.navigate('#components/sponsors/details.html?uid=' + e.dataItem.uid, "slide");
                              window.open(e.dataItem.Website, '_system');
                            }
                         },
                         template : kendo.template($("#sponsorListTemplate").html())
                       });
                });
            });
      }
    },
    beforeShow: function(){
      var listView =$("#sponsorList").data("kendoMobileListView");
      if (listView){
        listView.refresh();
      }
    },
    afterShow: function(){
      app.sponsors.isDiry = true;
    }
});

// START_CUSTOM_CODE_sponsors
// END_CUSTOM_CODE_sponsors
(function(parent) {
  
  
})(app.sponsors);

// START_CUSTOM_CODE_dataList
// END_CUSTOM_CODE_dataList
