class KTBootstrap {

    init() {
        this.initThemeMode();
        this.initThemeDirection();
        this.initLayout();
    }

    initThemeMode()
    {
        theme.setModeSwitch(themesettings.modeSwitchEnabled);
        theme.setModeDefault(themesettings.modeDefault);
    }

    initThemeDirection()
    {
        theme.setDirection(themesettings.direction);

        if (theme.isRtlDirection())
        {
            theme.addHtmlAttribute("html", "direction", "rtl");
            theme.addHtmlAttribute("html", "dir", "rtl");
            theme.addHtmlAttribute("html", "style", "direction: rtl");
        }
    }

    initLayout(){
        theme.addHtmlAttribute("body", "id", "kt_app_body");
    }

    initDefault(){
        // Layout options
        theme.addHtmlAttribute("body", "data-kt-app-layout", "dark-sidebar");
        theme.addHtmlAttribute("body", "data-kt-app-header-fixed", "true");
        theme.addHtmlAttribute("body", "data-kt-app-sidebar-fixed", "true");
        theme.addHtmlAttribute("body", "data-kt-app-sidebar-hoverable", "true");
        theme.addHtmlAttribute("body", "data-kt-app-sidebar-push-header", "true");
        theme.addHtmlAttribute("body", "data-kt-app-sidebar-push-toolbar", "true");
        theme.addHtmlAttribute("body", "data-kt-app-sidebar-push-footer", "true");
        theme.addHtmlAttribute("body", "data-kt-app-toolbar-enabled", "true");
        theme.addHtmlClass("body", "app-default");

        theme.addVendor("datatables");

        theme.addJavascriptFile("js/custom/passwordChange.js");
        theme.addJavascriptFile("js/custom/detectionStream.js");

    }


    initAuthLayout(){
        theme.addHtmlClass("body", "app-blank");
    }

    initSystemLayout(){
        theme.addHtmlClass("body", "app-black bgi-size-cover bgi-position-center bgi-no-repeat");
    }
}


module.exports = function createKtBootstrapInstance() {
    return new KTBootstrap();
};