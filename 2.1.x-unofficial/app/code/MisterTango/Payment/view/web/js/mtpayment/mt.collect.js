var mrTangoCollect = {
    button_id: 'MISTERTANGO_PAYMENT_BUTTON',
    app_key: '',
    recipient: '',
    payer: '',
    available_currency: ['EUR', 'SEK', 'PLN', 'RUB', 'NOK', 'DKK'],
    mt_url: "https://payment.mistertango.com/v1/collect",
    mt_fp: '',
    lang: 'lt',

    amount: 0,
    currency: 'EUR',
    description: '',

    custom: {},
    ws_id: '',
    socket: '',
    oldCssOverflowY: '',

    submit_scope: ['app_key', 'recipient', 'payer', 'amount', 'currency', 'description', 'ws_id', 'custom', 'payment_types', 'mt_fp', 'lang', 'payment_type_forced', 'payment_type_forced_params'],
    payment_types: [],

    payment_type_forced: '',
    payment_type_forced_params: [],

    widget2_recipients: ['info@greitai.lt', 'info@flysiesta.lv', 'info@bookinghouse.ee', 'info@eticket.fi', 'info@flyhi.fi', 'info@sauleta.lt'],

	//screen size
    width: 490,
    height: 600,

    loaded: false,
    initiated: false,

    pingTimeOut: 0,
    pingStartTimeOut: 0,

    _callback: function(){},

    load: function(_callback)
    {
        if (mrTangoCollect.loaded || mrTangoCollect.initiated)
            return;

        mrTangoCollect.initiated = true;

        mrTangoCollect.mt_fp = mt_helper.getCookie('mistertango_collect_mt_fp');

        if (mt_helper.isEmpty(mrTangoCollect.mt_fp))
        {
            mrTangoCollect.mt_fp = mt_fp.get();
            mt_helper.setCookie('mistertango_collect_mt_fp', mrTangoCollect.mt_fp, 365);
        }

        mrTangoCollect.ws_id = mt_helper.genID(20);

        var socket_script = document.createElement('script');
        socket_script.setAttribute("type","text/javascript");
        socket_script.src = 'https://payment.mistertango.com/resources/scripts/third/socket/socket.io-1.2.1.js';

        socket_script.onload = socket_script.onreadystatechange = function() {
            if ( (!this.readyState || this.readyState == 'complete') ){
                mrTangoCollect.loaded = true;
                mrTangoCollect._callback();
            }
        };

        document.body.appendChild(socket_script);

        //--- Lightbox

        mrTangoCollect.oldCssOverflowY = document.body.style.overflowY;

        var top = (screen.height/2)-(mrTangoCollect.height/1.5);

        document.head.insertAdjacentHTML('beforeend', '<style>' +
        '.mistertango_lightbox {' +
        'position: fixed;' +
        'top: 0;' +
        'left: 0;' +
        'width: 100%;' +
        'height: 100%;' +
        'background: rgba(0, 0, 0, 0.7);' +
        'text-align: center;' +
        'z-index: 10000;' +
        'display: none;' +
        'overflow-y: auto;' +
        '}' +
        '.mistertango_container {  ' +
        'box-shadow: 0 0 25px #111;' +
        '-webkit-box-shadow: 0 0 25px #111;' +
        '-moz-box-shadow: 0 0 25px #111;' +
        'background-color: white;' +
        'margin: auto;' +
        'max-width: '+mrTangoCollect.width+'px;' +
        'width: 100%;' +
        'max-height: '+mrTangoCollect.height+'px;' +
        'bottom: 0px;' +
        'top: 0px;' +
        'left: 0px;' +
        'right: 0px;' +
        'position: absolute;' +
        'border-radius: 6px;' +
        '}' +
        '@media screen and (max-device-width: 420px) {' +
            '.mistertango_container { ' +
                'width: 100%;' +
                'height: 99%;' +
            '}' +
        '}' +
        '</style>');



        var d1 = document.createElement("div");
        d1.setAttribute("class", "mistertango_lightbox");
        var d2 = document.createElement("div");
        d2.setAttribute("class", "mistertango_container");
        d1.appendChild(d2);
        document.body.appendChild(d1);
        if (!document.querySelector('meta[name="viewport"]')) {
            var meta = document.createElement("meta");
            meta.setAttribute('name', 'viewport');
            meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            document.getElementsByTagName('head')[0].appendChild(meta);
        }
        //--- End of Lightbox

        document.addEventListener("keyup", function(e) {
            if (e.keyCode == 27 && document.getElementsByClassName('mistertango_lightbox')[0].style.display == "block") { // Esc
                mrTangoCollect.onClosed();
                mrTangoCollect.closeLightbox();
            }
        });

    },

    init: function(recipient)
    {
        mrTangoCollect.load();

        if (!mt_helper.isEmpty(recipient))
        {
            mrTangoCollect.set.recipient(recipient);
        }

        document.getElementById(mrTangoCollect.button_id).addEventListener("click", function(){
            mrTangoCollect.submit();
        });

    },

    _ping: function()
    {
        clearTimeout(mrTangoCollect.pingStartTimeOut);
        mrTangoCollect.pingStartTimeOut = setTimeout(mrTangoCollect._ping, 5000);

        mrTangoCollect.pingTimeOut = setTimeout(function(){
            mrTangoCollect.socket.emit('subscribe', {chan: 'collect-'+mrTangoCollect.ws_id});
        }, 3000);

        mrTangoCollect.socket.emit('ping', { chan: 'collect-'+mrTangoCollect.ws_id});
    },

    submit: function(amount, currency, description)
    {
        if (!mrTangoCollect.loaded){
            mrTangoCollect._callback = function(){mrTangoCollect.submit(amount, currency, description);}
            return mrTangoCollect.load();
        }

        if (!mt_helper.isEmpty(amount))
        {
            mrTangoCollect.set.amount(amount);
            mrTangoCollect.set.currency(currency || mrTangoCollect.currency);
            mrTangoCollect.set.description(description || '');
        }

        //--- old version
        if (mrTangoCollect.widget2_recipients.indexOf(mrTangoCollect.recipient) >= 0)
            mrTangoCollect.mt_url = 'https://payment.mistertango.com/v2/collect';

        //---- Lightbox
        var uri = '';
        mrTangoCollect.submit_scope.forEach(function(scope){
            uri += (uri.length ? '&' : '?');

            if (typeof mrTangoCollect[scope] == 'object')
                uri += scope+'='+ encodeURIComponent(JSON.stringify(mrTangoCollect[scope]));
            else
                uri += scope+'='+encodeURIComponent(mrTangoCollect[scope]);
        });

        document.body.style.overflowY = 'hidden';

        while( document.getElementsByClassName('mistertango_container')[0].hasChildNodes() ){
            document.getElementsByClassName('mistertango_container')[0].removeChild(document.getElementsByClassName('mistertango_container')[0].lastChild);
        }

        document.getElementsByClassName('mistertango_container')[0].insertAdjacentHTML('beforeend', '<iframe src="'+mrTangoCollect.mt_url+uri+'" style="width:100%; height: 100%; border: 0px; border-radius: 6px;"></iframe>');
        document.getElementsByClassName('mistertango_lightbox')[0].style.display = 'block';

        //---- End of Lightbox


        if (typeof mrTangoCollect.socket !== 'object')
        {
            mrTangoCollect.socket = io('https://pusher.mistertango.com');
        }


        if (typeof mrTangoCollect.socket._callbacks['collect-'+mrTangoCollect.ws_id] == 'undefined')
        {
            mrTangoCollect.socket.emit('subscribe', {chan: 'collect-'+mrTangoCollect.ws_id});
            mrTangoCollect._ping();

            mrTangoCollect.socket.on('collect-'+mrTangoCollect.ws_id, function (response) {
                if (response.order.ws_id != mrTangoCollect.ws_id)
                    return;

                switch (response.type)
                {
                    case 'PAYMENT':
                        switch (response.status)
                        {
                            case 'PAID':
                                mrTangoCollect.onSuccess(response);
                                break;

                            case 'NOT_PAID':
                                break;

                            case 'OFFLINE':
                                mrTangoCollect.onOffLinePayment(response);
                                break;

                            default:
                                mrTangoCollect.onError(response);

                        }
                        break;
                    case 'WINDOW_STATUS':
                        switch (response.status)
                        {
                            case 'OPENED':
                                mrTangoCollect.onOpened(response);
                                break;

                            case 'CLOSED':
                                mrTangoCollect.onClosed(response);
                                mrTangoCollect.closeLightbox();
                                break;
                        }
                        break;
                    case 'PING':
                        clearTimeout(mrTangoCollect.pingTimeOut);
                        break;

                }
            });
        }

    },

    set: {
        app_key: function(app_key)
        {
            mrTangoCollect.app_key = app_key;
        },

        recipient: function(recipient)
        {
            mrTangoCollect.recipient = recipient;
        },

        amount: function(amount)
        {
            mrTangoCollect.amount = amount;
        },

        currency: function(currency)
        {
            if (mrTangoCollect.available_currency.indexOf(currency) !== -1)
                mrTangoCollect.currency = currency;
        },

        description: function(description)
        {
            mrTangoCollect.description = description;
        },

        payer: function(payer)
        {
            mrTangoCollect.payer = payer;
        },

        payment_types: function(payment_types)
        {
            mrTangoCollect.payment_types = payment_types;
        },

	    payment_type_forced: function(payment_type)
	    {
		    mrTangoCollect.payment_type_forced = payment_type;
	    },

	    payment_type_forced_params: function(params)
	    {
		    mrTangoCollect.payment_type_forced_params = params;
	    },

	    lang: function(lang)
        {
            mrTangoCollect.lang = lang;
        },

        custom: function(custom)
        {
            mrTangoCollect.custom = custom;
        }
    },

    onSuccess: function(response)
    {

    },

    onError: function(response)
    {

    },

    onOffLinePayment: function(response)
    {

    },

    onOpened: function()
    {

    },

    onClosed: function()
    {

    },

    closeLightbox: function()
    {
        //---- Lightbox

        document.body.style.overflowY = mrTangoCollect.oldCssOverflowY;
        document.getElementsByClassName('mistertango_lightbox')[0].style.display = 'none';

        //---- End of Lightbox
    }
};

//Deprecated
var collect = (typeof collect == "undefined" ? mrTangoCollect : collect);

var mt_helper = {
    create_element: function(element, type, name, value)
    {
        var eField = document.createElement(element);
        eField.setAttribute("type", type);
        eField.setAttribute("name", name);
        eField.setAttribute("value", value);

        return eField;
    },

    isEmpty: function(str)
    {
        if (str == undefined)
            return true;

        if (typeof str === 'string')
            return (str.length === 0 || !str.trim());

        if (typeof str === 'number')
            return (str === 0);
    },

    genID: function(iLen)
    {
        iLen = (iLen == undefined ? 10 : iLen);
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < iLen; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },

    getCookie: function(cname)
    {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++)
        {
            var c = ca[i];

            while (c.charAt(0)==' ') c = c.substring(1);

            if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
        }
        return "";
    },

    setCookie: function(cname, cvalue, exdays)
    {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }
};





if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {
        var k;
        if (this == null) {
            throw new TypeError("'this' is null or undefined");
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = +fromIndex || 0;
        if (Math.abs(n) === Infinity) {
            n = 0;
        }
        if (n >= len) {
            return -1;
        }
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        while (k < len) {
            if (k in O && O[k] === searchElement) {
                return k;
            }
            k++;
        }
        return -1;
    };
}

var mt_fp = function() {
    this.nativeForEach = Array.prototype.forEach;
    this.nativeMap = Array.prototype.map;
};

var mt_fp = {

    get: function(){
        var keys = [];
        keys = this.userAgentKey(keys);
        keys = this.languageKey(keys);
        keys = this.sessionStorageKey(keys);
        keys = this.localStorageKey(keys);
        keys = this.indexedDbKey(keys);
        keys = this.addBehaviorKey(keys);
        keys = this.openDatabaseKey(keys);
        keys = this.cpuClassKey(keys);
        keys = this.platformKey(keys);
        keys = this.doNotTrackKey(keys);
        keys = this.pluginsKey(keys);
        keys = this.hasLiedOsKey(keys);
        keys = this.hasLiedBrowserKey(keys);
        keys = this.touchSupportKey(keys);
        keys = this.canvasKey(keys);
        keys = this.webglKey(keys);

        var that = this;

        var murmur = that.x64hash128(keys.join("~~~"), 31);
        return murmur;

    },
    userAgentKey: function(keys) {
        keys.push(navigator.userAgent);
        return keys;
    },
    languageKey: function(keys) {
        keys.push(navigator.language);
        return keys;
    },
    sessionStorageKey: function(keys) {
        if(this.hasSessionStorage()) {
            keys.push("sessionStorageKey");
        }
        return keys;
    },
    localStorageKey: function(keys) {
        if(this.hasLocalStorage()) {
            keys.push("localStorageKey");
        }
        return keys;
    },
    indexedDbKey: function(keys) {
        if(this.hasIndexedDB()) {
            keys.push("indexedDbKey");
        }
        return keys;
    },
    addBehaviorKey: function(keys) {
        //body might not be defined at this point or removed programmatically
        if(document.body && document.body.addBehavior) {
            keys.push("addBehaviorKey");
        }
        return keys;
    },
    openDatabaseKey: function(keys) {
        if(window.openDatabase) {
            keys.push("openDatabase");
        }
        return keys;
    },
    cpuClassKey: function(keys) {
        keys.push(this.getNavigatorCpuClass());
        return keys;
    },
    platformKey: function(keys) {
        keys.push(this.getNavigatorPlatform());
        return keys;
    },
    doNotTrackKey: function(keys) {
        keys.push(this.getDoNotTrack());
        return keys;
    },
    hasLiedOsKey: function(keys){
        keys.push(this.getHasLiedOs());
        return keys;
    },
    hasLiedBrowserKey: function(keys){
        keys.push(this.getHasLiedBrowser());
        return keys;
    },
    // kudos to http://www.lalit.org/lab/javascript-css-font-detect/
    pluginsKey: function(keys) {
        if(this.isIE()){
            keys.push(this.getIEPluginsString());
        } else {
            keys.push(this.getRegularPluginsString());
        }
        return keys;
    },
    getRegularPluginsString: function () {
        return this.map(navigator.plugins, function (p) {
            var mimeTypes = this.map(p, function(mt){
                return [mt.type, mt.suffixes].join("~");
            }).join(",");
            return [p.name, p.description, mimeTypes].join("::");
        }, this).join(";");
    },
    getIEPluginsString: function () {
        if(window.ActiveXObject){
            var names = [
                "AcroPDF.PDF", // Adobe PDF reader 7+
                "Adodb.Stream",
                "AgControl.AgControl", // Silverlight
                "DevalVRXCtrl.DevalVRXCtrl.1",
                "MacromediaFlashPaper.MacromediaFlashPaper",
                "Msxml2.DOMDocument",
                "Msxml2.XMLHTTP",
                "PDF.PdfCtrl", // Adobe PDF reader 6 and earlier, brrr
                "QuickTime.QuickTime", // QuickTime
                "QuickTimeCheckObject.QuickTimeCheck.1",
                "RealPlayer",
                "RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)",
                "RealVideo.RealVideo(tm) ActiveX Control (32-bit)",
                "Scripting.Dictionary",
                "SWCtl.SWCtl", // ShockWave player
                "Shell.UIHelper",
                "ShockwaveFlash.ShockwaveFlash", //flash plugin
                "Skype.Detection",
                "TDCCtl.TDCCtl",
                "WMPlayer.OCX", // Windows media player
                "rmocx.RealPlayer G2 Control",
                "rmocx.RealPlayer G2 Control.1"
            ];
            // starting to detect plugins in IE
            return this.map(names, function(name){
                try{
                    new ActiveXObject(name); // eslint-disable-no-new
                    return name;
                } catch(e){
                    return null;
                }
            }).join(";");
        } else {
            return "";
        }
    },
    touchSupportKey: function (keys) {
        keys.push(this.getTouchSupport());
        return keys;
    },
    hasSessionStorage: function () {
        try {
            return !!window.sessionStorage;
        } catch(e) {
            return true; // SecurityError when referencing it means it exists
        }
    },
    // https://bugzilla.mozilla.org/show_bug.cgi?id=781447
    hasLocalStorage: function () {
        try {
            return !!window.localStorage;
        } catch(e) {
            return true; // SecurityError when referencing it means it exists
        }
    },
    hasIndexedDB: function (){
        return !!window.indexedDB;
    },
    getNavigatorCpuClass: function () {
        if(navigator.cpuClass){
            return "navigatorCpuClass: " + navigator.cpuClass;
        } else {
            return "navigatorCpuClass: unknown";
        }
    },
    getNavigatorPlatform: function () {
        if(navigator.platform) {
            return "navigatorPlatform: " + navigator.platform;
        } else {
            return "navigatorPlatform: unknown";
        }
    },
    getDoNotTrack: function () {
        if(navigator.doNotTrack) {
            return "doNotTrack: " + navigator.doNotTrack;
        } else {
            return "doNotTrack: unknown";
        }
    },
    canvasKey: function(keys) {
        if(this.isCanvasSupported()) {
            keys.push(this.getCanvasFp());
        }
        return keys;
    },
    webglKey: function(keys) {
        if(this.isCanvasSupported()) {
            keys.push(this.getWebglFp());
        }
        return keys;
    },

    getCanvasFp: function() {
        var result = [];
        // Very simple now, need to make it more complex (geo shapes etc)
        var canvas = document.createElement("canvas");
        canvas.width = 2000;
        canvas.height = 200;
        canvas.style.display = "inline";
        var ctx = canvas.getContext("2d");
        // detect browser support of canvas blending
        // http://blogs.adobe.com/webplatform/2013/01/28/blending-features-in-canvas/
        // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/canvas/blending.js
        // https://securehomes.esat.kuleuven.be/~gacar/persistent/the_web_never_forgets.pdf
        try {
            ctx.globalCompositeOperation = "screen";
        } catch (e) { /* squelch */ }
        result.push("canvas blending:" + ((ctx.globalCompositeOperation === "screen") ? "yes" : "no"));

        // detect browser support of canvas winding
        // http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
        // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/canvas/winding.js
        ctx.rect(0, 0, 10, 10);
        ctx.rect(2, 2, 6, 6);
        result.push("canvas winding:" + ((ctx.isPointInPath(5, 5, "evenodd") === false) ? "yes" : "no"));

        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.font = "11pt no-real-font-123";
        ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.font = "18pt Arial";
        ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 4, 45);

        // canvas blending
        // http://blogs.adobe.com/webplatform/2013/01/28/blending-features-in-canvas/
        // http://jsfiddle.net/NDYV8/16/
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = "rgb(255,0,255)";
        ctx.beginPath();
        ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgb(0,255,255)";
        ctx.beginPath();
        ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgb(255,255,0)";
        ctx.beginPath();
        ctx.arc(75, 100, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgb(255,0,255)";
        // canvas winding
        // http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
        // http://jsfiddle.net/NDYV8/19/
        ctx.arc(75, 75, 75, 0, Math.PI * 2, true);
        ctx.arc(75, 75, 25, 0, Math.PI * 2, true);
        ctx.fill("evenodd");

        result.push("canvas fp:" + canvas.toDataURL());
        return result.join("~");
    },

    getWebglFp: function() {
        var gl;
        var fa2s = function(fa) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            return "[" + fa[0] + ", " + fa[1] + "]";
        };
        var maxAnisotropy = function(gl) {
            var anisotropy, ext = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || gl.getExtension("MOZ_EXT_texture_filter_anisotropic");
            return ext ? (anisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT), 0 === anisotropy && (anisotropy = 2), anisotropy) : null;
        };
        gl = this.getWebglCanvas();
        if(!gl) { return null; }
        // WebGL fingerprinting is a combination of techniques, found in MaxMind antifraud script & Augur fingerprinting.
        // First it draws a gradient object with shaders and convers the image to the Base64 string.
        // Then it enumerates all WebGL extensions & capabilities and appends them to the Base64 string, resulting in a huge WebGL string, potentially very unique on each device
        // Since iOS supports webgl starting from version 8.1 and 8.1 runs on several graphics chips, the results may be different across ios devices, but we need to verify it.
        var result = [];
        var vShaderTemplate = "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}";
        var fShaderTemplate = "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}";
        var vertexPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
        var vertices = new Float32Array([-.2, -.9, 0, .4, -.26, 0, 0, .732134444, 0]);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        vertexPosBuffer.itemSize = 3;
        vertexPosBuffer.numItems = 3;
        var program = gl.createProgram(), vshader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vshader, vShaderTemplate);
        gl.compileShader(vshader);
        var fshader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fshader, fShaderTemplate);
        gl.compileShader(fshader);
        gl.attachShader(program, vshader);
        gl.attachShader(program, fshader);
        gl.linkProgram(program);
        gl.useProgram(program);
        program.vertexPosAttrib = gl.getAttribLocation(program, "attrVertex");
        program.offsetUniform = gl.getUniformLocation(program, "uniformOffset");
        gl.enableVertexAttribArray(program.vertexPosArray);
        gl.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, !1, 0, 0);
        gl.uniform2f(program.offsetUniform, 1, 1);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems);
        if (gl.canvas != null) { result.push(gl.canvas.toDataURL()); }
        result.push("extensions:" + gl.getSupportedExtensions().join(";"));
        result.push("webgl aliased line width range:" + fa2s(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)));
        result.push("webgl aliased point size range:" + fa2s(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)));
        result.push("webgl alpha bits:" + gl.getParameter(gl.ALPHA_BITS));
        result.push("webgl antialiasing:" + (gl.getContextAttributes().antialias ? "yes" : "no"));
        result.push("webgl blue bits:" + gl.getParameter(gl.BLUE_BITS));
        result.push("webgl depth bits:" + gl.getParameter(gl.DEPTH_BITS));
        result.push("webgl green bits:" + gl.getParameter(gl.GREEN_BITS));
        result.push("webgl max anisotropy:" + maxAnisotropy(gl));
        result.push("webgl max combined texture image units:" + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
        result.push("webgl max cube map texture size:" + gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE));
        result.push("webgl max fragment uniform vectors:" + gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS));
        result.push("webgl max render buffer size:" + gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
        result.push("webgl max texture image units:" + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
        result.push("webgl max texture size:" + gl.getParameter(gl.MAX_TEXTURE_SIZE));
        result.push("webgl max varying vectors:" + gl.getParameter(gl.MAX_VARYING_VECTORS));
        result.push("webgl max vertex attribs:" + gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
        result.push("webgl max vertex texture image units:" + gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
        result.push("webgl max vertex uniform vectors:" + gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS));
        result.push("webgl max viewport dims:" + fa2s(gl.getParameter(gl.MAX_VIEWPORT_DIMS)));
        result.push("webgl red bits:" + gl.getParameter(gl.RED_BITS));
        result.push("webgl renderer:" + gl.getParameter(gl.RENDERER));
        result.push("webgl shading language version:" + gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
        result.push("webgl stencil bits:" + gl.getParameter(gl.STENCIL_BITS));
        result.push("webgl vendor:" + gl.getParameter(gl.VENDOR));
        result.push("webgl version:" + gl.getParameter(gl.VERSION));
        result.push("webgl vertex shader high float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT ).precision);
        result.push("webgl vertex shader high float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT ).rangeMin);
        result.push("webgl vertex shader high float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT ).rangeMax);
        result.push("webgl vertex shader medium float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT ).precision);
        result.push("webgl vertex shader medium float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT ).rangeMin);
        result.push("webgl vertex shader medium float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT ).rangeMax);
        result.push("webgl vertex shader low float precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT ).precision);
        result.push("webgl vertex shader low float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT ).rangeMin);
        result.push("webgl vertex shader low float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT ).rangeMax);
        result.push("webgl fragment shader high float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).precision);
        result.push("webgl fragment shader high float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).rangeMin);
        result.push("webgl fragment shader high float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).rangeMax);
        result.push("webgl fragment shader medium float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT ).precision);
        result.push("webgl fragment shader medium float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT ).rangeMin);
        result.push("webgl fragment shader medium float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT ).rangeMax);
        result.push("webgl fragment shader low float precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT ).precision);
        result.push("webgl fragment shader low float precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT ).rangeMin);
        result.push("webgl fragment shader low float precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT ).rangeMax);
        result.push("webgl vertex shader high int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT ).precision);
        result.push("webgl vertex shader high int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT ).rangeMin);
        result.push("webgl vertex shader high int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT ).rangeMax);
        result.push("webgl vertex shader medium int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT ).precision);
        result.push("webgl vertex shader medium int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT ).rangeMin);
        result.push("webgl vertex shader medium int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT ).rangeMax);
        result.push("webgl vertex shader low int precision:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT ).precision);
        result.push("webgl vertex shader low int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT ).rangeMin);
        result.push("webgl vertex shader low int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT ).rangeMax);
        result.push("webgl fragment shader high int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT ).precision);
        result.push("webgl fragment shader high int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT ).rangeMin);
        result.push("webgl fragment shader high int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT ).rangeMax);
        result.push("webgl fragment shader medium int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT ).precision);
        result.push("webgl fragment shader medium int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT ).rangeMin);
        result.push("webgl fragment shader medium int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT ).rangeMax);
        result.push("webgl fragment shader low int precision:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT ).precision);
        result.push("webgl fragment shader low int precision rangeMin:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT ).rangeMin);
        result.push("webgl fragment shader low int precision rangeMax:" + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT ).rangeMax);
        return result.join("~");
    },

    // This is a crude and primitive touch screen detection.
    // It's not possible to currently reliably detect the  availability of a touch screen
    // with a JS, without actually subscribing to a touch event.
    // http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
    // https://github.com/Modernizr/Modernizr/issues/548
    // method returns an array of 3 values:
    // maxTouchPoints, the success or failure of creating a TouchEvent,
    // and the availability of the 'ontouchstart' property
    getTouchSupport: function () {
        var maxTouchPoints = 0;
        var touchEvent = false;
        if(typeof navigator.maxTouchPoints !== "undefined") {
            maxTouchPoints = navigator.maxTouchPoints;
        } else if (typeof navigator.msMaxTouchPoints !== "undefined") {
            maxTouchPoints = navigator.msMaxTouchPoints;
        }
        try {
            document.createEvent("TouchEvent");
            touchEvent = true;
        } catch(_) { /* squelch */ }
        var touchStart = "ontouchstart" in window;
        return [maxTouchPoints, touchEvent, touchStart];
    },

    getHasLiedOs: function(){
        var userAgent = navigator.userAgent;
        var oscpu = navigator.oscpu;
        var platform = navigator.platform;
        var os;
        //We extract the OS from the user agent (respect the order of the if else if statement)
        if(userAgent.toLowerCase().indexOf("windows phone") >= 0){
            os = "Windows Phone";
        } else if(userAgent.toLowerCase().indexOf("win") >= 0){
            os = "Windows";
        } else if(userAgent.toLowerCase().indexOf("android") >= 0){
            os = "Android";
        } else if(userAgent.toLowerCase().indexOf("linux") >= 0){
            os = "Linux";
        } else if(userAgent.toLowerCase().indexOf("iPhone") >= 0 || userAgent.toLowerCase().indexOf("iPad") >= 0 ){
            os = "iOS";
        } else if(userAgent.toLowerCase().indexOf("mac") >= 0){
            os = "Mac";
        } else{
            os = "Other";
        }
        // We detect if the person uses a mobile device
        var mobileDevice;
        if (("ontouchstart" in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0)) {
            mobileDevice = true;
        } else{
            mobileDevice = false;
        }

        if(mobileDevice && os !== "Windows Phone" && os !== "Android" && os !== "iOS" && os !== "Other"){
            return true;
        }

        // We compare oscpu with the OS extracted from the UA
        if(typeof oscpu !== "undefined"){
            if(oscpu.toLowerCase().indexOf("win") >= 0 && os !== "Windows" && os !== "Windows Phone"){
                return true;
            } else if(oscpu.toLowerCase().indexOf("linux") >= 0 && os !== "Linux" && os !== "Android"){
                return true;
            } else if(oscpu.toLowerCase().indexOf("mac") >= 0 && os !== "Mac" && os !== "iOS"){
                return true;
            } else if(oscpu.toLowerCase().indexOf("win") === 0 && oscpu.toLowerCase().indexOf("linux") === 0 && oscpu.toLowerCase().indexOf("mac") >= 0 && os !== "other"){
                return true;
            }
        }

        //We compare platform with the OS extracted from the UA
        if(platform.toLowerCase().indexOf("win") >= 0 && os !== "Windows" && os !== "Windows Phone"){
            return true;
        } else if((platform.toLowerCase().indexOf("linux") >= 0 || platform.toLowerCase().indexOf("android") >= 0 || platform.toLowerCase().indexOf("pike") >= 0) && os !== "Linux" && os !== "Android"){
            return true;
        } else if((platform.toLowerCase().indexOf("mac") >= 0 || platform.toLowerCase().indexOf("ipad") >= 0 || platform.toLowerCase().indexOf("ipod") >= 0 || platform.toLowerCase().indexOf("iphone") >= 0) && os !== "Mac" && os !== "iOS"){
            return true;
        } else if(platform.toLowerCase().indexOf("win") === 0 && platform.toLowerCase().indexOf("linux") === 0 && platform.toLowerCase().indexOf("mac") >= 0 && os !== "other"){
            return true;
        }

        if(typeof navigator.plugins === "undefined" && os !== "Windows" && os !== "Windows Phone"){
            //We are are in the case where the person uses ie, therefore we can infer that it's windows
            return true;
        }

        return false;
    },
    getHasLiedBrowser: function () {
        var userAgent = navigator.userAgent;
        var productSub = navigator.productSub;

        //we extract the browser from the user agent (respect the order of the tests)
        var browser;
        if(userAgent.toLowerCase().indexOf("firefox") >= 0){
            browser = "Firefox";
        } else if(userAgent.toLowerCase().indexOf("opera") >= 0 || userAgent.toLowerCase().indexOf("opr") >= 0){
            browser = "Opera";
        } else if(userAgent.toLowerCase().indexOf("chrome") >= 0){
            browser = "Chrome";
        } else if(userAgent.toLowerCase().indexOf("safari") >= 0){
            browser = "Safari";
        } else if(userAgent.toLowerCase().indexOf("trident") >= 0){
            browser = "Internet Explorer";
        } else{
            browser = "Other";
        }

        if((browser === "Chrome" || browser === "Safari" || browser === "Opera") && productSub !== "20030107"){
            return true;
        }

        var tempRes = eval.toString().length;
        if(tempRes === 37 && browser !== "Safari" && browser !== "Firefox" && browser !== "Other"){
            return true;
        } else if(tempRes === 39 && browser !== "Internet Explorer" && browser !== "Other"){
            return true;
        } else if(tempRes === 33 && browser !== "Chrome" && browser !== "Opera" && browser !== "Other"){
            return true;
        }

        //We create an error to see how it is handled
        var errFirefox;
        try {
            throw "a";
        } catch(err){
            try{
                err.toSource();
                errFirefox = true;
            } catch(errOfErr){
                errFirefox = false;
            }
        }
        if(errFirefox && browser !== "Firefox" && browser !== "Other"){
            return true;
        }
        return false;
    },
    isCanvasSupported: function () {
        var elem = document.createElement("canvas");
        return !!(elem.getContext && elem.getContext("2d"));
    },
    isIE: function () {
        if(navigator.appName === "Microsoft Internet Explorer") {
            return true;
        } else if(navigator.appName === "Netscape" && /Trident/.test(navigator.userAgent)) { // IE 11
            return true;
        }
        return false;
    },
    getWebglCanvas: function() {
        var canvas = document.createElement("canvas");
        var gl = null;
        try {
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        } catch(e) { /* squelch */ }
        if (!gl) { gl = null; }
        return gl;
    },

    each: function (obj, iterator, context) {
        if (obj === null) {
            return;
        }
        if (this.nativeForEach && obj.forEach === this.nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (iterator.call(context, obj[i], i, obj) === {}) { return; }
            }
        } else {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (iterator.call(context, obj[key], key, obj) === {}) { return; }
                }
            }
        }
    },

    map: function(obj, iterator, context) {
        var results = [];
        // Not using strict equality so that this acts as a
        // shortcut to checking for `null` and `undefined`.
        if (obj == null) { return results; }
        if (this.nativeMap && obj.map === this.nativeMap) { return obj.map(iterator, context); }
        this.each(obj, function(value, index, list) {
            results[results.length] = iterator.call(context, value, index, list);
        });
        return results;
    },

    /// MurmurHash3 related functions

    //
    // Given two 64bit ints (as an array of two 32bit ints) returns the two
    // added together as a 64bit int (as an array of two 32bit ints).
    //
    x64Add: function(m, n) {
        m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
        n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
        var o = [0, 0, 0, 0];
        o[3] += m[3] + n[3];
        o[2] += o[3] >>> 16;
        o[3] &= 0xffff;
        o[2] += m[2] + n[2];
        o[1] += o[2] >>> 16;
        o[2] &= 0xffff;
        o[1] += m[1] + n[1];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[0] += m[0] + n[0];
        o[0] &= 0xffff;
        return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
    },

    //
    // Given two 64bit ints (as an array of two 32bit ints) returns the two
    // multiplied together as a 64bit int (as an array of two 32bit ints).
    //
    x64Multiply: function(m, n) {
        m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
        n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
        var o = [0, 0, 0, 0];
        o[3] += m[3] * n[3];
        o[2] += o[3] >>> 16;
        o[3] &= 0xffff;
        o[2] += m[2] * n[3];
        o[1] += o[2] >>> 16;
        o[2] &= 0xffff;
        o[2] += m[3] * n[2];
        o[1] += o[2] >>> 16;
        o[2] &= 0xffff;
        o[1] += m[1] * n[3];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[1] += m[2] * n[2];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[1] += m[3] * n[1];
        o[0] += o[1] >>> 16;
        o[1] &= 0xffff;
        o[0] += (m[0] * n[3]) + (m[1] * n[2]) + (m[2] * n[1]) + (m[3] * n[0]);
        o[0] &= 0xffff;
        return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
    },
    //
    // Given a 64bit int (as an array of two 32bit ints) and an int
    // representing a number of bit positions, returns the 64bit int (as an
    // array of two 32bit ints) rotated left by that number of positions.
    //
    x64Rotl: function(m, n) {
        n %= 64;
        if (n === 32) {
            return [m[1], m[0]];
        }
        else if (n < 32) {
            return [(m[0] << n) | (m[1] >>> (32 - n)), (m[1] << n) | (m[0] >>> (32 - n))];
        }
        else {
            n -= 32;
            return [(m[1] << n) | (m[0] >>> (32 - n)), (m[0] << n) | (m[1] >>> (32 - n))];
        }
    },
    //
    // Given a 64bit int (as an array of two 32bit ints) and an int
    // representing a number of bit positions, returns the 64bit int (as an
    // array of two 32bit ints) shifted left by that number of positions.
    //
    x64LeftShift: function(m, n) {
        n %= 64;
        if (n === 0) {
            return m;
        }
        else if (n < 32) {
            return [(m[0] << n) | (m[1] >>> (32 - n)), m[1] << n];
        }
        else {
            return [m[1] << (n - 32), 0];
        }
    },
    //
    // Given two 64bit ints (as an array of two 32bit ints) returns the two
    // xored together as a 64bit int (as an array of two 32bit ints).
    //
    x64Xor: function(m, n) {
        return [m[0] ^ n[0], m[1] ^ n[1]];
    },
    //
    // Given a block, returns murmurHash3's final x64 mix of that block.
    // (`[0, h[0] >>> 1]` is a 33 bit unsigned right shift. This is the
    // only place where we need to right shift 64bit ints.)
    //
    x64Fmix: function(h) {
        h = this.x64Xor(h, [0, h[0] >>> 1]);
        h = this.x64Multiply(h, [0xff51afd7, 0xed558ccd]);
        h = this.x64Xor(h, [0, h[0] >>> 1]);
        h = this.x64Multiply(h, [0xc4ceb9fe, 0x1a85ec53]);
        h = this.x64Xor(h, [0, h[0] >>> 1]);
        return h;
    },

    //
    // Given a string and an optional seed as an int, returns a 128 bit
    // hash using the x64 flavor of MurmurHash3, as an unsigned hex.
    //
    x64hash128: function (key, seed) {
        key = key || "";
        seed = seed || 0;
        var remainder = key.length % 16;
        var bytes = key.length - remainder;
        var h1 = [0, seed];
        var h2 = [0, seed];
        var k1 = [0, 0];
        var k2 = [0, 0];
        var c1 = [0x87c37b91, 0x114253d5];
        var c2 = [0x4cf5ad43, 0x2745937f];
        for (var i = 0; i < bytes; i = i + 16) {
            k1 = [((key.charCodeAt(i + 4) & 0xff)) | ((key.charCodeAt(i + 5) & 0xff) << 8) | ((key.charCodeAt(i + 6) & 0xff) << 16) | ((key.charCodeAt(i + 7) & 0xff) << 24), ((key.charCodeAt(i) & 0xff)) | ((key.charCodeAt(i + 1) & 0xff) << 8) | ((key.charCodeAt(i + 2) & 0xff) << 16) | ((key.charCodeAt(i + 3) & 0xff) << 24)];
            k2 = [((key.charCodeAt(i + 12) & 0xff)) | ((key.charCodeAt(i + 13) & 0xff) << 8) | ((key.charCodeAt(i + 14) & 0xff) << 16) | ((key.charCodeAt(i + 15) & 0xff) << 24), ((key.charCodeAt(i + 8) & 0xff)) | ((key.charCodeAt(i + 9) & 0xff) << 8) | ((key.charCodeAt(i + 10) & 0xff) << 16) | ((key.charCodeAt(i + 11) & 0xff) << 24)];
            k1 = this.x64Multiply(k1, c1);
            k1 = this.x64Rotl(k1, 31);
            k1 = this.x64Multiply(k1, c2);
            h1 = this.x64Xor(h1, k1);
            h1 = this.x64Rotl(h1, 27);
            h1 = this.x64Add(h1, h2);
            h1 = this.x64Add(this.x64Multiply(h1, [0, 5]), [0, 0x52dce729]);
            k2 = this.x64Multiply(k2, c2);
            k2 = this.x64Rotl(k2, 33);
            k2 = this.x64Multiply(k2, c1);
            h2 = this.x64Xor(h2, k2);
            h2 = this.x64Rotl(h2, 31);
            h2 = this.x64Add(h2, h1);
            h2 = this.x64Add(this.x64Multiply(h2, [0, 5]), [0, 0x38495ab5]);
        }
        k1 = [0, 0];
        k2 = [0, 0];
        switch(remainder) {
            case 15:
                k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 14)], 48));
            case 14:
                k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 13)], 40));
            case 13:
                k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 12)], 32));
            case 12:
                k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 11)], 24));
            case 11:
                k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 10)], 16));
            case 10:
                k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 9)], 8));
            case 9:
                k2 = this.x64Xor(k2, [0, key.charCodeAt(i + 8)]);
                k2 = this.x64Multiply(k2, c2);
                k2 = this.x64Rotl(k2, 33);
                k2 = this.x64Multiply(k2, c1);
                h2 = this.x64Xor(h2, k2);
            case 8:
                k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 7)], 56));
            case 7:
                k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 6)], 48));
            case 6:
                k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 5)], 40));
            case 5:
                k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 4)], 32));
            case 4:
                k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 3)], 24));
            case 3:
                k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 2)], 16));
            case 2:
                k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 1)], 8));
            case 1:
                k1 = this.x64Xor(k1, [0, key.charCodeAt(i)]);
                k1 = this.x64Multiply(k1, c1);
                k1 = this.x64Rotl(k1, 31);
                k1 = this.x64Multiply(k1, c2);
                h1 = this.x64Xor(h1, k1);
        }
        h1 = this.x64Xor(h1, [0, key.length]);
        h2 = this.x64Xor(h2, [0, key.length]);
        h1 = this.x64Add(h1, h2);
        h2 = this.x64Add(h2, h1);
        h1 = this.x64Fmix(h1);
        h2 = this.x64Fmix(h2);
        h1 = this.x64Add(h1, h2);
        h2 = this.x64Add(h2, h1);
        return ("00000000" + (h1[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h1[1] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[1] >>> 0).toString(16)).slice(-8);
    }
};

