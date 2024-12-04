const themeSettings = require("./themesettings.json");
const iconsSettings = require("./icons.json");
const fs = require("fs");

class KTTheme {

  modeSwitchEnabled = true;

  modeDefault = "light";

  direction = "ltr";

  htmlAttributes = {};

  htmlClasses = {};

  javascriptFiles = [];

  cssFiles = [];

  vendorFiles = [];

  footerModal = [];

  constructor() {}

  addHtmlAttribute(scope, attributeName, attributeValue) {
    let attribute = {};
    let attributesArray = [];
    if (this.htmlAttributes[scope]) {
      attributesArray = this.htmlAttributes[scope];
    }

    attribute[attributeName] = attributeValue;
    attributesArray.push(attribute);
    this.htmlAttributes[scope] = attributesArray;
  }

  addHtmlClass(scope, className) {
    let classesArray = [];
    if (this.htmlClasses[scope]) {
      classesArray = this.htmlClasses[scope];
    }
    classesArray.push(className);
    this.htmlClasses[scope] = classesArray;
  }

  printHtmlAttributes(scope) {
    const attribute = [];
    if (this.htmlAttributes[scope]) {
      this.htmlAttributes[scope].forEach((attr) => {
        const [key, value] = Object.entries(attr)[0];
        let item = key + "=" + value;
        attribute.push(item);
      });
      return attribute.join(" ");
    }
  }

  printHtmlClasses(scope) {
    if (this.htmlClasses[scope]) {
      return this.htmlClasses[scope].join(" ");
    }
  }

  getSvgIcon(path, classNames) {
    let content = fs.readFileSync(
      `${process.cwd()}/public/assets/media/icons/${path}`,
      { encoding: "utf8", flag: "r" }
    );
    return `<span class="${classNames}">${content}</span>`;
  }

  getIcon(iconName, iconClass = "", iconType = "") {
    let tag = "i";
    let output = "";
    let iconsFinalClass = iconClass === "" ? "" : " " + iconClass;

    if (iconType === "" && themeSettings.iconType !== "") {
      iconType = themeSettings.iconType;
    }

    if (iconType === "") {
      iconType = "solid";
    }

    if (iconType === "duotone") {
      let paths = iconsSettings[iconName] ? iconsSettings[iconName] : 0;

      output += `<${tag} class='ki-${iconType} ki-${iconName}${iconsFinalClass}'>`;

      for (let i = 1; i <= paths; i++) {
        output += `<span class='path${i}'></span>`;
      }

      output += `</${tag}>`;
    } else {
      output = `<${tag} class='ki-${iconType} ki-${iconName}${iconsFinalClass}'></${tag}>`;
    }

    return output;
  }

  setModeSwitch(flag) {
    this.modeSwitchEnabled = flag;
  }

  isModeSwitchEnabled() {
    return this.modeSwitchEnabled;
  }

  setModeDefault(mode) {
    this.modeDefault = mode;
  }

  getModeDefault() {
    return this.modeDefault;
  }

  setDirection(direction) {
    this.direction = direction;
  }

  getDirection() {
    return this.direction;
  }

  isRtlDirection() {
    return this.direction.toLowerCase() === "rtl";
  }

  getAssetPath(path) {
    return `${themeSettings.assetsDir}${path}`;
  }

  extendCssFilename(path) {
    if (this.isRtlDirection()) {
      return path.replace(".css", ".rtl.css");
    }
    return path;
  }

  getFavicon() {
    return this.getAssetPath(themeSettings.assets.favicon);
  }

  getFonts() {
    return themeSettings.assets.fonts;
  }

  getGlobalAssets(type) {
    let files =
      type === "css" ? themeSettings.assets.css : themeSettings.assets.js;
    let updatedFiles = [];

    files.forEach((file) => {
      if (type === "css") {
        updatedFiles.push(this.getAssetPath(this.extendCssFilename(file)));
      } else {
        updatedFiles.push(this.getAssetPath(file));
      }
    });

    return updatedFiles;
  }

  addVendors(vendors) {
    vendors.forEach((vendor) => {
      if (!this.vendorFiles[vendor]) {
        this.vendorFiles.push(vendor);
      }
    });
  }

  addVendor(vendor) {
    if (!this.vendorFiles[vendor]) {
      this.vendorFiles.push(vendor);
    }
  }

  addJavascriptFile(file) {
    if (!this.javascriptFiles[file]) {
      this.javascriptFiles.push(file);
    }
  }
  addModalFile(file) {
    if (!this.footerModal[file]) {
      this.footerModal.push(file);
    }
  }

  addCssFile(file) {
    if (!this.cssFiles[file]) {
      this.cssFiles.push(file);
    }
  }

  getJavascriptFiles() {
    return this.javascriptFiles;
  }
  getModalFiles() {
    return this.footerModal;
  }

  getCssFiles() {
    return this.cssFiles;
  }

  getVendors(type) {
    let vendors = themeSettings.vendors;
    let files = [];

    this.vendorFiles.forEach((vendor) => {
      if (vendors[vendor] && vendors[vendor][type]) {
        vendors[vendor][type].forEach((file) => {
          var vendorPath = file.includes("https://")
            ? file
            : this.getAssetPath(file);
          files.push(vendorPath);
        });
      }
    });
    return files;
  }

  getAttributeValue(scope, attributeName) {
    let attrValue = null;
    this.htmlAttributes[scope].forEach((attr) => {
      const [key, value] = Object.entries(attr)[0];
      if (key === attributeName) {
        attrValue = value;

      }
    });
    return attrValue;
  }

  getPartialPath(path) {
    return `${process.cwd()}/views/${path}`;
  }

  getLayoutPath(path) {
    return `${process.cwd()}/views/${themeSettings.layoutDir}/${path}`;
  }

  getPageViewPath(folder, file) {
    return `pages/${folder}/${file}`;
  }
}

module.exports = function createKtThemeInstance() {
  return new KTTheme();
};
