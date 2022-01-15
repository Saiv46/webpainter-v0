class AppCanvas extends HTMLElement {
	static get layer() {
		return CanvasLayer;
	}
	async fromFile(file) {
		if(!(file instanceof File)){
			throw new TypeError(`File ${file} is not an instance of File`);
		}
		const blob = URL.createObjectURL(file);
		let img;
		try {
			img = await new Promise((res, rej) => {
				let el = new Image();
				el.onload = () => res(el);
				el.onerror = rej;
				el.src = blob;
			});
			URL.revokeObjectURL(blob);
		} catch(e) {
			// Ошибки ошибками, а утечки памяти допускать нельзя
			URL.revokeObjectURL(blob);
			throw e;
		}
		this.plain({
			name: file.name,
			size: [img.naturalWidth, img.naturalHeight]
		});
		this.layers[0].update(img, true);
		return this;
	}

	async toFile({quality = 1, mimeType = "image/png"} = {}) {
		let tmp = new AppCanvas.layer();
		this.appendChild(tmp);
		this.layers.forEach(img => (img !== tmp) && tmp.update(img.canvas, false));
		const blob = await new Promise(v => tmp.canvas.toBlob(v, mimeType, quality));
		this.removeChild(tmp);
		return new File([blob], this.name, {type: mimeType});
	}
	
	toJSON() {
		return {
			name: this.name,
			layers: this.layers.map(v => v.toJSON())
		}
	}

	get width() {
		return +this.shadowRoot.querySelector("main").getAttribute("width");
	}
	set width(width) {
		if(!Number.isInteger(+width) || +width <= 0){
			throw new TypeError(`Width ${width} is not a positive integer`);
		}
		this.shadowRoot.querySelector("main").setAttribute("width", width);
		this.shadowRoot.querySelector("main").style.width = `${width}px`;
		this.layers.forEach(v => {v.width = width})
	}

	get height() {
		return +this.shadowRoot.querySelector("main").getAttribute("height");
	}
	set height(height) {
		if(!Number.isInteger(+height) || +height <= 0){
			throw new TypeError(`Height ${height} is not a positive integer`);
		}
		this.shadowRoot.querySelector("main").setAttribute("height", height);
		this.shadowRoot.querySelector("main").style.height = `${height}px`;
		this.layers.forEach(v => {v.height = height})
	}

	undo() {
		if(!this.layers.length) return;
		this.layers[0].undo();
	}
	redo() {
		if(!this.layers.length) return;
		this.layers[0].redo();
	}

	get size() {
		return `${this.width}x${this.height}`
	}
	set size(size) {
		if(!~["string", "array", "object"].indexOf(typeof size)){
			throw TypeError(`Size ${size} is not a String/Array/Object`);
		}
		if(typeof size === "string") size = size.split("x");
		this.width = size.width || size[0];
		this.height = size.height || size[1];
	}

	get layers() {
		return Array.from(this.childNodes);
	}
	set layers(layers) {
		if(!Array.isArray(layers) && !(layers instanceof NodeList)){
			throw new TypeError(`Layers ${layers} is not a Array or NodeList`);
		}
		this.layers.filter(v => !layers.includes(v)).forEach(v => this.removeChild(v));
		layers.filter(v => !this.layers.includes(v)).forEach(v => this.appendChild(v));
	}
	_getPaintingLayer() {
		return this.layers[0];
	}

	plain({name = "Unnamed.png", size = "640x320", layers} = {}) {
		this.childNodes.forEach(v => this.removeChild(v));
		this.name = name;
		this.size = size;
		this.layers = layers && layers.length ? layers : [new AppCanvas.layer()];
	}
	connectedCallback() {
		let context, cvs, offset;
		const tool = document.querySelector("tool-picker");
		const color = document.querySelector("color-picker");

		function setupTool(cvs) {
			let ctx = cvs.getContext("2d");
			let instance = new tool.value();
			Editor.options.fillStyle = color.value;
			instance.options = Editor.options;
			instance.ctx = ctx;
			return instance;
		}
		function endTool(instance) {
			return void(instance.ctx = null)
		}
		function mouseClick(e){
			if(!tool.value) return;
			cvs = this._getPaintingLayer();
			offset = cvs.getBoundingClientRect();
			context = setupTool(cvs);
			context.clickDraw(
				e.clientX - offset.left,
				e.clientY - offset.top,
				e.clientX - offset.left,
				e.clientY - offset.top,
				e.altKey
			);
			context = endTool(context);
		}
		function mouseDown(e) {
			if(!tool.value) return;
			cvs = this._getPaintingLayer();
			offset = cvs.getBoundingClientRect();
			context = setupTool(cvs);
			context.startDraw(
				e.clientX - offset.left,
				e.clientY - offset.top,
				e.altKey
			);
			this.removeEventListener("click", mouseClick);
			this.removeEventListener("mousedown", mouseDown);
			this.addEventListener("mousemove", mouseMove);
			this.addEventListener("mouseup", mouseUp);
		}
		function mouseMove(e) {
			if(!context) return;
			context.moveDraw(
				e.clientX - offset.left,
				e.clientY - offset.top
			);
		}
		function mouseUp(e) {
			if(!context) return;
			context.endDraw(
				e.clientX - offset.left,
				e.clientY - offset.top
			);
			context = endTool(context);
			this.addEventListener("click", mouseClick);
			this.addEventListener("mousedown", mouseDown);
			this.removeEventListener("mousemove", mouseMove);
			this.removeEventListener("mouseup", mouseUp);
		}
		
		this.addEventListener("click", mouseClick);
		this.addEventListener("mousedown", mouseDown);
		
		this.plain();
	}
	constructor() {
		super();
		const main = document.createElement("main");
		main.appendChild(document.createElement("slot"));

		const style = document.createElement("style");
		style.textContent = `
		main, ::slotted(canvas-layer) {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
		}
		main {
			background: repeat url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgc3R5bGU9ImJhY2tncm91bmQ6cmdiYSgyNTUsMjU1LDI1NSwuNSkiPjxwYXRoIGZpbGw9IiNDRENEQ0QiIGQ9Ik0wIDB2MTZoMTZ2MTZoMTZWMTZIMTZWMHoiLz48L3N2Zz4=');
		}
		::slotted(canvas-layer) {
			--layer-id: attr(layer-id number, -1);
			z-index: var(--layer-id);
		}`;
		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(style);
		shadow.appendChild(main);
	}
}

customElements.define('app-canvas', AppCanvas);