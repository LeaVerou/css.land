function textContent(node) {
	if (node?.[Mavo.toNode]) {
		return textContent(node[Mavo.toNode].element);
	}
	else if (node instanceof Node) {
		let ret = "";

		if (node.nodeType === 1) {
			if (node.matches("input, textarea")) {
				ret += ["checkbox", "radio", "file"].includes(node.type)? "" : node.value;
			}
			else if (node.matches("select")) {
				ret += [...node.selectedOptions].map(o => o.textContent).join("\n");
			}
			else {
				let cs = getComputedStyle(node);

				if (cs.display === "none" || cs.visibility === "hidden" || cs.getPropertyValue("--custom-visibility")?.trim() === "hidden") {
					ret += "";
				}
				else {
					let before = getComputedStyle(node, "::before");
					let after = getComputedStyle(node, "::after");
					// FIXME this will break with nontrivial generated content
					before = before.content === "none" ? "" : before.content.match(/^['"](.*)['"]$/)?.[1];
					after = after.content === "none" ? "" : after.content.match(/^['"](.*)['"]$/)?.[1];

					ret += before + [...node.childNodes].map(textContent).join("") + after;
				}
			}
		}
		else if (node.nodeType === 3) {
			ret += node.textContent;
		}

		return ret;
	}
}