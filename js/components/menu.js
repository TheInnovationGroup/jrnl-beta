import { PageController } from './pagecontroller.js'
import { Editor } from '../components/editor.js'
import { Dialog } from './dialog.js';

export class Menu {

    /**
     * @returns { { string: HTMLButtonElement } }
     * @static
     */
    static get buttons() { return this._buttons ? this._buttons : {} }

    /**
     * @param { { string: HTMLButtonElement } }
     * @static
     */
    static set buttons(value) { this._buttons = value }

    /**
     * Enables or disables editor-related button group
     * @param { boolean } value
     * @static
     */
    static set editor_controls_enabled(value) {

        let buttons = document.querySelectorAll('.editor-controls > button')
        for (var i = 0, ii = buttons.length; i != ii; ++i) { buttons[i].disabled = !value }
        
        this.buttons.delete.disabled = !value
    }

    /**
     * Initialize this component using the provided CSS selector
     * @param { string } selector
     * @static
     */
    static init(selector) {

        let container = document.querySelector(selector)
        let buttons = container.querySelectorAll('button')

        for (var i = 0, ii = buttons.length; i != ii; ++i) {

            let button = buttons[i]
            buttons[button.name] = button

            switch (button.name) {

                case 'new':
                    button.onclick = PageController.new_page
                    break

                case 'delete':
                    button.onclick = PageController.delete_current_page
                    break

                case 'info':
                    button.onclick = Menu.open_info_dialog
                    break;

                case 'settings':
                    // button.onclick = 
                    break

                case 'text':
                    button.onclick = Editor.new_textarea
                    break
                    
                case 'list-numbered':
                    break
                    
                case 'list-bullet':
                    break

            }
        }

        Menu.buttons = buttons
    }

    /**
     * Display the jrnl information dialog
     * @static
     */
    static open_info_dialog() {

        let info_dialog = new Dialog('info')
        info_dialog.show()
    }
}