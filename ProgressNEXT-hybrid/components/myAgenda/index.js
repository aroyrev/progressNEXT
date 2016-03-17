'use strict';
app.myAgenda = kendo.observable({
    beforeShow: function() {
        var listView = $("#agendaList").data("kendoMobileListView");
        if (listView){
            listView.destroy();
        }
    },
    afterShow: function() {
      app.myAgenda.notes.changed = false;
    },
    onShow: function() {
        $("#noAgenda").hide();

        window.fetchAllSesions(function(view){
          app.allAgenda(app.currentUser.id, function(){

          //TODO: optimize
          for (var index =0; index< view.length; index++){
              var items = view[index].items;
              var filtered = [];
              for (var sessionIndex = 0; sessionIndex < items.length; sessionIndex++){
                  if (app.agenda[items[sessionIndex].id]){
                      filtered.push(items[sessionIndex]);
                  }
              }
              app.agendaView[index] = filtered;
          }

          $("#agendaDate").empty();

          for (var index = 0; index < view.length; index++) {
             $("#agendaDate").append("<li style='text-transform:uppercase'>" + kendo.toString(new Date(view[index].value), "MMM d") + "</li>");
          }
          $("#agendaDate").kendoMobileButtonGroup({
              select: function(e) {
                $("#noAgenda").hide();
                 var listView = $("#agendaList").data("kendoMobileListView");
                 listView.dataSource.data(app.agendaView[e.index]);

                 app.selectedIndex = e.index;
                 if (app.agendaView[app.selectedIndex].length === 0){
                       $("#noAgenda").show();
                 }
              },
              index: app.selectedIndex
          });

          $("#agendaList").kendoMobileListView({
            dataSource: {
                data : app.agendaView[app.selectedIndex]
            },
            click: function(e) {
                $("#speakerListTitle").hide();
                $("#workshopListTitle").hide();

                app.setSelectedItem(e.dataItem);
                app.allSessions.detailViewLoaded = false;

                if (e.dataItem && e.dataItem.uid){
                  app.mobileApp.navigate('components/allSessions/details.html?uid=' + e.dataItem.uid, "slide");
                }
            },

            template : kendo.template($("#agendaTemplate").html())
          });

          if (app.agendaView.length == 0 || app.agendaView[app.selectedIndex].length === 0){
                $("#noAgenda").show();
          }
        });
    });

  }
});

// START_CUSTOM_CODE_myAgenda
// END_CUSTOM_CODE_myAgenda
(function(parent) {
   var showNotes = function(e){
      var id = app.allSessions.dataList.currentItem.id;
      app.mobileApp.navigate('components/myAgenda/notes.html?uid=' + id, "slide");
   };

   var notes = kendo.observable({
        detailsShow: function (e) {
           var agenda = app.agenda[app.allSessions.dataList.currentItem.id];

           this.set("Notes", "");

           if (agenda.Notes !== "null"){
                this.set("Notes", agenda.Notes);
           }

           this.set("Title", app.allSessions.dataList.currentItem.Title);
           this.set("Location", app.allSessions.dataList.currentItem.Location);

           var id = app.allSessions.dataList.currentItem.id;

           this.set("Id", id);
        },
        save : function(e){
            if (parent.notes.Notes.trim() === ""){
              return;
            }

            app.mobileApp.pane.loader.show();

            var agendaItem = app.agenda[parent.notes.Id];

            var jsdo = new progress.data.JSDO({ name : 'Agenda28'});

            jsdo.fill({filter : { field:"id", operator:"eq", value:agendaItem.id }});

            jsdo.subscribe("afterFill", afterFill);

            jsdo.subscribe('afterUpdate', function(jsdo, record, success, request){
                app.mobileApp.pane.loader.hide();
                if (success){
                    app.agenda[parent.notes.Id].Notes = parent.notes.Notes;
                    app.refreshAgenda();
                }
            });

            function afterFill(jsdo, success, request){
               jsdo.foreach(function (jsRecord) {
                    jsRecord.assign({
                        Notes : parent.notes.Notes
                    });
                    jsdo.saveChanges();
               });
            }
        },
        Id : "",
        Title: "",
        Notes: "",
        Location: "",
        Description: "",
        isDirty: true,
        changed: false
    });


    parent.set('notes', notes);
    parent.set("showNotes", showNotes);

})(app.myAgenda);
