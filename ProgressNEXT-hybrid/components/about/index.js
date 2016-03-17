'use strict';

app.about = kendo.observable({
    onShow: function() {
        if (cordova.getAppVersion){
            cordova.getAppVersion.getVersionNumber().then(function (version) {
                $('.version').text(version);
            });
        }
    },
    afterShow: function() {}
});

// START_CUSTOM_CODE_about
// END_CUSTOM_CODE_about
(function(parent) {
    var aboutForm = kendo.observable({
        openLink: function(url) {
            window.open(url, '_system');
            if (window.event) {
                window.event.preventDefault && window.event.preventDefault();
                window.event.returnValue = false;
            }
        }
    });

    parent.set('aboutForm', aboutForm);
})(app.about);

// START_CUSTOM_CODE_aboutForm
// END_CUSTOM_CODE_aboutForm
(function(parent) {
    var aboutForm1 = kendo.observable({
        openLink: function(url) {
            window.open(url, '_system');
            if (window.event) {
                window.event.preventDefault && window.event.preventDefault();
                window.event.returnValue = false;
            }
        },
        email : function(){
            console.log("here");
            return false;
        }
    });

    parent.set('aboutForm1', aboutForm1);
})(app.about);

// START_CUSTOM_CODE_aboutForm1
// END_CUSTOM_CODE_aboutForm1
