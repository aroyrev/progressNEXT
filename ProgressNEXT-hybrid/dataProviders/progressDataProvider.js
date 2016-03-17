'use strict';

(function() {
    var jsdoSession,
        jsdoSettings = {
            serviceURI: 'https://www.rollbase.com/rest/jsdo/',
            catalogURIs: 'https://www.rollbase.com/rest/jsdo/catalog/allobjects.json',
            authenticationModel: 'basic'
        },
        accessTokenCacheKey = "access_token",
        that = this,
        userFunctions = {
            currentUser: function _currentUser() {
                if (localStorage) {
                    return JSON.parse(localStorage.getItem(accessTokenCacheKey));
                } else {
                    return app[accessTokenCacheKey];
                }
            },
            appLogin: function _appLogin(email, password, done, fail){
                app.data.progressDataProvider.loadCatalogs().done(function(session, result, info){
                        var hash = btoa(SparkMD5.hash(password, true));

                        var dataSource = new kendo.data.DataSource({
                            type: 'jsdo',
                            transport: {
                                jsdo: new progress.data.JSDO({ name : 'App_Users'}),
                                countFnName: "count"
                            },
                            serverFiltering: true,
                            filter: { field: "email", operator: "eq", value: email }
                        });

                        dataSource.fetch(function(){
                            var view = dataSource.view();

                            if (view.length > 0) {
                                if (view.at(0).pwd === hash){
                                    done({ data: view.at(0) });
                                }
                                else{
                                    fail({
                                        message : "Password does not match"
                                    })
                                }
                            }
                            else{
                                fail({
                                    message : "Invalid Email"
                                })
                            }
                        });
                });
            },
            login: function _login(email, password, done, fail) {
                  var promise = jsdoSession.login(email, password);

                  promise.done(done);
                  promise.fail(fail);
            },

            logout : function _logout() {
                 if (localStorage) {
                    return localStorage.setItem(accessTokenCacheKey, null);
                } else {
                    return app[accessTokenCacheKey] = null;
                }
            },
            register: function _register(email, password, attrs, done, fail) {
                 app.data.progressDataProvider.loadCatalogs().done(function(session, result, info){
                        var jsdo = new progress.data.JSDO({ name : 'App_Users'});

                        var attendeeId = 0;

                        var attendeeJSDO = new progress.data.JSDO({ name : 'Attendee5'});

                        jsdo.subscribe('afterCreate', function(jsdo, record, success, request){
                            if (success){
                                if (record && record.data){
                                  attendeeJSDO.findById(attendeeId);
                                  attendeeJSDO.assign({
                                      "R220443384" : record.data.id
                                  });
                                  attendeeJSDO.saveChanges();
                                }
                                return done(record);
                            }
                            return fail({
                                message : request.response.status_txt
                            });
                        });

                        var dataSource = new kendo.data.DataSource({
                            type: 'jsdo',
                            transport: {
                                jsdo: jsdo,
                                countFnName: "count"
                            },
                            serverFiltering: true,
                            filter: { field: "email", operator: "eq", value: email }
                        });

                        dataSource.fetch(function(){
                            var view = dataSource.view();

                            if (view.length > 0){
                                fail({
                                    message : 'You have already registered.'
                                });
                            }
                            else{
                                var attendeeDS = new kendo.data.DataSource({
                                    type: 'jsdo',
                                    transport: {
                                        jsdo: attendeeJSDO,
                                        countFnName: "count"
                                    },
                                    serverFiltering: true,
                                    filter: { field: "email", operator: "eq", value: email }
                                });

                                attendeeDS.fetch(function(){
                                    if (attendeeDS.view().length === 0){
                                      fail({
                                          message : "Please use your conference email address."
                                      })
                                      return;
                                    }

                                    attendeeId = attendeeDS.view().at(0).id;

                                    var names = attrs.displayName.split(' ');

                                    if (names.length > 0){
                                        var firstName = names[0];
                                        var lastName =  names[1];

                                        var hash = btoa(SparkMD5.hash(password, true));

                                        jsdo.add({
                                            pwd         :  hash,
                                            lastName    :  lastName,
                                            firstName   :  firstName,
                                            Company_Name:  attrs.companyName,
                                            title: attrs.title,
                                            phone: attrs.phone,
                                            email: email
                                        });

                                        jsdo.saveChanges();
                                    }
                                })
                            }
                    });
                });
            }
        },
        loadCatalogs = function _loadCatalogs() {
            var promise = $.Deferred(),
                addCatalogFunc = function() {
                    var addCatalog = jsdoSession.addCatalog(jsdoSettings.catalogURIs);
                    addCatalog.done(function _addCatalogDone() {
                        promise.resolve(arguments);
                    });
                    addCatalog.fail(function _addCatalogDone() {
                        promise.reject(arguments);
                    });
                };
            if (jsdoSession && jsdoSession.catalogURIs && jsdoSession.catalogURIs.length) {
                promise.resolve();
            } else {
                if (jsdoSettings.authenticationModel === 'anonymous' && jsdoSession.loginResult !== progress.data.Session.LOGIN_SUCCESS) {
                    var login = jsdoSession.login('', '');
                    login.done(function() {
                        addCatalogFunc();
                    });
                    login.fail(function() {
                        promise.reject(arguments);
                    });
                } else {
                    addCatalogFunc();
                }
            }
            return promise;
        };


    progress.util.jsdoSettingsProcessor(jsdoSettings);
    jsdoSession = new progress.data.JSDOSession(jsdoSettings);

    app.data.progressDataProvider = {
        settings: jsdoSettings,
        session: jsdoSession,
        Users: userFunctions,
        loadCatalogs: loadCatalogs,
        accessTokenCacheKey: accessTokenCacheKey
    };

}());
