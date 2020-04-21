const supportsP3 = self.CSS && CSS.supports("color", "color(display-p3 0 1 0)");

function alpha_to_string(a = 100) {
	return (a < 100? ` / ${a}%` : "");
}

function LCH_to_r2020_string(l, c, h, a = 100) {
	return "color(rec2020 " + LCH_to_r2020([+l, +c, +h]).map(x => {
		x = Math.round(x * 10000)/10000;
		return x;
	}).join(" ") + alpha_to_string(a) + ")";
}

function LCH_to_P3_string(l, c, h, a = 100, forceInGamut = false) {
	if (forceInGamut) {
		[l, c, h] = force_into_gamut(l, c, h, isLCH_within_P3);
	}

	return "color(display-p3 " + LCH_to_P3([+l, +c, +h]).map(x => {
		x = Math.round(x * 10000)/10000;
		return x;
	}).join(" ") + alpha_to_string(a) + ")";
}

function LCH_to_sRGB_string(l, c, h, a = 100, forceInGamut = false) {
	if (forceInGamut) {
		[l, c, h] = force_into_gamut(l, c, h, isLCH_within_sRGB);
	}

	return "rgb(" + LCH_to_sRGB([+l, +c, +h]).map(x => {
		return Math.round(x * 10000)/100 + "%";
	}).join(" ") + alpha_to_string(a) + ")";
}

function force_into_gamut(l, c, h, isLCH_within) {
	// Moves an lch color into the sRGB gamut
	// by holding the l and h steady,
	// and adjusting the c via binary-search
	// until the color is on the sRGB boundary.
	if (isLCH_within(l, c, h)) {
		return [l, c, h];
	}

	let hiC = c;
	let loC = 0;
	const ε = .0001;
	c /= 2;

	// .0001 chosen fairly arbitrarily as "close enough"
	while (hiC - loC > ε) {
		if (isLCH_within(l, c, h)) {
			loC = c;
		}
		else {
			hiC = c;
		}
		c = (hiC + loC)/2;
	}

	return [l, c, h];
}

function isLCH_within_sRGB(l, c, h) {
	var rgb = LCH_to_sRGB([+l, +c, +h]);
	const ε = .000005;
	return rgb.reduce((a, b) => a && b >= (0 - ε) && b <= (1 + ε), true);
}

function isLCH_within_P3(l, c, h) {
	var rgb = LCH_to_P3([+l, +c, +h]);
	const ε = .000005;
	return rgb.reduce((a, b) => a && b >= (0 - ε) && b <= (1 + ε), true);
}

function isLCH_within_r2020(l, c, h) {
	var rgb = LCH_to_r2020([+l, +c, +h]);
	const ε = .000005;
	return rgb.reduce((a, b) => a && b >= (0 - ε) && b <= (1 + ε), true);
}

// Generate gradient stops for the sliders
// (we need to use more to emulate proper interpolation)
function slider_stops(range, l, c, h, a, index) {
	return range.map(x => {
		args = [l, c, h, a, true];
		args[index] = x;
		var LCH_to_string = supportsP3? LCH_to_P3_string : LCH_to_sRGB_string;
		return LCH_to_string(...args);
	}).join(", ");
}

function CSS_color_to_LCH(str) {
	str = str || prompt("Enter any sRGB color format your browser recognizes, or a color(display-p3) color");

	if (!str) {
		return;
	}

	const prefixP3 = "color(display-p3 ";

	if (str.trim().indexOf(prefixP3) === 0) {
		var params = str.slice(prefixP3.length).match(/-?[\d.]+/g).map(x => +x);
		console.log(params);
		var lch = P3_to_LCH(params.slice(0, 3));
	}
	else {
		// Assume RGBA for now, normalize via computed style
		var dummy = document.createElement("_");
		document.body.appendChild(dummy);
		dummy.style.color = str;
		var computedStr = getComputedStyle(dummy).color;
		var params = computedStr.match(/-?[\d.]+/g).map(x => +x);

		params = params.map((x, i) => i < 3? x/255 : x);
		var lch = sRGB_to_LCH(params.slice(0, 3));
	}

	return {
		lightness: lch[0],
		chroma: lch[1],
		hue: lch[2],
		alpha: (params[3] || 1) * 100
	};
}

// Produce a default (not very good) name
function LCH_name(l, c, h) {
	h = h % 360;
	var ret = [];
	var baseColor;

	if (l < 35) {
		ret.push("Dark");
	}
	else if (l > 70) {
		ret.push("Light");
	}

	if (c > 10) {
		if (c < 35) {
			ret.push("Muted");
		}
		else if (c > 70) {
			if (l > 60 ) {
				ret.push("Bright");
			}
		}

		// Chromatic
		for (let [hue, baseColor] of Object.entries({
			20: "Pink",
			40: "Red",
			60: "Orange",
			100: "Yellow",
			150: "Green",
			210: "Cyan",
			260: "Blue",
			320: "Purple",
			360: "Pink"
		})) {
			if (h <= hue) {
				ret.push(baseColor);
				break;
			}
		}
	}
	else {
		if (c > 1) {
			ret.unshift(h < 120 || h > 300? "Warm": "Cool");
		}

		ret.push("Gray");
	}

	ret = ret.join(" ");

	if (/Yellow$/.test(ret) && l < 40) {
		// Dark Yellow is an oxymoron
		ret = "Brown";
	}

	return ret;
}

// Select text in readonly input fields when you focus them
document.addEventListener("click", evt => {
	if (evt.target.matches("input[readonly]")) {
		evt.target.select();
	}
});
