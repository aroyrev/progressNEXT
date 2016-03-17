// START_CUSTOM_CODE_sponsors
// END_CUSTOM_CODE_sponsors

'use strict';

(function(parent) {
	parent.fetchAllSesions = function(cb) {
		 if (app.sessions){
			 	 	return cb(app.sessions);
		 }
			app.data.progressDataProvider.loadCatalogs().done(function(session, result, info){
				var dataSourceOptions = {
						type: 'jsdo',
						transport: {
								jsdo: new progress.data.JSDO({ name : 'Session5'})
						},
						serverFiltering: true,
						autoBind:false,
						sort: { field: "Sort", dir: "asc" },
						group : { field : 'Session_Date'},
						schema: {
								model: {
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
						},
				};

				var dataSource = new kendo.data.DataSource(dataSourceOptions);

				dataSource.fetch(function() {
						var view = dataSource.view();

						app.sessions = view;

						return cb(app.sessions);
				});

		}).fail(function(e){
			app.mobileApp.pane.loader.hide();
		});
	}
})(window);
