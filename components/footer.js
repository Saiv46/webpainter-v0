class AppFooter extends HTMLElement {
	constructor() {
		super();
		let footer = document.createElement("footer"),
		style = document.createElement("style");
        footer.innerHTML = `
            <slot name="status"></slot>
            <slot name="fileinfo"></slot>
        `;
		style.textContent = `
		:host footer {
			color: var(--fontcolor-a);
			background: var(--bgcolor-a);
			box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, .86);
            margin: 0;
			padding: .2em 1em;
			-webkit-user-select: none;
			-moz-user-select: none;
			-ms-user-select: none;
			user-select: none;
		}
		span {
            color: inherit;
            font-size: .86em;
			padding: .2em;
        }
        slot[name="fileinfo"]::slotted(*) {float: right}
		`;
		let shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(style);
		shadow.appendChild(footer);
	}
}

customElements.define('app-footer', AppFooter);