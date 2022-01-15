class AppHeader extends HTMLElement {
	addMenuItem({name, ctrl, float}, func) {
		var li = document.createElement("li"),
		a = document.createElement("a");
		a.innerText = name;
		// TODO category
		if(float) li.style.float = float;
		if(ctrl){
			a.title = `Горячая клавиша: Ctrl+${ctrl.toUpperCase()}`;
			document.body.addEventListener("keydown", e => {
				if(e.ctrlKey && event.key === ctrl){
					e.preventDefault();
					a.click();
				}
			}, false);
		}
		a.addEventListener("click", func);
		li.appendChild(a);
		this.shadowRoot.querySelector("ul").appendChild(li);
	}
	constructor() {
		super();
		let header = document.createElement("header"),
		style = document.createElement("style");
		header.innerHTML = `<ul></ul>`;
		style.textContent = `
		:host header {
			color: var(--fontcolor-a);
			background: var(--bgcolor-a);
			box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, .86);
			-webkit-user-select: none;
			-moz-user-select: none;
			-ms-user-select: none;
			user-select: none;
		}
		ul {
			display: flex;
			flex-flow: row nowrap;
			align-content: space-around;
			margin: 0
		}
		li {list-style: none}
		a {
			display: inline-block;
			color: inherit;
			font-size: .86em;
			padding: .5em;
			text-decoration: none;
		}
		a:hover {background: var(--bgcolor-b)}
		`;
		let shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(style);
		shadow.appendChild(header);
	}
}

customElements.define('app-header', AppHeader);