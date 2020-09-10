// Custom Download format based on: https://github.com/LeaVerou/css.land/issues/11
function download(colors, decimals) {
    // Build an array of colors with all color formats displayed on screen
    const round = Mavo.Functions.round;
    const exportColors = [];
    for (let color of colors) {
        exportColors.push({
            name: color.name.valueOf(),
            lch: `lch(${round(color.lightness, decimals)}% ${round(color.chroma, decimals)} ${round(color.hue, decimals)}${alpha_to_string(color.alpha)})`,
            rgb: LCH_to_sRGB_string(color.lightness, color.chroma, color.hue, color.alpha, true),
            p3: LCH_to_P3_string(color.lightness, color.chroma, color.hue, color.alpha, true),
            rec2020: LCH_to_r2020_string(color.lightness, color.chroma, color.hue, color.alpha),
            warnings: {
                rgb: (isLCH_within_sRGB(color.lightness, color.chroma, color.hue) ? null : `Color is actually [${LCH_to_sRGB_string(color.lightness, color.chroma, color.hue, color.alpha)}], which is out of sRGB gamut; auto-corrected to sRGB boundary.`),
                p3: (isLCH_within_P3(color.lightness, color.chroma, color.hue) ? null : `Color is actually [${LCH_to_P3_string(color.lightness, color.chroma, color.hue, color.alpha)}], which is not displayable on most screens as of 2019; auto-corrected to P3 boundary.`),
                rec2020: (isLCH_within_r2020(color.lightness, color.chroma, color.hue) ? null : "Out of Rec.2020 gamut, are you kidding?!"),
            },
        });
    }

    // Export JSON file by creating a hidden download link and clicking on it.
    // The human-friendly colors are saved in the property `downloadColors`.
    // All other data from the app is included so that if a user uses the
    // import feature all properties populate as expected. Something to be
    // aware of is additional color changes will no be reflected in `downloadColors`
    // if using the standard export feature and not clicking the download button,
    // however the download button is in the advanced section anyways.
    const appName = document.querySelector("[mv-app]").getAttribute("mv-app");
    const fileName = appName + ".json";
    const json = Mavo.toJSON(Object.assign({ downloadColors: exportColors }, Mavo.all[appName].getData()));
    const blob = new Blob([json], { type: "application/json; charset=UTF-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
