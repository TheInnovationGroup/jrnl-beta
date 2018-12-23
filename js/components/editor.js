import { Page } from '../types/page.js'
import { PageController } from '../components/pagecontroller.js'

export class Editor {

    /**
     * @returns { HTMLUListElement }
     */
    static get element() { return this._element ? this._element : null }

    /**
     * @param { HTMLUListElement } value
     */
    static set element(value) { this._element = value }

    /**
     * @returns { HTMLInputElement }
     */
    static get title_el() { return this._title_el ? this._title_el : null }

    /**
     * @param { HTMLInputElement } value
     */
    static set title_el(value) { this._title_el = value }

    /**
     * @returns { Page }
     */
    static get current_page() { return this._current_page ? this._current_page : null }

    /**
     * @param { Page } value
     */
    static set current_page(value) { this._current_page = value }


    /**
     * Initialize this component
     * @param { string } selector
     */
    static init(selector) {

        Editor.element = document.querySelector(selector)
        Editor.element.onclick = Editor.on_click
    }

    /**
     * Handles a click event
     * @param { MouseEvent } ev 
     */
    static on_click(ev) {

        switch (ev.target.nodeName) {

            case 'MAIN':
                return Editor.on_click_main(ev)

            case 'INPUT':
                return Editor.on_click_input(ev)
        }
    }

    /**
     * Handle a click on the main editor pane
     * @param { MouseEvent } ev 
     */
    static on_click_main(ev) {

       // debugger
    }

    /**
     * Handle a click on the main editor pane
     * @param { MouseEvent } ev 
     */
    static on_click_input(ev) {

        //debugger
    }

    /**
     * Loads a page and returns it to the promise chain
     * @param { Page } page 
     * @returns { Promise<Page> }
     */
    static load_page(page) {

        return new Promise((resolve, reject) => {

            if (!page) { return reject('no page provided') }

            while (this.element.childElementCount) {
                this.element.removeChild(this.element.firstChild)
            }

            this.page = page
            this.init_page_title()

            if (!page.content) { return resolve(page) }
    
            for (var i = 0, ii = page.content.length; i != ii; ++i) {
                this.element.innerText += page.content[i]
            }

            resolve(page)
        }) 
    }

    /**
     * Initialize the title element
     */
    static init_page_title() {

        this.title_el = document.createElement('input')
        this.title_el.classList.add('title')
        this.title_el.value = this.page.title
        this.title_el.dataset.originalvalue = this.page.title
        
        this.title_el.onchange = this.update_title.bind(this)
        this.element.appendChild(this.title_el)
    }

    /**
     * Update the page title when changed
     */
    static update_title() {

        this.title_el.classList.remove('selected')
        this.page.title = this.title_el.value

        try {
            PageController.save_page(this.page)
                .then((e) => { })
                .catch((e) => { (this.title = this.title_el.value = this.title_el.originalvalue) })

        }
        catch (e) {
            
        }
    }
}