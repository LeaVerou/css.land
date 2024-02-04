import Color from "../../color.js";

const supportsP3 = self.CSS && CSS.supports("color", "color(display-p3 0 1 0)");
window.supportsP3 = supportsP3;

window.getColor = function(...args) {
	let color = new Color(...args);
	return color;
}

// Generate gradient stops for the sliders
// (we need to use more to emulate proper interpolation)
window.slider_stops = function slider_stops(range, l, c, h, a, index) {
	return range.map(x => {
		let args = [l, c, h, a];
		args[index] = x;
		let color = new Color("lch", args.slice(0, 3), args[3] / 100);
		return color.toString({fallback: true});
	}).join(", ");
}

window.CSS_color_to_LCH = function CSS_color_to_LCH(str) {
	str = str || prompt("Enter any CSS color");

	if (!str) {
		return;
	}

	try {
		let color = new Color(str);
		let lch = color.to("lch").coords;
		return {
			l: lch[0],
			c: lch[1],
			h: lch[2],
			alpha: color.alpha * 100
		};
	}
	catch (e) {
		alert(e.message);
		return;
	}
}

// Select text in readonly input fields when you focus them
document.addEventListener("click", evt => {
	if (evt.target.matches("input[readonly]")) {
		evt.target.select();
	}
});
