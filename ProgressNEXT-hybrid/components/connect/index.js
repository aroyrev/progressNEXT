'use strict';

app.connect = kendo.observable({
    beforeShow : function(){
       app.connect.fetchAttendee({
          filter : {
              field: "R220443384",
              "operator" : "eq",
              value: app.currentUser.id
          }
       },
       function(result){
          app.attendee = result.view().at(0);
       });
    },
    onShow: function () {

    },
    afterShow: function () {
        //app.connect.isDirty = true;
    },

    isDirty : false
});

(function (parent) {

    var parseVCard = function parse(input) {
        var Re1 = /^(version|fn|title|org|n|email|ADR|tel):(.+)$/i;
        var Re2 = /^([^:;]+);([^:]+):(.+)$/;
        var ReKey = /item\d{1,2}\./;
        var fields = {};

        input.split(/\r\n|\r|\n/).forEach(function (line) {
            var results, key;

            if (Re1.test(line)) {
                results = line.match(Re1);
                key = results[1].toLowerCase();
                fields[key] = results[2];
            } else if (Re2.test(line)) {
                results = line.match(Re2);
                key = results[1].replace(ReKey, '').toLowerCase();

                var meta = {};
                results[2].split(';')
                    .map(function (p, i) {
                        var match = p.match(/([a-z]+)=(.*)/i);
                        if (match) {
                            return [match[1], match[2]];
                        } else {
                            return ["TYPE" + (i === 0 ? "" : i), p];
                        }
                    })
                    .forEach(function (p) {
                        meta[p[0]] = p[1];
                    });

                if (!fields[key]) fields[key] = [];

                fields[key].push({
                    meta: meta,
                    value: results[3].split(';')
                })
            }
        });

        return fields;
    };

    var scan = function (e) {
        if (!app.currentUser) {
            app.mobileApp.navigate("components/authenticate/view.html", "slide");
            return;
        }
        if (cordova.plugins && cordova.plugins.barcodeScanner) {
            cordova.plugins.barcodeScanner.scan(
                // success callback function
                function (result) {
                    // wrapping in a timeout so the dialog doesn't free the app
                    var jsonResult = parseVCard(result.text);

                    if (jsonResult){
                        parent.contact.vCard = result.text;

                        parent.contact.set("phone", "");

                        if (jsonResult.n){
                            parent.contact.set("name", jsonResult.n[0].value.reverse().join(" ").trim());
                        }
                        if (jsonResult.title) {
                            parent.contact.set("title", jsonResult.title[0].value[0]);
                        }
                        if (jsonResult.org) {
                            parent.contact.set("company", jsonResult.org[0].value[0]);
                        }
                        if (jsonResult.email){
                            parent.contact.set("email", jsonResult.email[0].value[0]);
                        }
                        if (jsonResult.tel) {
                            parent.contact.set("phone", jsonResult.tel[0].value[0]);
                        }

                        parent.set("contact", parent.contact);

                        if (jsonResult.n){
                            app.connect.contacts.isDirty = true;
                            app.mobileApp.navigate('#components/connect/foundContact.html', "slide");
                        }

                    }
                },

                // error callback function
                function (error) {
                    // nothing.
                },
                // options object
                {
                    "preferFrontCamera": false,
                    "showFlipCameraButton": false
                }
            );
        } else {
            loadDummyContact();
        }

        function loadDummyContact(){
            parent.contact.set("name", "John Doe");
            parent.contact.set("email","john@gmail.com");
            parent.contact.set("title", "CEO");
            parent.contact.set("company", "John Inc.");
            parent.contact.set("phone", "1-800-8888");
            app.mobileApp.navigate('#components/connect/foundContact.html', "slide");
        }
    };

    parent.set("scan", scan);

    var contactViewModel = kendo.observable({
        name: "",
        email: "",
        title: "",
        company: "",
        phone: "",
        vCard: "",

        show : function(e){

        }

    });

    parent.set("contact", contactViewModel);

    parent.set("close", close);

})(app.barcode);

(function (parent) {
    var dataProvider = app.data.progressNext,
    flattenLocationProperties = function (dataItem) {
        var propName, propValue,
            isLocation = function (value) {
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
    onShow = function(){
        if  (!app.connect.isDirty){
            $("#contact-tabs").empty();

            var tabs = ["Contacts", "Pending"];

            for (var index = 0; index < tabs.length; index++) {
                $("#contact-tabs").append("<li style='text-transform:uppercase'>" + tabs[index] + "</li>")
            }

             $("#contact-tabs").kendoMobileButtonGroup({
                 select: function(e) {
                    app.data.progressDataProvider.loadCatalogs().done(function(session, result, info){
                        if (e.index === 1){
                            app.connect.fetchRequests();
                        }
                        else{
                            app.connect.fetchContacts();
                        }
                    });
                 },
                 index: 0
             });

             app.data.progressDataProvider.loadCatalogs().done(function(session, result, info){
                app.connect.fetchContacts();
             });
        }
    };

    var fetchContacts = function(){
        $("#contactRequestList").hide();

        if (!$("#contactList").data("kendoMobileListView")){
            app.mobileApp.pane.loader.show();

            var dataSourceOptions = {
                type: 'jsdo',
                transport: {
                    jsdo: new progress.data.JSDO({
                        name: 'Contact716'
                    })
                },
                change: function (e) {
                    var data = this.data();
                    for (var i = 0; i < data.length; i++) {
                        var dataItem = data[i];

                        flattenLocationProperties(dataItem);
                    }
                },
                serverFiltering: true,
                autoBind: false,
                filter : {
                    field: "R168904801",
                    "operator" : "eq",
                    value: app.currentUser.id
                },
                schema: {
                    model: {
                        fields: {
                            'FirstName': {
                                field: 'firstName',
                                defaultValue: ''
                            },
                            'LastName': {
                                field: 'lastName',
                                defaultValue: ''
                            },
                            'Email': {
                                field: 'email',
                                defaultValue: ''
                            },
                            'Title': {
                                field: 'title',
                                defaultValue: ''
                            },
                            'Phone': {
                                field: 'phone',
                                defaultValue: ''
                            },
                            "Company": {
                                field: 'Company_Name',
                                defaultValue: ''
                            }
                        }
                    }
                },
            },
            dataSource = new kendo.data.DataSource(dataSourceOptions);


            dataSource.fetch(function() {
                app.mobileApp.pane.loader.hide();
                $("#contactList").kendoMobileListView({
                   dataSource: dataSource,
                   pullToRefresh: true,
                   click: function(e) {
                      if (e.dataItem){
                        app.connect.contacts.isDirty = false;

                        var itemModel = e.dataItem;

                        if (e.button){
                            e.button = $(e.target).parent();

                            if ($(e.button).hasClass("email") && cordova.plugins && cordova.plugins.email){
                                cordova.plugins.email.open({
                                   to:          [itemModel.Email],
                                   subject:     'Great meeting you ' + itemModel.FirstName + ' at Progress NEXT',
                                   body:'Your personalized message to ' + [itemModel.FirstName, itemModel.LastName].join(' ') + '.',
                                   isHtml:      true
                                }, function(result){

                                });
                            }else if ($(e.button).hasClass('save')){
                                var vCard = app.config.nodeApp.vCard + '?firstName=' + itemModel.FirstName + '&lastName=' + itemModel.LastName + '&workEmail=' + itemModel.Email + '&title=' + encodeURIComponent(itemModel.Title) + '&company=' + encodeURIComponent(itemModel.Company) + '&workPhone=' + encodeURIComponent(itemModel.Phone);

                                app.mobileApp.pane.loader.show();

                                $.get(vCard).done(function(result){
                                  app.mobileApp.pane.loader.hide();
                                  // create a new contact object
                                  if (navigator.contacts){
                                   var contact = navigator.contacts.create();
                                   contact.displayName = [e.dataItem.FirstName, e.dataItem.LastName].join(' ');

                                   // populate some fields
                                   var name = new ContactName();
                                   name.givenName =  e.dataItem.FirstName;
                                   name.familyName = e.dataItem.LastName;
                                   contact.name = name;

                                   var emails = [];
                                   emails[0] = new ContactField('workEmail', e.dataItem.Email, true);

                                   contact.emails = emails;

                                   contact.organizations = [new ContactOrganization('true', null, e.dataItem.Company, null, e.dataItem.Title)];

                                   contact.save(function(contact){
                                       navigator.notification.alert(
                                           "Contact saved to your Address Book",  // message
                                           null,// callback
                                           'Progress NEXT',// title
                                           'Dismiss'// buttonName
                                       );
                                   },function(err){

                                   });
                                 }
                              });
                            } else if ($(e.button).hasClass("delete")){

                                navigator.notification.confirm(
                                    'Are you sure to delete this contact?', // message
                                     function(index){
                                        if (index === 1){
                                            parent.remove(itemModel.id);
                                        }
                                     },            // callback to invoke with index of button pressed
                                    'Confirmation',           // title
                                    ['Confirm','Cancel']     // buttonLabels
                                    );
                                };

                            return;
                        }

                        itemModel.Name = itemModel.FirstName + " " + itemModel.LastName;

                        app.connect.contacts.set("currentItem", itemModel);

                        // app.mobileApp.navigate('#components/connect/details.html?uid=' + e.dataItem.uid, "slide");

                      }
                   },
                   template : kendo.template($("#contactsTemplate").html())
                 });
            });
        }

        $("#contactList").show();
    }

    var fetchRequests = function(){
        $("#contactList").hide();

        var count = 0;

         var dataSourceOptions = {
             type: 'jsdo',
             transport: {
                 jsdo: new progress.data.JSDO({
                     name: 'Connection1'
                 })
             },
             serverFiltering: true,
             autoBind: false,
             filter: {
                 logic : 'and',
                 filters : [
                     { field: "R220385205", operator: "eq", value: app.attendee.Id },
                     { field : "status", operator: "eq", value : 220385186 }
                 ]
             },
             schema: {
                 model: {
                     fields: {
                         'Sender': {
                             field: 'R220385196',
                             defaultValue: ''
                         }
                     }
                 }
             }

         },

         connectionDS = new kendo.data.DataSource(dataSourceOptions);

         connectionDS.fetch(function() {
             var item = connectionDS.view();

             if (item && item.length === 0){
                 app.connect.destroy($("#contactRequestList"));
                 $("#contactRequestList").empty();
                 return;
             }

             count = item.length;

             app.connect.badge.refresh(count);

             var filters = [];

             for (var index = 0; index < item.length; index++){
                 var sender = item.at(index).Sender
                 filters.push({ field : "id" , operator: "eq", value: sender});
             }
             app.connect.fetchAttendee({
                 filter : {
                     logic : "or",
                     filters: filters
                 }
             },
             function(attendeeDS){
                 if ($("#contactRequestList").data("kendoMobileListView")){
                    var contactRequestList = $("#contactRequestList").data("kendoMobileListView");
                    contactRequestList.dataSource.data(attendeeDS.view());
                    return;
                 }

                 $("#contactRequestList").kendoMobileListView({
                    dataSource: attendeeDS,
                    pullToRefresh: false,
                    click: function(e) {
                         if (e.button && e.dataItem && e.dataItem.id){
                             app.mobileApp.pane.loader.show();

                             var item = e.dataItem;
                             var jsdo = new progress.data.JSDO({ name : 'Connection1'});

                             var dataSourceOptions = {
                                 type: 'jsdo',
                                 transport: {
                                     jsdo: jsdo
                                 },
                                 serverFiltering: true,
                                 autoBind: false,
                                 filter : {
                                     logic : 'and',
                                     filters:[
                                         { field:"R220385196", operator:"eq", value: item.id},
                                         { field:"R220385205", operator:"eq", value: app.attendee.Id},
                                         { field : "status", operator: "eq", value : 220385186 }
                                     ]
                                 }
                             }

                             var connectionDS = new kendo.data.DataSource(dataSourceOptions);

                             connectionDS.fetch(function(){
                                  jsdo.subscribe('afterUpdate', function(jsdo, record, success, request){
                                     app.mobileApp.pane.loader.hide();

                                     var attendee = app.attendee;

                                     var message = "Congratulations! " + [attendee.FirstName, attendee.LastName].join(" ") + " from " +  attendee.Company + " have accepted your contact request";

                                     app.connect.push(item.email, message);

                                     var contactRequestList = $("#contactRequestList").data("kendoMobileListView");

                                     if (contactRequestList){
                                         contactRequestList.dataSource.remove(item);
                                     }

                                     var contactList = $("#contactList").data("kendoMobileListView");
                                     if (contactList){
                                         contactList.dataSource.read();
                                     }

                                     count = count - 1;
                                     app.connect.badge.refresh(count);
                                 });

                                 jsdo.assign({
                                     status : 220385213
                                 });

                                 jsdo.saveChanges();
                             });
                         }
                    },
                    template : kendo.template($("#contactRequestTemplate").html())
                  });
             });
         });

        $("#contactRequestList").show();
    }

    parent.set("fetchContacts", fetchContacts);
    parent.set("fetchRequests", fetchRequests);

    var fetchAttendee = function(options, cb){
           app.data.progressDataProvider.loadCatalogs().done(function(session, result, info){
            var dataSourceOptions = {
                type: 'jsdo',
                transport: {
                    jsdo: new progress.data.JSDO({ name : 'Attendee5'})
                },
                serverFiltering : true,
                autoBind: false,
                schema: {
                    model: {
                        fields: {
                            'Id': {
                                field: 'id',
                                defaultValue: ''
                            },
                            'UserId': {
                                field : 'R220443384',
                                defaultValue: ''
                            },
                            'FirstName': {
                                field: 'First_Name',
                                defaultValue: ''
                            },
                            'LastName': {
                                field: 'Last_Name',
                                defaultValue: ''
                            },
                            'Title': {
                                field: 'Title',
                                defaultValue: ''
                            },
                            "Company": {
                                field: 'company',
                                defaultValue: ''
                            }
                        }
                    }
                },
            };

            for(var key in options) {
                dataSourceOptions[key] = options[key];
            }

            var dataSource = new kendo.data.DataSource(dataSourceOptions);

            dataSource.fetch(function() {
                cb(dataSource);
            });
        });
    }

    parent.set("fetchAttendee", fetchAttendee);

    var push = function(to, message) {
      var filter = JSON.stringify({ "Parameters.email" : to });

      var options = {
          "Filter": filter,
          "IOS": {
              "aps": {
                  "alert": message,
                  "sound": "default",
                  "badge": "+1"
            },
            "contact": "true"
          },
          "Android": {
              "data": {
                  "title": "Progress NEXT",
                  "message": message,
                  "time_to_live": "0",
                  "delay_while_idle" : "false",
                  "contact": "true"
                }
          }
      };

      app.data.progressNext.push.notifications.create(options, function(data){
         // sent.
      }, function(error){
         console.log(JSON.stringify(error));
      });

    }

    parent.set("push", push);

    var badge = kendo.observable({
          refresh: function(count){
            app.data.progressNext.push.setBadgeNumber(count, function(success){
                // nothing here.
            }, function(err){
                console.log(err);
                alert(JSON.stringify(err));
            });
        }
    });

    parent.set("badge", badge);


    var contacts = kendo.observable({
        isDirty : false,
        show: function (e) {
            if (!$("#allContactList").data("kendoMobileListView")){
                app.mobileApp.pane.loader.show();
                app.data.progressDataProvider.loadCatalogs().done(function(session, result, info){
                    app.connect.fetchAttendee({
                        filter : {
                            field: "email", operator: "neq", value: app.currentUser.email
                        },
                        serverFiltering : false,
                        sort: { field: "FirstName", dir: "asc" },
                        group : [{ field : 'Company'}],
                    },
                    function(dataSource){

                         app.mobileApp.pane.loader.hide();

                        $("#allContactList").kendoMobileListView({
                           dataSource: dataSource,
                           pullToRefresh: true,
                           click: function(e) {
                                if (e.button){
                                    var item = e.dataItem;

                                    app.mobileApp.pane.loader.show();

                                    var jsdo = new progress.data.JSDO({ name : 'Connection1'});

                                    jsdo.subscribe('afterCreate', function(jsdo, record, success, request){
                                      app.mobileApp.pane.loader.hide();
                                      if (success){
                                           var attendee = app.attendee;

                                           var message = [attendee.FirstName, attendee.LastName].join(" ") + " from " +  attendee.Company + " have sent you a contact request.";

                                           app.connect.push(item.email, message);

                                           e.button.enable(false);
                                      }
                                    });

                                    jsdo.add({
                                          "R220385196": app.attendee.Id,
                                          "R220385205": item.id
                                    });

                                    jsdo.saveChanges();

                                };
                           },
                           template : kendo.template($("#allContactsTemplate").html())
                         });
                    });

                });
            }
        },
        afterShow : function(e){

        },
        beforeShow: function(e){
            app.connect.beforeShow(e);
        },
        onKeyUp: function(e){
          var val = $(e.target).val();
          var listView = $("#allContactList").data("kendoMobileListView");
          var filter = {
            logic : 'or',
            filters : [
              { field: "FirstName", operator: "startswith", value: val },
              { field: "LastName", operator: "startswith", value: val },
              { field: "Company", operator: "startswith", value: val }
            ]
          };
          listView.dataSource.filter(filter);
        }
    });

    var remove = function(id){
        app.mobileApp.pane.loader.show();

        var jsdo = new progress.data.JSDO({ name : 'Contact716'});

        jsdo.fill({filter : { field:"id", operator:"eq", value: id }});

        jsdo.subscribe("afterFill", afterFill);
        jsdo.subscribe("afterDelete", afterDelete);

        function afterFill(jsdo, success, request){
             jsdo.foreach(function (jsRecord) {
                if (success){
                    jsRecord.remove();
                    jsdo.saveChanges();
                }
             });
        }

        function afterDelete(jsdo, record, success, request){
            app.mobileApp.pane.loader.hide();
            var listview = $("#contactList").data("kendoMobileListView");
            listview.dataSource.read();
        }
    };

    var search = function(e){
        app.mobileApp.navigate('#components/connect/search.html', "slide");
    }

    var destroy = function destroy(element){
        if (element.data("kendoMobileListView")){
            element.data("kendoMobileListView").destroy();
        }
    }

    parent.set("destroy", destroy);
    parent.set('search', search);
    parent.set('remove', remove);
    parent.set('contacts', contacts);
    parent.set('onShow', onShow);

})(app.connect);




// START_CUSTOM_CODE_contacts
// END_CUSTOM_CODE_contacts
