class CanvasLayer extends HTMLElement {
	undo(n) {
		if(n === undefined) this.ctx.undo();
		this.ctx.currentHistoryNo -= n;
	}
	redo(n) {
		if(n === undefined) this.ctx.redo();
		this.ctx.currentHistoryNo += n;
	}
	update(data, overwrite = true) {
		if(overwrite){
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
		if(data){
			if(data instanceof ImageData){
				this.ctx.putImageData(data, 0, 0);
			}else{
				this.ctx.drawImage(data, 0, 0);
				if(data.canvas === this.temp) delete this.temp;
			}
		}
	}
	
	toJSON() {
		return this.canvas.toDataURL("image/png", 1)
	}

	getContext() {
		return this.ctx; // Don't mess with that shit for now
	}
	get zIndex() {
		return this.canvas.style['z-index']
	}
	set zIndex(n) {
		return this.canvas.style['z-index'] = n
	}

	get width() {
		return this.canvas.width;
	}
	set width(width) {
		if(!Number.isInteger(+width) || +width <= 0){
			throw new TypeError(`Width ${width} is not a positive integer`);
		}
		this.canvas.width = width;
	}

	get height() {
		return this.canvas.height;
	}
	set height(height) {
		if(!Number.isInteger(+height) || +height <= 0){
			throw new TypeError(`Height ${height} is not a positive integer`);
		}
		this.canvas.height = height;
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

	connectedCallback() {
		this.canvas = this.shadowRoot.querySelector("canvas");
		this.ctx = this.canvas.getContext('2d');
		this.size = this.parentNode.size;
		UndoCanvas.enableUndo(this.ctx);
	}
	constructor() {
		super();
		const shadow = this.attachShadow({mode: "open"});
		const style = document.createElement("style");
		style.innerHTML = `:host {height: -webkit-fill-available}`;
		shadow.appendChild(style);
		shadow.appendChild(document.createElement("canvas"));
	}
	
}

customElements.define('canvas-layer', CanvasLayer);