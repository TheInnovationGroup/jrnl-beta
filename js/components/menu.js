import { PageController } from './pagecontroller.js'

export class Menu {

    /**
     * @returns {{string: HTMLButtonElement}}
     */
    static get buttons() { return this._buttons ? this._buttons : {} }

    /**
     * @param {{string: HTMLButtonElement}}
     */
    static set buttons(value) { this._buttons = value }

    /**
     * Initialize this component using the provided CSS selector
     * @param {string} selector
     */
    static init(selector) {

        let container = document.querySelector(selector)
        let buttons = container.querySelectorAll('button')

        for (var i = 0, ii = buttons.length; i != ii; ++i) {

            let button = buttons[i]
            Menu.buttons[button.name] = button

            switch (button.name) {

                case 'new':
                    button.onclick = PageController.new_page
                    break;
    
            }
        }
    }
}