'use strict';

app.profile = kendo.observable({
	isDiry: false,

    onShow: function() {
      	if (!app.profile.isDiry){
					app.mobileApp.pane.loader.show();

					app.data.progressDataProvider.loadCatalogs().done(function(session, result, info){
	      		if (app.currentUser){

		            var options = {
		                type: 'jsdo',
		                transport: {
		                    jsdo: new progress.data.JSDO({ name : 'App_Users'}),
		                    countFnName: "count"
		                },
		                serverFiltering: true,
		                filter: { field: "id", operator: "eq", value: app.currentUser.id}
		            };

		            var dataSource = new kendo.data.DataSource(options);

		            dataSource.fetch(function() {
	            		var item = dataSource.view().at(0);

									if (item){
		            		$.post(app.config.nodeApp.qrCode, {
		            			firstName : item.firstName,
		            			lastName: item.lastName,
		            			workEmail: item.email,
		            			title: item.title,
		            			phone: item.phone,
		            			organization: item.Company_Name,
		            			width: 300
		            		}).done(function(result){
		            			app.profile.set("user", kendo.observable({
		            				Name: item.firstName + " " + item.lastName ,
		            				Summary : [item.title, item.Company_Name].join(", ")
		            			}));

		            			$("#qrImg").attr("src", result.url);
		            			$("#logoutButton").show();

		            			app.mobileApp.pane.loader.hide();

		            		});
									}
									else{
										$("#logoutButton").show();
										app.mobileApp.pane.loader.hide();
									}
		            });
		        }
		    });
		}
    },
    afterShow: function() {
    	app.profile.isDiry = true;
    }
});


// START_CUSTOM_CODE_sponsors
// END_CUSTOM_CODE_sponsors
(function(parent) {
	var logout = function(e){
		app.data.progressDataProvider.Users.logout();
		app.currentUser = null;
		app.clearAgenda();
		app.attendees = [];
		app.attendee = null;
		app.login();
		app.mobileApp.navigate('components/allSessions/view.html', "slide:right");
   };

	parent.set("logout", logout);
})(app.profile);


// START_CUSTOM_CODE_atendee
// END_CUSTOM_CODE_atendee
