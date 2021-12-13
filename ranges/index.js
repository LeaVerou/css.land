let dummy = document.createElement("div");
let properties = [
	"width", // <length-percentage>
	"opacity", // <number> | <percentage>
	"rotate" // <angle>
];

function simplifyExpression(expr) {
	let value = `calc(${expr})`;
	let property;

	// Find a native property that supports this type
	for (let prop of properties) {
		if (CSS.supports(prop, value)) {
			property = prop;
			break;
		}
	}

	if (property) {
		dummy.style = "";
		dummy.style[property] = value;
		ret = dummy.style[property];
		ret = ret.replace(/^calc/, "");

		if (!/ \+ | - |\*|\//.test(ret)) {
			// Single term, drop parens
			ret = ret.replace(/^\(|\)$/g, "");
		}

		return ret;
	}

	return expr;
}

calcExpression.onfocus = function(evt) {
	this.select();
};