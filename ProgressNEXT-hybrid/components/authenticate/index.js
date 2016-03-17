'use strict';

app.authenticate = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

// START_CUSTOM_CODE_authenticate
// END_CUSTOM_CODE_authenticate
(function(parent) {
    var provider = app.data.progressDataProvider,
        mode = 'signin',
        registerRedirect = 'allSessions',
        signinRedirect = 'allSessions',
        init = function(error) {
            app.mobileApp.pane.loader.hide();

            if (error) {
                if (error.message) {
                    navigator.notification.alert(
                        error.message,  // message
                        null,// callback
                        'Progress NEXT',// title
                        'Dismiss'// buttonName
                    );
                }

                return false;
            }

            var activeView = mode === 'signin' ? '.signin-view' : '.signup-view';

            if (provider.setup && provider.setup.offlineStorage && !app.isOnline()) {
                $('.offline').show().siblings().hide();
            } else {
                $(activeView).show().siblings().hide();
            }
        },
        successHandler = function(record) {
            var redirect = mode === 'signin' ? signinRedirect : registerRedirect;

            if (record && record.data) {

                var data = {
                    id : record.data.id,
                    email: record.data.email,
                    success: true
                };

                app.currentUser = data;

                if (localStorage) {
                    localStorage.setItem(app.data.progressDataProvider.accessTokenCacheKey, JSON.stringify(data));
                } else {
                    app[app.data.progressDataProvider.accessTokenCacheKey] = data;
                }

                app.login();

                app.allSessions.isDirty = false;
                app.profile.isDiry = false;

                app.mobileApp.pane.loader.hide();

                setTimeout(function() {
                    app.mobileApp.navigate('components/' + redirect + '/view.html', "slide");
                }, 0);

            } else {
                init();
            }
        },

        authenticationForm = kendo.observable({
            displayName: '',
            email: '',
            password: '',
            username: '',
            company: '',
            title: '',
            phone: '',
            _alert: function(message){
                navigator.notification.alert(
                        message,  // message
                        null,// callback
                        'Progress NEXT',// title
                        'Dismiss'// buttonName
                );
            },
            validateData: function(data) {
                var model = authenticationForm;

                if (!data.email) {
                    model._alert('Missing email');
                    return false;
                }
                if (!data.password) {
                    model._alert('Missing password');
                    return false;
                }

                return true;
            },

            validateRegistration: function(data) {
                var model = authenticationForm;

                if (!data.displayName ||
                    !data.displayName.match(/[A-Z][a-z]*(\s)[A-Z][a-z]*/)) {
                    model._alert('Name must contain first and last name eg "John Smith"');
                    return false;
                }

                if (!model.validateData(data)){
                    return false;
                }

                if (!data.company) {
                    model._alert('Missing company');
                    return false;
                }
                if (!data.title) {
                    model._alert('Missing title');
                    return false;
                }

                return true;
            },
            signin: function() {
                var model = authenticationForm,
                    email = model.email.toLowerCase(),
                    password = model.password;

                if (!model.validateData(model)) {
                    return false;
                }
                app.mobileApp.pane.loader.show();
                provider.Users.appLogin(email, password, successHandler, init);
            },
            register: function() {
                var model = authenticationForm,
                    email = model.email.toLowerCase(),
                    username = model.username,
                    password = model.password,
                    company = model.company,
                    displayName = model.displayName,
                    attrs = {
                        email: email,
                        displayName: displayName,
                        companyName: model.company,
                        username: username,
                        title: model.title,
                        phone: model.phone
                    };

                if (!model.validateRegistration(model)) {
                    return false;
                }

                app.mobileApp.pane.loader.show();
                provider.Users.register(email, password, attrs, successHandler, init);
            },
            toggleView: function() {
                mode = mode === 'signin' ? 'register' : 'signin';
                init();
            }
        });

    parent.set('authenticationForm', authenticationForm);
    parent.set('afterShow', function() {
        // provider.Users.currentUser().then(successHandler, init);
    });
})(app.authenticate);

// START_CUSTOM_CODE_authenticationForm
// END_CUSTOM_CODE_authenticationForm
