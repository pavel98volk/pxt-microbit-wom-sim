/// <reference path="../node_modules/pxt-core/localtypings/pxtarget.d.ts" />
/// <reference path="../node_modules/pxt-core/built/pxtcompiler.d.ts" />
/// <reference path="../node_modules/pxt-core/built/pxtlib.d.ts" />
/// <reference path="../node_modules/pxt-core/localtypings/pxteditor.d.ts" />
/// <reference path="dapjs.d.ts" />
import * as dialogs from "./dialogs";
import * as flash from "./flash";
import * as patch from "./patch";

function applyGithubIoMasking() {
    if (typeof window === "undefined" || !window.location) return;
    const isGithubIo = /github\.io$/i.test(window.location.hostname);
    if (!isGithubIo) return;

    // 1. Disable auth in pxt.auth so pxt.auth.hasIdentity() evaluates to false
    if ((pxt as any).auth?.enableAuth) {
        (pxt as any).auth.enableAuth(false);
    }

    // 2. Clear identity flags in cloudProviders so identityProviders() returns empty
    if (pxt.appTarget?.cloud?.cloudProviders) {
        const providers = pxt.appTarget.cloud.cloudProviders as any;
        Object.keys(providers).forEach(id => {
            if (providers[id]) {
                providers[id].identity = false;
            }
        });
    }

    // 3. Remove help menu on github.io by emptying docMenu
    if (pxt.appTarget?.appTheme) {
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

pxt.editor.initExtensionsAsync = function (opts: pxt.editor.ExtensionOptions): Promise<pxt.editor.ExtensionResult> {
    pxt.debug('loading microbit target extensions...')
    applyGithubIoMasking();

    const manyAny = Math as any;
    if (!manyAny.imul)
        manyAny.imul = function (a: number, b: number): number {
            const ah = (a >>> 16) & 0xffff;
            const al = a & 0xffff;
            const bh = (b >>> 16) & 0xffff;
            const bl = b & 0xffff;
            // the shift by 0 fixes the sign on the high part
            // the final |0 converts the unsigned value into a signed value
            return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
        };

    const res: pxt.editor.ExtensionResult = {
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
    }])

    res.mkPacketIOWrapper = flash.mkDAPLinkPacketIOWrapper;
    res.blocklyPatch = patch.patchBlocks;
    res.showProgramTooLargeErrorAsync = dialogs.showProgramTooLargeErrorAsync;

    // Zero-backend share link handler: generate self-contained #project:<base64> link
    if (opts && opts.projectView) {
        const pv = opts.projectView as any;
        const origPublishAsync = pv.publishAsync ? pv.publishAsync.bind(pv) : null;
        pv.publishAsync = async function (name: string, description?: string, screenshotUri?: string, forceAnonymous?: boolean) {
            try {
                if (name && pv.state?.projectName !== name) {
                    await pv.updateHeaderNameAsync(name, description);
                }
                const base64: string = await pv.exportAsync();
                const shareBase = pxt.appTarget?.appTheme?.shareUrl || (window.location.origin + window.location.pathname);
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
            } catch (err) {
                pxt.error("Failed to generate project share link", err);
                if (origPublishAsync) return origPublishAsync(name, description, screenshotUri, forceAnonymous);
                return { url: "", embed: {}, error: err };
            }
        };
    }

    return Promise.resolve<pxt.editor.ExtensionResult>(res);
}
