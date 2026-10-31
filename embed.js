(function() {
    if (window.ksRunnerInit) return;

    // This line gets patched up by the cloud
    var pxtConfig = {
    "relprefix": "/pxt-microbit-wom-sim/",
    "verprefix": "",
    "workerjs": "/pxt-microbit-wom-sim/worker.js",
    "monacoworkerjs": "/pxt-microbit-wom-sim/monacoworker.js",
    "gifworkerjs": "/pxt-microbit-wom-sim/gifjs/gif.worker.js",
    "serviceworkerjs": "/pxt-microbit-wom-sim/serviceworker.js",
    "typeScriptWorkerJs": "/pxt-microbit-wom-sim/tsworker.js",
    "pxtVersion": "13.0.1",
    "pxtRelId": "localDirRelId",
    "pxtCdnUrl": "/pxt-microbit-wom-sim/",
    "commitCdnUrl": "/pxt-microbit-wom-sim/",
    "blobCdnUrl": "/pxt-microbit-wom-sim/",
    "cdnUrl": "/pxt-microbit-wom-sim/",
    "targetVersion": "0.0.0",
    "targetRelId": "",
    "targetUrl": "",
    "targetId": "microbit",
    "simUrl": "/pxt-microbit-wom-sim/simulator.html",
    "simserviceworkerUrl": "/pxt-microbit-wom-sim/simulatorserviceworker.js",
    "simworkerconfigUrl": "/pxt-microbit-wom-sim/workerConfig.js",
    "partsUrl": "/pxt-microbit-wom-sim/siminstructions.html",
    "runUrl": "/pxt-microbit-wom-sim/run.html",
    "docsUrl": "/pxt-microbit-wom-sim/docs.html",
    "multiUrl": "/pxt-microbit-wom-sim/multi.html",
    "asseteditorUrl": "/pxt-microbit-wom-sim/asseteditor.html",
    "isStatic": true,
    "kioskUrl": "/pxt-microbit-wom-sim/kiosk.html",
    "teachertoolUrl": "/pxt-microbit-wom-sim/teachertool.html",
    "tutorialtoolUrl": "/pxt-microbit-wom-sim/tutorialtool.html",
    "skillmapUrl": "/pxt-microbit-wom-sim/skillmap.html",
    "multiplayerUrl": "/pxt-microbit-wom-sim/multiplayer.html",
    "authcodeUrl": "/pxt-microbit-wom-sim/authcode.html"
};

    var scripts = [
        "/pxt-microbit-wom-sim/highlight.js/highlight.pack.js",
        "/pxt-microbit-wom-sim/marked/marked.min.js",
    ]

    if (typeof jQuery == "undefined")
        scripts.unshift("/pxt-microbit-wom-sim/jquery.js")
    if (typeof jQuery == "undefined" || !jQuery.prototype.sidebar)
        scripts.push("/pxt-microbit-wom-sim/semantic.js")
    if (!window.pxtTargetBundle)
        scripts.push("/pxt-microbit-wom-sim/target.js");
    scripts.push("/pxt-microbit-wom-sim/pxtembed.js");

    var pxtCallbacks = []

    window.ksRunnerReady = function(f) {
        if (pxtCallbacks == null) f()
        else pxtCallbacks.push(f)
    }

    window.ksRunnerWhenLoaded = function() {
        pxt.docs.requireHighlightJs = function() { return hljs; }
        pxt.setupWebConfig(pxtConfig || window.pxtWebConfig)
        pxt.runner.setInitCallbacks(pxtCallbacks)
        pxtCallbacks.push(function() {
            pxtCallbacks = null
        })
        pxt.runner.init();
    }

    scripts.forEach(function(src) {
        var script = document.createElement('script');
        script.src = src;
        script.async = false;
        document.head.appendChild(script);
    })

} ())
