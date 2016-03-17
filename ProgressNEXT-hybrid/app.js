(function() {
    // store a reference to the application object that will be created
    // later on so that we can use it if need be
    var app = {
        data: {},
        currentUser : {},
        init : function(cb){
           app.data.progressDataProvider.Users.login(app.config.rollbase.user, app.config.rollbase.password, function(success, result, info){
              cb();
           },function(e){
                cb();
            });
        },
        allAgenda : function(userId, cb){
          var _this = this;

          if (localStorage.getItem("agenda")){
             app.agenda = _this.parseAgenda(JSON.parse(localStorage.getItem("agenda")));
             if (app.agenda && app.agenda.Session){
               return cb();
             }
          }
          app.data.progressDataProvider.loadCatalogs().done(function(session, result, info){
            var agendaDataSource = new kendo.data.DataSource({
              type: 'jsdo',
              autoBind:false,
              transport: {
                  jsdo: new progress.data.JSDO({ name : 'Agenda28'}),
              },
              serverFiltering: true,
              filter: { field: "R169350623", operator: "eq", value: userId },
               schema: {
                  model: {
                      fields: {
                          'Session': {
                              field: 'R168423872',
                              defaultValue: ''
                          },
                          'User': {
                              field: 'R169350623',
                              defaultValue: ''
                          },
                          'Workshop': {
                            field : 'R219140147',
                            defaultValue: ''
                          },
                          'Notes': {
                             field: 'Notes',
                             defaultValue : ''
                          }
                      }
                  }
              }
            });

            agendaDataSource.fetch(function(){
              app.agenda = _this.parseAgenda(agendaDataSource.view());
              localStorage.setItem("agenda", JSON.stringify(app.agenda));
              return cb();
            });

          });
        },
        parseAgenda : function(view){
          var agenda = {};

          if (view && view.length){
            for (var index = 0; index < view.length; index++){
              var item = view[index];
              if (item.Workshop !== "null"){
                agenda[item.Workshop] = item;
              }
              else if (item.Session !== "null"){
                agenda[item.Session] = item;
              }
            }
          }
          return agenda;
        },
        clearAgenda : function(){
          app.agenda = [];
          localStorage.setItem("agenda", null);
        },
        refreshAgenda: function(){
            localStorage.setItem("agenda", JSON.stringify(app.agenda))
        },

        getSelectedItem : function(){
          return JSON.parse(localStorage.getItem("selectedItem"));
        },
        setSelectedItem : function(item){
          localStorage.setItem("selectedItem", JSON.stringify(item));
        },

    };

    var bootstrap = function() {
        $.support.cors=true;

        app.init(function(){
          app.mobileApp = new kendo.mobile.Application(document.body, {

              // comment out the following line to get a UI which matches the look
              // and feel of the operating system
              skin: 'flat',
              // the application needs to know which view to load first
              initial: 'components/allSessions/view.html'
          });
       });
    };

    app.agendaView = [];
    app.attendees = [];

    if (window.cordova) {
        // this function is called by Cordova when the application is loaded by the device
        document.addEventListener('deviceready', function() {
            // hide the splash screen as soon as the app is ready. otherwise
            // Cordova will wait 5 very long seconds to do it for you.
            if (navigator && navigator.splashscreen) {
                navigator.splashscreen.hide();
            }

            StatusBar.overlaysWebView(false); //Turns off web view overlay.
            StatusBar.backgroundColorByHexString("#3fcb02");

            var element = document.getElementById('appDrawer');
            if (typeof(element) != 'undefined' && element != null) {
                if (window.navigator.msPointerEnabled) {
                    $("#navigation-container").on("MSPointerDown", "a", function(event) {
                        app.keepActiveState($(this));
                    });
                } else {
                    $("#navigation-container").on("touchstart", "a", function(event) {
                        app.keepActiveState($(this));
                    });
                }
            }
            // if (typeof analytics !== 'undefined'){
            //     analytics.Start();
            // }

            if (typeof feedback !== 'undefined'){
                feedback.initialize('6kmvocccx4woagty');
            }

            // default user
            app.login();

            bootstrap();
        }, false);
    } else {
        bootstrap();
    }

    app.keepActiveState = function _keepActiveState(item) {
        var currentItem = item;
        $("#navigation-container li a.active").removeClass("active");
        currentItem.addClass('active');
    };

    window.app = app;

    app.isOnline = function() {
        if (!navigator || !navigator.connection) {
            return true;
        } else {
            return navigator.connection.type !== 'none';
        }
    };

    app.login = function(){
        var user = app.data.progressDataProvider.Users.currentUser();

        // reload sessions.
        app.allSessions.isDirty = false;

        if (user && user.id && user.success){
            app.currentUser = user;
            var element = $("#navigation-container").find('a[href="components/authenticate/view.html"]');
            element.attr("href", "components/myAgenda/view.html");
            element.html("My Agenda");

            $("#navigation-container").find('a[href="components/profile/view.html"]').parent().show();
            $("#navigation-container").find('a[href="components/connect/view.html"]').parent().show();

            regiserUserForPush(user.email);
        }
        else{
            var element = $("#navigation-container").find('a[href="components/myAgenda/view.html"]');
            element.attr("href", "components/authenticate/view.html");
            element.html("Sign In");
            $("#navigation-container").find('a[href="components/profile/view.html"]').parent().hide();
            $("#navigation-container").find('a[href="components/connect/view.html"]').parent().hide();
        }
    };

    function regiserUserForPush(email){
        var devicePushSettings = {
                iOS: {
                    badge: 'true',
                    sound: 'true',
                    alert: 'true'
                },
                android: {
                    senderID: app.config.google.projectNumber
                },
                notificationCallbackIOS: function(e){
                    // navigator.notification.alert(
                    //     e.alert,  // message
                    //     null,// callback
                    //     'Progress NEXT',// title
                    //     'Done'// buttonName
                    // );
                },
                notificationCallbackAndroid: function(e) {
                    //   navigator.notification.alert(
                    //     e.message,  // message
                    //     null,// callback
                    //     'Progress NEXT',// title
                    //     'Done'// buttonName
                    // );
                },
                customParameters : {
                    email : email
                }
        };

        app.data.progressNext.push.register(devicePushSettings, function(data){
            // here
        }, function(err){
            console.log(err);
        });
    }

    app.getImageURI = function (image){
      var match  = image.match(/fileName=[A-Za-z0-9\.\/]+/);
      if (match){
        var fileName = match[0];
        var contentType = image.match(/contentType=[A-Za-z0-9\.\/]+/)[0];

        return "https://www.rollbase.com/storage/servlet/Image?c=" + app.config.rollbase.custId + "&fileName=" + getKeyValue(fileName) + "&contentType=" + escape(getKeyValue(contentType));
      }
    };

    function getKeyValue(source){
        return source.substr(source.indexOf("=") + 1)
    }

    app.barcode = kendo.observable({
        scan : function(e){
            // implement
        }
    });

}());

// START_CUSTOM_CODE_progressNextHybrid
// END_CUSTOM_CODE_progressNextHybrid
