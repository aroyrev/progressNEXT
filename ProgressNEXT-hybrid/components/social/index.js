'use strict';

app.social = kendo.observable({
	isDirty: false,

    onShow: function() {

    },
    afterShow: function() {
    	app.social.isDirty = true;
    }
});


// START_CUSTOM_CODE_sponsors
// END_CUSTOM_CODE_sponsors
(function(parent) {
	var onShow = function(){
		if (!$("#tweetList").data("kendoMobileListView")){
			app.mobileApp.pane.loader.show();
			app.data.progressDataProvider.loadCatalogs().done(function(session, result, info){
		            var options = {
		                type: 'jsdo',
		                transport: {
		                    jsdo: new progress.data.JSDO({ name : 'Social'}),
		                    countFnName: "count"
		                },
		                schema: {
		                    model: {
		                        fields: {
		                            'Title': {
		                                field: 'Title',
		                                defaultValue: ''
		                            },
		                          	'Tag': {
		                                field: 'Filter',
		                                defaultValue: ''
		                            }
		                        }
		                    }
		                },
		            };
		            var dataSource = new kendo.data.DataSource(options);

		            dataSource.fetch(function() {
	            		var item = dataSource.view().at(0);

	            		var model = kendo.observable({
											Title : item.Title,
											Tag : item.Tag
							    });

		            	var options = {
		            		transport: {
		            			read : {
		            				url : app.config.nodeApp.tweets + "?q=" + escape(item.Tag)
		            			}
		            		},
		            		serverPaging: false,
		            		schema: {
		                    	model: {
		                        	fields: {
		                            	'Text': {
		                                	field: 'text',
		                               	 	defaultValue: ''
		                            	},
		                            	'ProfileImageUrl' : {
		                            		field: 'user.profile_image_url',
		                            		defaultValue: ''
		                            	},
		                            	'Name' : {
		                            		field: 'user.name',
		                            		defaultValue: ''
		                            	},
		                            	'ScreenName' : {
		                            		field: 'user.screen_name',
		                            		defaultValue: ''
		                            	},
		                            	'Id': {
		                            		field : 'id_str',
		                            		defaultValue : ''
		                            	},
		                            	"Media": {
		                            		field : 'entities.media',
		                            		defaultValue: ''
		                            	}
		                       		}
		                    	}
		                   	}
		            	};

		            	var twitterDataSource = new kendo.data.DataSource(options);

		            	twitterDataSource.fetch(function(){
		            		$("#tweetList").kendoMobileListView({
		                         dataSource: twitterDataSource,
		                         click: function(e) {
		                            if (e.dataItem){
		                           		window.open('https://twitter.com/' + e.dataItem.ScreenName + '/status/' + e.dataItem.Id, '_system');
		                            }
		                         },
		                         pullToRefresh: true,
    							 template : kendo.template($("#tweetListTemplate").html())
	                       });

		            		app.mobileApp.pane.loader.hide();
		            	});
					    		parent.set('model', model);
		          });
		    }); // end load catalog
			};
	}

	parent.set("onShow", onShow);

	var tweet = function(e){
		if (window.plugins && window.plugins.socialsharing){
			window.plugins.socialsharing.shareViaTwitter('#ProgressNEXT', null, null, function(){
				// nothing here.
			}, function(msg) {
				console.log('error: ' + msg);
			});
		}
	};

	parent.set("tweet", tweet);

})(app.social);


// START_CUSTOM_CODE_atendee
// END_CUSTOM_CODE_atendee
