class ToolPicker extends HTMLElement {
	registerTool(tool) {
		if(Array.isArray(tool)){
			tool.forEach(this.registerTool, this);
			return this
		}
		let {name, icon} = tool.metadata,
		li = document.createElement("li"),
		a = document.createElement("a");
		a.title = name;
		a.href = "#";
		a.style = `background-image: url("${icon}")`;
		a.addEventListener("click", () => {
			this.value = tool;
			li.setAttribute("selected", "");
		}, false);
		li.appendChild(a);
		this.shadowRoot.querySelector("ul").appendChild(li);
		return this
	}

	get value() {
		return this._tool;
	}
	set value(tool) {
		if(!(tool.prototype instanceof BaseTool)){
			throw new TypeError(`${tool} is not an instance of BaseTool`);
		}
		this._tool = tool;
		this.dispatchEvent(this._changeEvent);
		this.shadowRoot.querySelectorAll("li[selected]")
			.forEach(v => v.removeAttribute("selected"));
	}
	connectedCallback() {
		this._changeEvent = new Event('change');
	}
	constructor() {
		super();
		let div = document.createElement("div"),
		style = document.createElement("style");
		div.innerHTML = `<ul></ul>`;
		style.textContent = `
		:host div {
			color: var(--fontcolor-a);
			margin: 0;
			padding: .2em 1em;
		}
		ul {
			display: flex;
			flex-flow: row nowrap;
			align-content: space-between;
			padding: 0;
			margin: 0
		}
		li {
			list-style: none;
			margin: 0 auto;
		}
		a {
			display: inline-block;
			color: inherit;
			text-decoration: none;
			width: 40px;
			height: 40px;
			background: center no-repeat url(resources/tool.png);
			background-size: cover;
			filter: invert(var(--invert-icons, 0));
		}
		li[selected], li:hover {background: var(--bgcolor-b)}
		`;
		let shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(style);
		shadow.appendChild(div);
	}
}

customElements.define('tool-picker', ToolPicker);