class BaseTool {
	static get metadata() {
		return {
			name: "BaseTool",
			icon: "resources/tool.png"
		}
	}
	static get optionsDefaults() {
		return {}
	}
	getContext() {
		return this.ctx
	}
	getImageData() {
		let ctx = this.getContext();
		return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	}
	putImageData(rawPixels) {
		let ctx = this.getContext();
		ctx.putImageData(rawPixels, 0, 0);
		return ctx
	}
	setupContext(props) {
		let ctx = this.getContext();
		Object.entries(props).forEach(([id, value]) => {
			ctx[id] = value
		});
		return ctx
	}
	
	clickDraw(x, y, w, h, a) {}
	startDraw(x, y, a) {}
	moveDraw(x, y) {}
	endDraw(x, y) {}
}

class Brush extends BaseTool {
	static get metadata() {
		return {
			name: "Кисть",
			icon: "resources/tool__brush.png"
		}
	}
	static get optionsDefaults() {
		return {
			lineWidth: 10,
			fillStyle: "#000"
		}
	}
	startDraw(x, y, a) {
		this.setupContext({
			lineWidth: this.options.lineWidth,
			strokeStyle: a ? "#00000000" : this.options.fillStyle,
			lineCap: 'round'
		}).beginPath();
		this.points = [{x, y}];
	}
	moveDraw(x, y) {
		this.points.push({x, y});
		if (this.points.length == 1) {
			this.getContext().moveTo(this.points[0].x, this.points[0].y);
			return
		}
		let i = this.points.length - 1;
		this.getContext().quadraticCurveTo(
			this.points[i - 1].x,
			this.points[i - 1].y,
			(this.points[i - 1].x + this.points[i].x) / 2,
			(this.points[i - 1].y + this.points[i].y) / 2
		);
		this.getContext().stroke();
	}
	endDraw(x, y) {
		let i = this.points.length - 1;
    	this.getContext().quadraticCurveTo(
			this.points[i].x,
			this.points[i].y,
      		x, y
    	);
		this.points = [];
		this.getContext().stroke();
	}
}

class Eraser extends Brush {
	static get metadata() {
		return {
			name: "Резинка",
			icon: "resources/tool__eraser.png"
		}
	}
	static get optionsDefaults() {
		return {
			lineWidth: 10
		}
	}
	startDraw(x, y, a) {
		super.startDraw(x, y, true);
		this.getContext().globalCompositeOperation="destination-out";
	}
	endDraw(x, y) {
		super.endDraw(x, y);
		this.getContext().globalCompositeOperation="source-over";
	}
}

class Bucket extends BaseTool {
	static get metadata() {
		return {
			name: "Заливка",
			icon: "resources/tool__bucket.png"
		}
	}
	static get optionsDefaults() {
		return {
			threshold: .86,
			fillStyle: "#000"
		}
	}

	clickDraw(x, y) {
		const fillColor = parseInt(`0x${this.options.fillStyle.match(/[0-F]{2}/gi).reverse().join("")}`);
		const ctx = this.getContext();
		const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
		const pixelData = {
		  	width: imageData.width,
		  	height: imageData.height,
		  	data: new Uint32Array(imageData.data.buffer),
		};
		const getPixel = (x, y) => (x < 0 || y < 0 || x >= pixelData.width || y >= pixelData.height) ? -1 : pixelData.data[y * pixelData.width + x];
		const targetColor = getPixel(x, y);
		if (targetColor !== fillColor) {
		  	const pixelsToCheck = [x, y];
		  	while (pixelsToCheck.length > 0) {
				const y = pixelsToCheck.pop();
				const x = pixelsToCheck.pop();
				const currentColor = getPixel(x, y);
				if (currentColor === targetColor) {
			  		pixelData.data[y * pixelData.width + x] = fillColor;
			  		pixelsToCheck.push(x + 1, y);
			  		pixelsToCheck.push(x - 1, y);
			  		pixelsToCheck.push(x, y + 1);
			  		pixelsToCheck.push(x, y - 1);
				}
			}
		}
		this.putImageData(imageData);
	}
}

class Rectangle extends BaseTool {
	static get metadata() {
		return {
			name: "Прямоугольник",
			icon: "resources/tool__rect.png"
		}
	}
	static get optionsDefaults() {
		return {
			fillStyle: "#000"
		}
	}
	startDraw(x, y, a) {
		this.setupContext({
			fillStyle: this.options.fillStyle
		});
		this.drawing = [x, y];
	}
	moveDraw(x, y) {
		if(!this.drawing) return;
		let ctx = this.getContext(), s = this.drawing;
		ctx.undo();
		ctx.fillStyle = this.options.fillStyle;
		ctx.fillRect(s[0], s[1], x - s[0], y - s[1]);
	}
	endDraw(x, y) {
		if(!this.drawing) return;
		let ctx = this.getContext(), s = this.drawing;
		ctx.fillStyle = this.options.fillStyle;
		ctx.fillRect(s[0], s[1], x - s[0], y - s[1]);
		this.drawing = null;
	}
}

class Text extends BaseTool {
	static get metadata() {
		return {
			name: "Текст",
			icon: "resources/tool__text.png"
		}
	}
	static get optionsDefaults() {
		return {
			fontFamily: "Serif",
			fontSize: 14,
			textAlign: "left",
			fillStyle: "#000"
		}
	}
	clickDraw(x, y) {
		const text = prompt("Введите текст:\n");
		if(!text) return;
		const ctx = this.getContext();
		ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
		ctx.textAlign = this.options.textAlign;
		ctx.fillStyle = this.options.fillStyle;
		ctx.fillText(text, x, y);
	}
}
