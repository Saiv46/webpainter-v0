const Editor = {
	newFile() {
		this.setStatus("Создание нового полотна...");
		let form = document.querySelector("#blank form");
		this.canvas.plain({
			name: form.name.value + ".png",
			size: [
				+form.width.value,
				+form.height.value
			]
		});
		this.setFileName(this.canvas.name);
		this.setStatus("Готово");
	},
	openFile() {
		this.setStatus("Загрузка изображения...");
		let input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		input.onchange = e => {
			e.preventDefault();
			let file = e.target.files[0];
			Editor.canvas.fromFile(file).then(v => {
				Editor.setFileName(Editor.canvas.name);
				Editor.setStatus("Готово");
			}, err => {
				console.error("Failed to load image", err);
				Editor.setStatus("Не удалось загрузить изображение", Editor.status.WARN);
			}).then(() => {
				delete file;
				delete input;
			});
		};
		input.click();
	},

	saveFile() {
		this.setStatus("Сохранение изображения...");
		this.canvas.toFile().then(file => {
			let a = document.createElement("a");
			a.href = URL.createObjectURL(file);
			a.download = file.name;
			a.click();
			URL.revokeObjectURL(a.href);
			Editor.setStatus("Готово");
		}, err => {
			console.error("Failed to save image", err);
			Editor.setStatus("Не удалось сохранить изображение", Editor.status.WARN);
		});
	},

	get options() {
		return document.querySelector("options-picker").value
	},

	registerTool(tool) {
		return document.querySelector("tool-picker").registerTool(tool);
	},

	/**
	 * Checks if a font is available to be used on a web page.
	 *
	 * @param {String} font The name of the font to check
	 * @return {Boolean}
	 * @license MIT
	 * @copyright Sam Clarke 2013
	 * @author Sam Clarke <sam@samclarke.com>
	 */
	isFontAvailable(font) {
		const container = document.createElement('span');
		container.innerHTML = Array(100).join('wi');
		container.style.cssText = [
	  		'position:absolute',
	  		'width:auto',
	  		'font-size:128px',
	  		'left:-99999px'
		].join(' !important;');
  
		const getWidth = fontFamily => {
	  		container.style.fontFamily = fontFamily;
	  		document.body.appendChild(container);
	  		const width = container.clientWidth;
	  		document.body.removeChild(container);
	  		return width;
		};

		const result = 
			getWidth('monospace') !== getWidth(font + ',monospace') ||
			getWidth('serif') !== getWidth(font + ',sans-serif') ||
			getWidth('sans-serif') !== getWidth(font + ',serif');
		
		return result;
	},

	init() {
		this.setStatus("Инициализация...");
		this.canvas = document.querySelector("app-canvas");

		const header = document.querySelector("app-header");
		document.querySelector("#blank a.create").onclick = () => this.newFile();
		[
			[{name: "Новый файл"}, () => document.querySelector("#blank").showModal()],
			[{name: "Открыть", ctrl: "o"}, () => this.openFile()],
			[{name: "Сохранить", ctrl: "s"}, () => this.saveFile()],
			[{name: "Отмена", ctrl: "z"}, () =>this.canvas.undo()],
			[{name: "Повторить", ctrl: "y"}, () => this.canvas.redo()],
			[{name: "", ctrl: "y", float: "center"}, () => document.querySelector("#egg").showModal()],
			[{name: "О программе", float: "right"}, () => document.querySelector("#about").showModal()]
		].forEach(v => header.addMenuItem(...v));
		
		document.querySelectorAll("dialog a[hide]").forEach(v => 
			v.addEventListener("click", () => v.offsetParent.close()));

		const options = document.querySelector("options-picker");
		[
			Brush,
			Rectangle,
			Text,
			Eraser,
			Bucket
		].forEach(this.registerTool, this);
		document.querySelector("tool-picker")
		.addEventListener("change", ({target: {value: {metadata, optionsDefaults}}}) => {
			Editor.setStatus(`Инструмент ${metadata.name}`);
			options.showOptions(Object.keys(optionsDefaults));
			options.value = Object.assign(optionsDefaults, options.value);
		});

		this.setStatus("Готово");
	},

	status: Object.freeze({INFO: 0, WARN: 1, ERR: 2}),
	setStatus(text, level = Editor.status.INFO) {
		const pref = ["", "\u26A0 ", "\u274C "];
		const status = document.querySelector("#status");
		status.style["font-weight"] = level ? "bold" : "";
		status.innerText = pref[level] + text;
	},
	setFileName(name) {
		document.querySelector("#fileinfo").innerText = name || "Файл не выбран";
	}
};

document.addEventListener("DOMContentLoaded", () => {
	try {
		[
			'AppHeader',
			'AppAside',
			'AppFooter',
			'AppCanvas',
			'CanvasLayer',
			'ToolPicker',
			'ColorPicker',
			'BaseTool'
		].forEach(v => {
			if(typeof v === "undefined"){
				throw new Error(`${v} component is not defined`);
			}
		});

		Editor.init();
	} catch(e) {
		console.error(e);
		let m = document.querySelector("#error");
		m.querySelector("code").innerHTML = e.stack || e.toString();
		m.showModal();
		Editor.setStatus("Ошибка загрузки", Editor.status.ERR);
	}
});