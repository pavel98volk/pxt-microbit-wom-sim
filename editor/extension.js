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
const COMPAT_EXTENSIONS = {
    "Module-World": "github:YahboomTechnology/Module-World#main",
    "module_world_color": "github:YahboomTechnology/module_world_color#main",
    "tm1650": "github:YahboomTechnology/tm1650#master"
};
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
// Intercept export/publish to inject GitHub repo references into embedded pxt.json for microbit.org compatibility
function installPrepareConfigHook() {
    var _a;
    const mainPkgProto = (_a = pxt.MainPackage) === null || _a === void 0 ? void 0 : _a.prototype;
    if (!mainPkgProto || mainPkgProto._compatHookInstalled)
        return;
    mainPkgProto._compatHookInstalled = true;
    const origPrepareConfig = mainPkgProto.prepareConfigToBePublished;
    mainPkgProto.prepareConfigToBePublished = function () {
        const cfg = origPrepareConfig ? origPrepareConfig.call(this) : pxt.U.clone(this.config);
        if (cfg && cfg.dependencies) {
            for (const [pkgName, githubSlug] of Object.entries(COMPAT_EXTENSIONS)) {
                if (cfg.dependencies[pkgName]) {
                    cfg.dependencies[pkgName] = githubSlug;
                }
            }
        }
        return cfg;
    };
}
// Sanitize dependencies for incoming projects: rewrite any GitHub references back to local bundled packages
function sanitizeDependenciesForLocalSim(files) {
    if (!files || !files[pxt.CONFIG_NAME])
        return files;
    try {
        const cfg = JSON.parse(files[pxt.CONFIG_NAME]);
        if (cfg && cfg.dependencies) {
            let modified = false;
            for (const key of Object.keys(cfg.dependencies)) {
                const val = cfg.dependencies[key];
                const isModuleWorld = /Module-World/i.test(key) || (typeof val === "string" && /YahboomTechnology\/Module-World/i.test(val));
                const isColor = /module_world_color/i.test(key) || (typeof val === "string" && /YahboomTechnology\/module_world_color/i.test(val));
                const isTm1650 = /tm1650/i.test(key) || (typeof val === "string" && /YahboomTechnology\/tm1650/i.test(val));
                if (isModuleWorld || isColor || isTm1650) {
                    const canonicalName = isModuleWorld ? "Module-World" : isColor ? "module_world_color" : "tm1650";
                    if (key !== canonicalName) {
                        delete cfg.dependencies[key];
                    }
                    cfg.dependencies[canonicalName] = "*";
                    modified = true;
                }
            }
            if (modified) {
                if (!cfg.dependencies["core"])
                    cfg.dependencies["core"] = "*";
                if (!cfg.dependencies["radio"])
                    cfg.dependencies["radio"] = "*";
                if (!cfg.dependencies["microphone"])
                    cfg.dependencies["microphone"] = "*";
                files[pxt.CONFIG_NAME] = JSON.stringify(cfg, null, 4);
                // Strip any cached external files for these packages so they don't override bundled packages
                for (const fn of Object.keys(files)) {
                    if (/^pxt_modules\/(Module-World|module_world_color|tm1650)\//i.test(fn)) {
                        delete files[fn];
                    }
                }
            }
        }
    }
    catch (e) {
        pxt.error("Failed to sanitize project dependencies", e);
    }
    return files;
}
// Intercept project installation and retrieval to enforce bundled package usage
function installWorkspaceHooks() {
    const ws = pxt.workspace;
    if (!ws || ws._compatHooksInstalled)
        return;
    ws._compatHooksInstalled = true;
    const origInstallAsync = ws.installAsync;
    if (origInstallAsync) {
        ws.installAsync = async function (h, files, ...args) {
            files = sanitizeDependenciesForLocalSim(files);
            return origInstallAsync.call(this, h, files, ...args);
        };
    }
    const origGetTextAsync = ws.getTextAsync;
    if (origGetTextAsync) {
        ws.getTextAsync = async function (id, ...args) {
            const files = await origGetTextAsync.call(this, id, ...args);
            return sanitizeDependenciesForLocalSim(files);
        };
    }
}
// Patch pxt.Cloud.parseScriptId to recognize official makecode.microbit.org and microbit.org URLs
function installScriptIdHook() {
    const cloud = pxt.Cloud;
    if (!cloud || cloud._compatHookInstalled)
        return;
    cloud._compatHookInstalled = true;
    const origParseScriptId = cloud.parseScriptId;
    cloud.parseScriptId = function (uri) {
        if (!uri)
            return undefined;
        const trimmed = uri.trim();
        // 1. Direct script ID (e.g. _xxxxxxxxxxxx or 23-digit id)
        const directMatch = /^(_[a-zA-Z0-9]{12}|S?[0-9\-]{23})$/.exec(trimmed);
        if (directMatch)
            return directMatch[1];
        // 2. Official micro:bit URLs (standard or hash route)
        const mbMatch = /(?:makecode\.microbit\.org|microbit\.org)\/(?:#pub:|\/)?(_[a-zA-Z0-9]{12}|S?[0-9\-]{23})/i.exec(trimmed);
        if (mbMatch)
            return mbMatch[1];
        return origParseScriptId ? origParseScriptId(uri) : undefined;
    };
}
// Handle external micro:bit project imports if opened via URL hash or query parameter
async function handleExternalImportAsync(pv) {
    var _a;
    if (typeof window === "undefined" || !window.location)
        return;
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const urlParams = new URLSearchParams(search);
    const importUrl = urlParams.get("import");
    let scriptId;
    if (importUrl) {
        scriptId = pxt.Cloud.parseScriptId(importUrl);
    }
    else if (hash.startsWith("#pub:") || hash.startsWith("#import:")) {
        const rawArg = hash.replace(/^#(pub|import):/, "");
        scriptId = pxt.Cloud.parseScriptId(rawArg) || rawArg;
    }
    if (scriptId && /^(_[a-zA-Z0-9]{12}|S?[0-9\-]{23})$/.test(scriptId)) {
        pxt.BrowserUtils.changeHash("");
        if (pv.showLoading)
            pv.showLoading("importing", "Loading micro:bit project...");
        try {
            const res = await pxt.Cloud.privateGetAsync(scriptId, true);
            if (res && res.text) {
                const files = JSON.parse(res.text);
                const header = {
                    target: pxt.appTarget.id,
                    targetVersion: (_a = pxt.appTarget.versions) === null || _a === void 0 ? void 0 : _a.target,
                    editor: res.editor || pxt.BLOCKS_PROJECT_NAME,
                    name: res.name || "microbit project",
                    meta: {},
                    pubId: scriptId,
                    pubCurrent: true
                };
                const ws = pxt.workspace;
                const installed = await ws.installAsync(header, files);
                await pv.loadHeaderAsync(installed, null);
            }
        }
        catch (err) {
            pxt.error("Failed to import micro:bit project", err);
            if (pv.warningNotification)
                pv.warningNotification("Could not load micro:bit project from link.");
        }
        finally {
            if (pv.hideLoading)
                pv.hideLoading("importing");
        }
    }
}
// Run immediately when editor extension loads
applyGithubIoMasking();
installPrepareConfigHook();
installWorkspaceHooks();
installScriptIdHook();
pxt.editor.initExtensionsAsync = function (opts) {
    pxt.debug('loading microbit target extensions...');
    applyGithubIoMasking();
    installPrepareConfigHook();
    installWorkspaceHooks();
    installScriptIdHook();
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
    if (opts && opts.projectView) {
        const pv = opts.projectView;
        // Check for pending external import (e.g. ?import=... or #pub:...)
        handleExternalImportAsync(pv);
        // Zero-backend share link handler: generate self-contained #project:<base64> link
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
