class Color {
	toString() {
		return "#" + [this.r, this.g, this.b, this.a]
			.map(v => v.toString(16).padStart(2, "0").substr(0, 2))
			.join("").toUpperCase()
	}
	proxy() {
		return new Proxy(this, {
			set(target, prop, val, that) {
				target[prop] = val;
				target._callback.forEach(v => {
					if(v[0] === "change") v[1](that);
				});
				return true
			}
		})
	}
	addEventListener(...args) {
		this._callback.push(args);
	}
	constructor(data = [255, 255, 255, 255]) {
		this._callback = [];
		if(typeof data === "string"){
			data = data.trim().replace("#", "");
			if(data.length === 3){
				data = data.split("").map(v => v + v).join("");
			}
			data = data.padEnd(8, "F").match(/[0-9A-f]{2}/g).map(v => parseInt(v, 16));
		}
		if(!Array.isArray(data)){
			data = Object.entries({r, g, b, a} = data);
		}
		[this.r, this.g, this.b, this.a] = data;
	}
}

class ColorPicker extends HTMLElement {
	get value() {
		return this._value.toString();
	}
	set value(value) {
		value = new Color(value);
		value.addEventListener("change", () => this.update());
		this._value = value.proxy();
		this.update();
		return this._value
	}
	update() {
		let root = this.shadowRoot, value = this._value;
		this.dispatchEvent(new CustomEvent("change", {detail: {value: value.toString()}}));
		root.getElementById("current").style.background = `#${value.toString(16).substr(0, 5)}`
		root.getElementById("hex").value = value;
		root.getElementById("color").value = value.toString().substr(0, 7);
		["r", "g", "b", "a"].forEach(i => {
			let e = root.getElementById(i);
			e.setAttribute("after", value[i]);
			e.value = value[i]
		});
	}
	connectedCallback() {
		this._changeEvent = new Event('change');
		["r", "g", "b", "a"].forEach(i => {
			this.shadowRoot.getElementById(i).addEventListener("change", v => {
				this._value[i] = +v.target.value;
			})
		});
		this.shadowRoot.querySelectorAll("#palette a").forEach(v => {
			const c = window.getComputedStyle(v).getPropertyValue("--c");
			v.addEventListener("click", () => {this.value = c})
		});
		[
			this.shadowRoot.getElementById("hex"),
			this.shadowRoot.getElementById("color")
		].forEach(v => v.addEventListener("change", v => {
			this.value = v.target.value;
		}));
		this.value = "#FFFFFFFF";
	}
	constructor() {
		super();
		let div = document.createElement("div"),
		style = document.createElement("style");
		div.innerHTML = `
		<div id="current">
			<input type="text" id="hex" readonly/>
			<input type="color" id="color"/>
		</div>
		<div id="range">
			<input before="Красный" type="range" id="r" min="0" max="255"><br/>
			<input before="Зелёный" type="range" id="g" min="0" max="255"><br/>
			<input before="Синий" type="range" id="b" min="0" max="255"><br/>
			<input before="Прозрачность" type="range" id="a" min="0" max="255">
		</div>
		<div id="palette">
			<a href="#" style="--c:#FFF"></a>
			<a href="#" style="--c:#F00"></a>
			<a href="#" style="--c:#0F0"></a>
			<a href="#" style="--c:#00F"></a>
			<a href="#" style="--c:#FF0"></a>
			<a href="#" style="--c:#F0F"></a>
			<a href="#" style="--c:#0FF"></a>
			<a href="#" style="--c:#000"></a>
		</div>
		`;
		style.textContent = `
		:host > div {
			display: grid;
			grid-gap: .5em;
			grid-template: "a a" auto "b  c" 1fr "b  c" 1fr / 2fr 3fr;
			color: var(--fontcolor-a);
			margin: 0;
			padding: .2em 1em;
		}
		#current, #range, #palette {
			border: 1px solid rgba(0, 0, 0, .2);
			border-radius: 3px;
			padding: .5em;
		}
		#current {grid-area: a}
		#range {grid-area: b}
		#palette {
			grid-area: c;
			display: flex;
		}
		#palette a {
			flex: auto;
			margin: 3px;
			background: var(--c, transparent);
		}
		input[before]::before {
			display: inline-block;
			position: absolute;
			color: #FFF;
			content: attr(before);
			padding-left: .5em;
			line-height: 1.5;
		}
		:host(.advanced) input[after]::after {
			display: inline-block;
			color: var(--fontcolor-c);
    		content: " " attr(after);
    		margin-right: -9999px;
			padding-left: .2em;
		}
		input[type="text"] {
			display: inline-block;
			border: none;
			color: #FFF;
			mix-blend-mode: difference;
			background: transparent;
			-webkit-user-select: all;
			-moz-user-select: all;
			-ms-user-select: all;
			user-select: all;
		}
		input[type="range"] {
			appearance: none;
			border-radius: 3px
		}
		#r {background: linear-gradient(to right, #000, #F00)}
		#g {background: linear-gradient(to right, #000, #0F0)}
		#b {background: linear-gradient(to right, #000, #00F)}
		#a {background: linear-gradient(to right, transparent, #FFF)}
		#hex, #a {display: none}
		:host(.advanced){
			#hex, #a {display: initial}
		}
		`;
		let shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(style);
		shadow.appendChild(div);
	}
}

customElements.define('color-picker', ColorPicker);