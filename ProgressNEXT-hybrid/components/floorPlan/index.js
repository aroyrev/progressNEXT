'use strict';

app.floorPlan = kendo.observable({
	isDiry: false,

    onShow: function() {
        if (!app.floorPlan.isDiry){
          app.mobileApp.pane.loader.show();

          app.data.progressDataProvider.loadCatalogs().done(function(session, result, info){
                var dataSourceOptions = {
                    type: 'jsdo',
                    transport: {
                        jsdo: new progress.data.JSDO({ name : 'Floorplan1'})
                    },
                    schema: {
                        model: {
                            fields: {
                                'Title': {
                                    field: 'name',
                                    defaultValue: ''
                                },
                                'Image': {
                                    field: 'Image',
                                    defaultValue: ''
                                }
                            }
                        }
                    },
                };

                var dataSource = new kendo.data.DataSource(dataSourceOptions);


                dataSource.fetch(function() {
                    var item = dataSource.view().at(0);
                    $("#floorPlan").kendoMobileListView({
	            		     dataSource: dataSource,
	            		     template : kendo.template($("#floorplan-template").html())
                    });

                    app.floorPlan.model.set("item", item);

                    app.mobileApp.pane.loader.hide();

                });
            });
      }

    },

    afterShow: function() {
      app.floorPlan.isDiry = true;
    }
});


(function(parent) {
    var model = kendo.observable({
    });

		var detailsShow = function(e){
			  var img = e.sender.params.uid;
				$("#floorPlanZoomImage").attr("src", img);
		};

		parent.set("detailsShow", detailsShow);

    parent.set('model', model);

})(app.floorPlan);

// START_CUSTOM_CODE_floorPlan
// END_CUSTOM_CODE_floorPlan
