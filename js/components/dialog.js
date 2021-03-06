export class DialogOptions {

    /**
     * @returns { { string: string }}
     */
    get params() { }

    /**
     * @returns { { string: Function }}
     */
    get handlers() { }
}

export class Dialog {

    /**
     * @returns { DialogOptions }
     */
    get options() { return this._options ? this._options : {} }

    /**
     * @param { DialogOptions } value
     */
    set options(value) { this._options = value }

    /**
     * Attach this handler to auto-hide on external click
     * @static
     */
    static attach_hide_listener() {

        document.onclick = () => {

            var target = event.target
            if (target.closest('dialog')) return
            Dialog.hide_all()
        }
    }

    /**
     * Hide all instances of this dialog
     */
    static hide_all() {

        if (!this.visible_instance) return
        this.visible_instance.hide()
    }

    /**
     * Create a new instance for a <dialog> with provided name
     * @param { string } name 
     */
    constructor(name) {

        this.container = document.querySelector('.dialog-container')
        this.dialog = document.querySelector("dialog[name='" + name + "']")
        this.buttons = this.dialog.querySelectorAll('button')

        for (var i = 0, ii = this.buttons.length; i != ii; ++i) {
            this.buttons[i].onclick = (ev) => { this.on_click_button.call(Dialog.visible_instance, ev) }
        }
    }

    /**
     * Performs a querySelector on this dialog element
     * @param { string } selector
     * @returns { HTMLElement }
     */
    querySelector(selector) {  return this.dialog.querySelector(selector) }

    /**
     * Show this dialog
     * @param { DialogOptions } options 
     */
    show(options) { 

        this.options = options
        if (this.options.params) {

            for (var i in this.options.params) {
                let item = this.container.querySelector("[name='" + i + "']")
                item.innerHTML = this.options.params[i]
            }
        }

        Dialog.visible_instance = this
        window.setTimeout(Dialog.attach_hide_listener, 200)

        this.container.classList.add('open')
        this.dialog.classList.add('open')
    }

    /**
     * Hide this dialog
     */
    hide() {

        this.container.classList.remove('open')
        this.dialog.classList.remove('open') 
        document.onclick = () => {}
    }

    /**
     * Handles a dialog button click
     * @param { MouseEvent } ev 
     */
    on_click_button(ev) {

        let dialog = Dialog.visible_instance

        let name = ev.target.name
        if (name == 'ok' || name == 'cancel') { dialog.hide() }

        if (dialog.options.handlers[name]) { dialog.options.handlers[name](ev) }
    }
}