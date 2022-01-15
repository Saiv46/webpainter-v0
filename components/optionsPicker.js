class OptionsPicker extends HTMLElement {
	showOptions(ids){
		Object.entries(this.value).forEach(([id]) => {
			if(!~ids.indexOf(id)){
				let el = this.shadowRoot.querySelector(`li[data-entry-id="${id}"]`);
				if(el && el.style.display !== "none") el.style.display = "none";
			}
		});
		ids.forEach(id => {
			let el = this.shadowRoot.querySelector(`li[data-entry-id="${id}"]`);
			if(el && el.style.display === "none") el.style.display = "";
		});
	}
	addOption({id, label, type = "text", defaultValue, options}) {
		let li = document.createElement("li");
		li.innerText = label || id;
		li.setAttribute("data-entry-id", id);
		li.style.display = "none";
		this.shadowRoot.querySelector("ul").appendChild(li);

		if(type == "select"){
			let select = document.createElement("select");
			(Array.isArray(options) ? options : Object.entries(options))
			.forEach((args, i) => {
				let option = document.createElement("option");
				if(typeof args === "string") args = [args, args];
				[option.value, option.innerText] = args;
				if(!i) option.selected = true;
				select.appendChild(option);
			});
			select.onchange = () => {this.value[id] = select.value};
			li.appendChild(select);
		} else {
			let input = document.createElement("input");
			input.type = type;
			input.value = defaultValue || "";
			input.onchange = () => {this.value[id] = input.value};
			li.appendChild(input);
		}
	}
	connectedCallback() {
		this.value = {};
		[
			{
				id: "lineWidth",
				label: "Длина линии",
				type: "number",
				defaultValue: 10
			},
			{
				id: "fontSize",
				label: "Размер текста",
				type: "number",
				defaultValue: 16
			},
			{
				id: "fontFamily",
				label: "Шрифт",
				type: "select",
				options: [
					'Arial',
					'Arial Black',
					'Helvetica',
					'Impact',
					'Tahoma',
					'Trebuchet MS',
					'Calibri',
					'Times New Roman',
					'Georgia',
					'Segoe UI',
					'Garamond',
					'Roboto'
				].filter(Editor.isFontAvailable)
			},
			{
				id: "textAlign",
				label: "Выравнивание текста",
				type: "select",
				options: {
					left: "Влево",
					right: "Вправо",
					center: "По центру"
				}
			}
		].forEach(this.addOption, this);
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
			flex-flow: column nowrap;
			align-content: space-between;
			padding: 0;
			margin: 0
		}
		li {
			list-style: none;
			margin: 0 auto;
		}
		input {
			padding: .2em;
			margin-left: .5em;
		}
		`;
		let shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(style);
		shadow.appendChild(div);
	}
}

customElements.define('options-picker', OptionsPicker);