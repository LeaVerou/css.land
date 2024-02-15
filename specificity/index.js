import $ from "https://v2.blissfuljs.com/src/$.js";
import $$ from "https://v2.blissfuljs.com/src/$$.js";

import * as parsel from "https://parsel.verou.me/dist/parsel.js"


let output = $$(".specificity");
let greater = $(".op");

let input = $$("input");

async function render () {
	let specificity = [];
	let base = 9;

	for (let i=0; i<2; i++) {
		try {
			specificity[i] = parsel.specificity(input[i].value);
			input[i].setCustomValidity("");
		}
		catch (e) {
			input[i].setCustomValidity(e.message);
		}

		base = Math.max(base, ...specificity);
		output[i].innerHTML = specificity[i].map(s => `<div data-value="${s}">${s}</div>`).join(" ");
	}

	base++;

	let diff = parseInt(specificity[0].join(""), base) - parseInt(specificity[1].join(""), base);
	$(".winner")?.classList.remove("winner");

	if (diff < 0) {
		// 2 wins
		greater.textContent = "<";
		input[1].closest(".selector").classList.add("winner");
	}
	else if (diff > 0) {
		// 1 wins
		greater.textContent = ">";
		input[0].closest(".selector").classList.add("winner");
	}
	else {
		greater.textContent = "=";
	}

}

$$("input").forEach(input => input.addEventListener("input", render));
render();


