(function (global) {
    var app = global.app = global.app || {};

    app.config = {
        rollbase : {
            serviceURI : "https://www.rollbase.com/rest/jsdo/",
            serviceURI_json : "https://www.rollbase.com/rest/api/",
            user : 'mhossain@168407119',
            password : 'Eu38Et11',
            custId : '168407119'
        },
        nodeApp:{
            qrCode : "http://nextapp-56629.onmodulus.net/api/qrcode",
            vCard: "https://nextapp-56629.onmodulus.net/api/vcard",
            tweets: "http://nextapp-56629.onmodulus.net/api/tweets",
            session: "http://nextapp-56629.onmodulus.net/api/session"
        },
        google: {
            projectNumber : '951550417192'
        }
    };
})(window);
