class AppAside extends HTMLElement {
    show() {
        this.style.display = null;
        this.dispatchEvent(this._showEvent);
    }
    hide() {
        this.style.display = "none";
        this.dispatchEvent(this._hideEvent);
    }
    toggleContent() {
        const contentStyle = this.shadowRoot.querySelector(".content").style;
        contentStyle.display = contentStyle.display === "none" ? "" : "none";
    }

	constructor() {
		super();
		let main = document.createElement("aside"),
		style = document.createElement("style");
        main.innerHTML = `
        <p class="topbar">
            <slot name="title"></slot>
            <a href="#" hide>_</a>
            <!--<a href="#" close>X</a>-->
        </p>
        <div class="content"><slot></slot></div>
        `;
        style.textContent = `
        :host {
            position: fixed;
            z-index: 999;
        }
        aside {
            min-width: var(--width);
            min-height: var(--height);
            background: var(--bgcolor-c);
            color: var(--fontcolor-c);
            box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, .86);
        }
        .topbar {
            background: var(--bgcolor-a);
            color: var(--fontcolor-a);
            margin: 0;
        }
        .topbar, slot[name="title"]::slotted(span) {
            -webkit-user-select: none;
			-moz-user-select: none;
			-ms-user-select: none;
			user-select: none;
        }
        slot[name="title"]::slotted(span), .topbar a {
            display: inline-block;
            padding: .5em 1em;
            color: var(--fontcolor-a);
        }
        .topbar a {
            text-decoration: none;
            float: right;
            font-weight: 700;
        }
        .topbar a:hover {background: var(--bgcolor-c)}
        `;
		let shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(style);
        shadow.appendChild(main);
    }
    connectedCallback() {
        this._showEvent = new Event('show');
        this._hideEvent = new Event('hide');
        /*this.shadowRoot.querySelector("a[close]")
            .addEventListener("click", () => this.hide());*/
        this.shadowRoot.querySelector("a[hide]")
            .addEventListener("click", () => this.toggleContent());
        // Drag'n'Drop
        this.shadowRoot.querySelector("p")
            .addEventListener("mousedown", e => {
                if(this.style.display == "none") return;
                const box = this.getBoundingClientRect();
                const shiftX = e.pageX - box.left + pageXOffset;
                const shiftY = e.pageY - box.top + pageYOffset;

                const boundHeightStart = parseInt(window.getComputedStyle(document.querySelector("app-header")).height.slice(0, -2));
                const boundHeightEnd = window.innerHeight - box.height - parseInt(window.getComputedStyle(document.querySelector("app-footer")).height.slice(0, -2));
                const boundWidthStart = 0;
                const boundWidthEnd = window.innerWidth - box.width;

                document.onmousemove = e => {
                    this.style.left = Math.max(boundWidthStart, Math.min(boundWidthEnd, e.pageX - shiftX)) + 'px';
                    this.style.top = Math.max(boundHeightStart, Math.min(boundHeightEnd, e.pageY - shiftY)) + 'px';
                };
                this.onmouseup = () => {
                    document.onmousemove = null;
                    this.onmouseup = null;
                };
            }, false)
    }
}

customElements.define('app-aside', AppAside);