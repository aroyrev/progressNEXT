(function(g) {

  var app ={};

  app.search = kendo.observable({
      onShow: function() {

        if (!$("#listview").data("kendoMobileListView")){
          var dataSource = new kendo.data.DataSource({
            transport: {
              read: {
                url: "/api/attendee"
              }
            }
          });

          $("#listview").kendoMobileListView({
             dataSource: dataSource,
             pullToRefresh: true,
             filterable : {
                   field : "firstName",
                   ignoreCase: true,
                   placeholder : "Name"
              },
             click: function(e) {
                if (e.dataItem){
                  app.detail.set("currentItem", e.dataItem);
                  app.mobileApp.navigate('#detail', "slide");
                }
             },
             template : kendo.template($("#listviewTemplate").html())
          });
        }
        else {
          $("#listview").data("kendoMobileListView").refresh();
        }
      },
      afterShow: function() {
      }
  });

  app.detail = kendo.observable({
      message : "",
      accacia1: false,
      grand: false,
      ballroom1: false,

      onShow: function() {

      },

      afterShow: function() {

      },
      notify:function(e){
         app.mobileApp.pane.loader.show();
          $.post('/api/attendee', {
              message : app.detail.message,
              accacia1 : app.detail.accacia1,
              ballroom1 : app.detail.ballroom1,
              grand : app.detail.grand,
              email: app.detail.currentItem.email
          }).done(function(result){

              app.detail.message = "";
              app.detail.accacia1 = false;
              app.detail.ballroom1 = false;
              app.detail.grand = false;

              app.mobileApp.pane.loader.hide();
              app.mobileApp.navigate("#:back", "slide");
          })
      }
  });


  app.mobileApp = new kendo.mobile.Application(document.body, {
      // comment out the following line to get a UI which matches the look
      // and feel of the operating system
      skin: 'flat'
  });

  g.app = app;

})(window);
