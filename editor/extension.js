"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../node_modules/pxt-core/localtypings/pxtarget.d.ts" />
/// <reference path="../node_modules/pxt-core/built/pxtcompiler.d.ts" />
/// <reference path="../node_modules/pxt-core/built/pxtlib.d.ts" />
/// <reference path="../node_modules/pxt-core/localtypings/pxteditor.d.ts" />
/// <reference path="dapjs.d.ts" />
const dialogs = require("./dialogs");
const flash = require("./flash");
const patch = require("./patch");
function applyGithubIoMasking() {
    var _a, _b, _c, _d;
    if (typeof window === "undefined" || !window.location)
        return;
    const isGithubIo = /github\.io$/i.test(window.location.hostname);
    if (!isGithubIo)
        return;
    // 1. Disable auth in pxt.auth so pxt.auth.hasIdentity() evaluates to false
    if ((_a = pxt.auth) === null || _a === void 0 ? void 0 : _a.enableAuth) {
        pxt.auth.enableAuth(false);
    }
    // 2. Clear identity flags in cloudProviders so identityProviders() returns empty
    if ((_c = (_b = pxt.appTarget) === null || _b === void 0 ? void 0 : _b.cloud) === null || _c === void 0 ? void 0 : _c.cloudProviders) {
        const providers = pxt.appTarget.cloud.cloudProviders;
        Object.keys(providers).forEach(id => {
            if (providers[id]) {
                providers[id].identity = false;
            }
        });
    }
    // 3. Remove help menu on github.io by emptying docMenu
    if ((_d = pxt.appTarget) === null || _d === void 0 ? void 0 : _d.appTheme) {
        pxt.appTarget.appTheme.docMenu = [];
    }
    // 4. Inject CSS safety rule to mask sign-in, profile, and help menu
    const styleId = "pxt-githubio-cloud-mask";
    if (typeof document !== "undefined" && !document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            #mainmenu .user-menu-item,
            #mainmenu .signin-button,
            #mainmenu .profile-dropdown,
            .user-profile,
            .signin-form,
            #docs-menuitem,
            .help-dropdown-menuitem,
            #mainmenu #docs-menuitem,
            #mainmenu .help-dropdown-menuitem {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }
}
// Run immediately when editor extension loads
applyGithubIoMasking();
pxt.editor.initExtensionsAsync = function (opts) {
    pxt.debug('loading microbit target extensions...');
    applyGithubIoMasking();
    const manyAny = Math;
    if (!manyAny.imul)
        manyAny.imul = function (a, b) {
            const ah = (a >>> 16) & 0xffff;
            const al = a & 0xffff;
            const bh = (b >>> 16) & 0xffff;
            const bl = b & 0xffff;
            // the shift by 0 fixes the sign on the high part
            // the final |0 converts the unsigned value into a signed value
            return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
        };
    const res = {
        hexFileImporters: []
    };
    pxt.usb.setFilters([{
            vendorId: 0x0D28,
            productId: 0x0204,
            classCode: 0xff,
            subclassCode: 0x03 // the ctrl pipe endpoint
        }, {
            vendorId: 0x0D28,
            productId: 0x0204,
            classCode: 0xff,
            subclassCode: 0x00 // the custom CMSIS2 endpoint
        }]);
    res.mkPacketIOWrapper = flash.mkDAPLinkPacketIOWrapper;
    res.blocklyPatch = patch.patchBlocks;
    res.showProgramTooLargeErrorAsync = dialogs.showProgramTooLargeErrorAsync;
    // Zero-backend share link handler: generate self-contained #project:<base64> link
    if (opts && opts.projectView) {
        const pv = opts.projectView;
        const origPublishAsync = pv.publishAsync ? pv.publishAsync.bind(pv) : null;
        pv.publishAsync = async function (name, description, screenshotUri, forceAnonymous) {
            var _a, _b, _c;
            try {
                if (name && ((_a = pv.state) === null || _a === void 0 ? void 0 : _a.projectName) !== name) {
                    await pv.updateHeaderNameAsync(name, description);
                }
                const base64 = await pv.exportAsync();
                const shareBase = ((_c = (_b = pxt.appTarget) === null || _b === void 0 ? void 0 : _b.appTheme) === null || _c === void 0 ? void 0 : _c.shareUrl) || (window.location.origin + window.location.pathname);
                const baseUrl = shareBase.replace(/\/$/, "");
                const shareUrl = `${baseUrl}/#project:${base64}`;
                return {
                    url: shareUrl,
                    embed: {
                        url: shareUrl,
                        editor: `<iframe src="${shareUrl}" width="100%" height="500" frameborder="0" sandbox="allow-popups allow-forms allow-scripts allow-same-origin"></iframe>`,
                        code: `<iframe src="${shareUrl}" width="100%" height="500" frameborder="0" sandbox="allow-popups allow-forms allow-scripts allow-same-origin"></iframe>`
                    }
                };
            }
            catch (err) {
                pxt.error("Failed to generate project share link", err);
                if (origPublishAsync)
                    return origPublishAsync(name, description, screenshotUri, forceAnonymous);
                return { url: "", embed: {}, error: err };
            }
        };
    }
    return Promise.resolve(res);
};
