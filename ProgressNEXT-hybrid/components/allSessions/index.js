'use strict';

app.allSessions = kendo.observable({
    isDirty: false,
    detailViewLoaded : false,
    view : [],
    agenda: null,
    onShow: function() {
        app.mobileApp.pane.loader.show();

        window.fetchAllSesions(function(view){
          $("#date").empty();

          for (var index = 0; index < view.length; index++) {
             $("#date").append("<li style='text-transform:uppercase'>" + kendo.toString(new Date(view[index].value), "MMM d") + "</li>")
          }

          $("#date").kendoMobileButtonGroup({
              select: function(e) {
                 var listView = $("#sessionList").data("kendoMobileListView");
                 if (listView){
                   listView.dataSource.data(view[e.index].items);
                  }
                 app.allSessions.selectedDateIndex = e.index;
              },
              index: app.allSessions.selectedDateIndex
          });

          app.mobileApp.pane.loader.hide();

          if (app.currentUser && app.currentUser.id){
              app.allAgenda(app.currentUser.id, function(){
                 app.allSessions.load(view);
               });

           } else {
               app.allSessions.load(view);
           }
        })
    },
    afterShow: function() {
        app.allSessions.isDirty = true;
    },
    beforeShow: function(){
      $("#notes").hide();

      var listView =$("#sessionList").data("kendoMobileListView");
      if (listView){
        listView.refresh();
      }
  }
});

// START_CUSTOM_CODE_allSessions
// END_CUSTOM_CODE_allSessions
(function(parent) {
    var dataProvider = app.data.progressNext,
        flattenLocationProperties = function(dataItem) {
            var propName, propValue,
                isLocation = function(value) {
                    return propValue && typeof propValue === 'object' &&
                        propValue.longitude && propValue.latitude;
                };

            for (propName in dataItem) {
                if (dataItem.hasOwnProperty(propName)) {
                    propValue = dataItem[propName];
                    if (isLocation(propValue)) {
                        // Location type property
                        dataItem[propName] =
                            kendo.format('Latitude: {0}, Longitude: {1}',
                                propValue.latitude, propValue.longitude);
                    }
                }
            }
        },
        dataList = kendo.observable({
            itemClick: function(e) {
                app.setSelectedItem(e.dataItem);
                app.allSessions.detailViewLoaded = false;
                app.mobileApp.navigate('#components/allSessions/details.html?uid=' + e.dataItem.uid, "slide");
            },
            markAsFavorite : function(e){
                if (!app.currentUser || !app.currentUser.id){
                  app.mobileApp.navigate("components/authenticate/view.html", "slide");
                  return;
                }

                if (app.requestStarted){
                  return;
                }

                var jsdo = new progress.data.JSDO({ name : 'Agenda28'});

                 if (!$(e.button).hasClass("km-selected")){
                      jsdo.subscribe('afterCreate', afterCreate, this);

                      $(e.button).addClass("km-selected");

                      var data = {
                        "R169350623" : app.currentUser.id
                      };

                      if (e.dataItem.workshop) {
                        data['R219140147'] = e.dataItem.id
                      }
                      else {
                        data['R168423872'] = e.dataItem.id
                      }

                      jsdo.add(data);
                      jsdo.saveChanges();
                  }
                  else{
                      var agendaItem = app.agenda[e.dataItem.id];

                      jsdo.fill({filter : { field:"id", operator:"eq", value:agendaItem.id }});

                      jsdo.subscribe("afterFill", afterFill);

                      $(e.button).removeClass("km-selected");
                  }

                   function afterFill(jsdo, success, request){
                     jsdo.foreach(function (jsRecord) {
                          jsRecord.remove();
                          jsdo.saveChanges();
                          if (success){
                            delete app.agenda[e.dataItem.id];
                            app.refreshAgenda();
                          }
                          app.requestStarted = false
                     });
                  }

                  function afterCreate(jsdo, record, success, request){
                      if (success){
                          app.agenda[e.dataItem.id] = record.data;
                          app.refreshAgenda();
                      }
                      app.requestStarted = false
                  }

            },
            detailsAfterShow: function(e){
                app.allSessions.detailViewLoaded = true;
            },

            detailsShow: function(e) {
                kendo.mobile.application.scroller().reset();

                if (app.allSessions.detailViewLoaded){
                  return;
                }

                if (app.getSelectedItem()){
                    var item = app.getSelectedItem();
                    itemModel = kendo.observable({
                        Title : item.Title,
                        Description : item.Description,
                        Location: kendo.toString(item.Start, 'h:mm') + ' - ' + kendo.toString(item.End, 'h:mm tt') + ', ' + item.Room,
                        Speaker : item.Speaker,
                        id : item._id
                    });
                } else{
                  var item = e.view.params.uid,
                      listView = $("#sessionList").data("kendoMobileButtonGroupobileListView"),
                      dataSource = listView.dataSource,
                      itemModel = dataSource.getByUid(item);
                }

                if (itemModel && !itemModel.Title) {
                    itemModel.Title = String.fromCharCode(160);
                }

                if (itemModel.Description === 'null'){
                    itemModel.Description = "";
                }

                itemModel.set("success", false);
                itemModel.set("overflow", false);
                itemModel.set("attendee", 0);

                fetchSpeakers(itemModel);
                fetchWorkshops(itemModel);
                fetchStatus(itemModel);

                dataList.set("currentItem", itemModel);

                if (app.currentUser){
                  app.allAgenda(app.currentUser.id, function(cb){
                    if (app.agenda[itemModel.id]){

                        $("#notes").show();

                        if (!$("#favorite").hasClass("km-selected")){
                          $("#favorite").addClass("km-selected");
                        }
                    }
                    else{
                      $("#favorite").removeClass("km-selected");
                    }
                  });
                }

                function fetchSpeakers(itemModel){
                    app.data.progressDataProvider.loadCatalogs().done(function(session, result, info){
                        var dataSource = new kendo.data.DataSource({
                          type: 'jsdo',
                          transport: {
                              jsdo: new progress.data.JSDO({ name : 'Speaker5'})
                          },
                          serverFiltering: true,
                          filter: { field: "id", operator: "eq", value: itemModel.Speaker },
                        });

                        dataSource.fetch(function(){
                          if (dataSource.view().length === 0){
                            $("#speakerListTitle").hide();
                          }else{
                            $("#speakerListTitle").show();
                          }
                        });

                        itemModel.set("dataSource", dataSource);
                    });
                  }

                  function fetchStatus(itemModel){
                    $.get(app.config.nodeApp.session + '?id=' + itemModel.id).done(function(result){
                        itemModel.set("success", result.success);
                        itemModel.set("overflow", result.overflow);
                        itemModel.set("attendee", result.num_of_attendees);
                    });
                  }

                  function fetchWorkshops(itemModel){

                    app.data.progressDataProvider.loadCatalogs().done(function(session, result, info){
                     var dataSource = new kendo.data.DataSource({
                        type: 'jsdo',
                        transport: {
                            jsdo: new progress.data.JSDO({ name : 'Workshop2'})
                        },
                        serverFiltering: true,
                        filter: { field: "R218971814", operator: "eq", value: itemModel.id },
                        sort: { field: "Order_sort", dir: "asc" },
                        schema: {
                          model: {
                              fields: {
                                  'Name': {
                                      field: 'Name_Title',
                                      defaultValue: ''
                                  },
                                  'Description': {
                                      field: 'Description',
                                      defaultValue: ''
                                  },
                                  'KeyPoints': {
                                      field: 'What_Partners_Will_Learn',
                                      defaultValue: ''
                                  }
                              }
                          }
                        }

                      });

                      $("#workshopListTitle").hide();

                      dataSource.fetch(function(){
                        if (dataSource.view().length > 0){
                          $("#workshopListTitle").show();
                        }
                      });

                      itemModel.set("workshops", dataSource);
                      itemModel.set("favorite", function(e){
                        if (e.button){
                            e.button = $(e.target).parent();

                            var currentItem = app.allSessions.dataList.currentItem;

                            if (!app.agenda[currentItem.id]){
                                var button = $("#favorite");
                                app.allSessions.dataList.markAsFavorite({
                                  button: button,
                                  dataItem : currentItem
                                });
                            }

                            e.dataItem.workshop = true;
                            app.allSessions.dataList.markAsFavorite(e);

                            return;
                        }
                    });

                  });
              }
            },

            currentItem: null
        });

    var selectedDateIndex = 0;

    var load = function(view){
        if (!$("#sessionList").data("kendoMobileListView")){
          $("#sessionList").kendoMobileListView({
           dataSource: {
               data : view[app.allSessions.selectedDateIndex].items
           },
           click: function(e) {
              app.setSelectedItem(e.dataItem);
              if (e.dataItem){
                app.allSessions.detailViewLoaded = false;
                if (e.button){
                    e.button = $(e.target).parent();

                    app.allSessions.dataList.markAsFavorite(e);

                    return;
                }
                app.mobileApp.navigate('#components/allSessions/details.html?uid=' + e.dataItem.uid, "slide");
              }
           },
           template : kendo.template($("#dataListTemplate").html())
         });
       }else{
         if (!app.allSessions.isDirty){
           $("#sessionList").data("kendoMobileListView").refresh();
         }
       }
    };

    parent.set('load', load);
    parent.set('selectedDateIndex', selectedDateIndex);

    var markAsFavorite = function(e){
        var currentItem = app.allSessions.dataList.currentItem;
        app.allSessions.dataList.markAsFavorite({
            button: e.button,
            dataItem: currentItem
        });
    };

    parent.set('markAsFavorite', markAsFavorite);
    parent.set('dataList', dataList);
})(app.allSessions);



// START_CUSTOM_CODE_dataList
// END_CUSTOM_CODE_dataList
