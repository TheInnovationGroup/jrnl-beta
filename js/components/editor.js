import { Page, PageContent } from '../types/page.js'
import { PageSection } from '../components/pagesection.js'
import { PageController } from '../components/pagecontroller.js'
import { Menu } from '../components/menu.js'

export class Editor {

    /**
     * @returns { HTMLUListElement }
     * @static
     */
    static get element() { return this._element ? this._element : null }

    /**
     * @param { HTMLUListElement } value
     * @static
     */
    static set element(value) { this._element = value }

    /**
     * @returns { HTMLInputElement }
     * @static
     */
    static get title_el() { return this._title_el ? this._title_el : null }

    /**
     * @param { HTMLInputElement } value
     * @static
     */
    static set title_el(value) { this._title_el = value }

    /**
     * @returns { Page }
     * @static
     */
    static get page() { return this._page ? this._page : null }

    /**
     * @param { Page } value
     * @static
     */
    static set page(value) { this._page = value }

    /**
     * Initialize this component
     * @param { string } selector
     * @static
     */
    static init(selector) {

        Editor.element = document.querySelector(selector)
        Editor.element.onclick = Editor.on_click
    }

    /**
     * Handles a click event
     * @param { MouseEvent } ev
     * @static
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
     * @static
     */
    static on_click_main(ev) {

        if (!Editor.page) { return }
       
        if (ev.clientY > Editor.element.lastChild.getBoundingClientRect().bottom) {

            Editor.new_textarea()
        }
    }

    /**
     * Handle a click on the title input
     * @param { MouseEvent } ev
     * @static
     */
    static on_click_input(ev) {

        //debugger
    }

    /**
     * Loads a page and returns it to the promise chain
     * @param { Page } page 
     * @returns { Promise<Page> }
     * @static
     */
    static load_page(page) {

        return new Promise((resolve, reject) => {

            if (!page) { return reject('no page provided') }

            Editor.page = page
            Editor.render()
            
            Menu.editor_controls_enabled = true
            resolve(page)
        }) 
    }

    /**
     * Initialize the title element
     * @static
     */
    static init_page_title() {

        let title_el = document.createElement('input')

        title_el.classList.add('title')
        title_el.value = Editor.page.title
        title_el.dataset.originalvalue = Editor.page.title
        title_el.onchange = Editor.update_title.bind(Editor)
        title_el.onkeydown = () => { window.setTimeout(Editor.resize_title, 0) }
        
        Editor.title_el = title_el
        Editor.element.appendChild(Editor.title_el)
        Editor.resize_title()
    }

    /**
     * Update the page title when changed
     * @static
     */
    static update_title() {

        //this.title_el.classList.remove('selected')
        Editor.page.title = Editor.title_el.value

        PageController.save_page(Editor.page)
            .then((e) => { })
            .catch((e) => { (Editor.title = Editor.title_el.value = Editor.title_el.originalvalue) })
    }

    /**
     * Dynamically resize the notebook title when updated
     * @static
     */
    static resize_title() {

        Editor.title_el.size = (Editor.title_el.value.length > 10) 
            ? Editor.title_el.value.length + 1
            : 12
    }

    /**
     * Remove all HTMLElement items from the editor
     * @static
     */
    static clear() {

        while (Editor.element.childElementCount) {
            Editor.element.removeChild(Editor.element.firstChild)
        }
    }

    /**
     * Remove current page and clear the editor
     * @static
     */
    static reset() {

        Menu.editor_controls_enabled = false
        Editor.page = null
        Editor.clear()
    }

    /**
     * Render the editor using the current page content
     * @static
     */
    static render() {

        Editor.clear()
        Editor.init_page_title()
        
        Editor.page.content.forEach((item, index) => { Editor.render_item(index, item) })
    }

    /**
     * Render a single item to the editor
     * @param { number } index
     * @param { PageContent } item
     * @static
     */
    static render_item(index, item) {

        let section = new PageSection(index, item)
        section.on_change = Editor.on_change_section
        Editor.element.appendChild(section.container)
    }

    /**
     * Handles a change event for an item
     * @param { PageSection } section
     * @static
     */
    static on_change_section(section) {

        if (section.content.value === null) {
            Editor.delete_section(section)
        }

        PageController.save_page(Editor.page)
    }


    /**
     * Create a new <textarea> and add it to the editor
     * @static
     */
    static new_textarea() {

        let index = Editor.page.content.length
        let item = { type: 'text', value: null }
        let section = new PageSection(index, item)

        section.on_change = Editor.on_change_section

        Editor.element.appendChild(section.container)
        Editor.page.content.push(item)
        Editor.highlight_section(section)
        section.focus()
    }

    /**
     * Create a enw <ul> and add it to the editor
     * @static
     */
    static new_list_bullet() {

        let index = Editor.page.content.length
        let item = { type: 'ul', value: null }
        let section = new PageSection(index, item)

        Editor.element.appendChild(section.element)
        Editor.page.content.push(item)
        Editor.highlight_section(section)
        section.focus()
    }

    /**
     * Create a new <ul> and add it to the editor
     * @static
     */
    static new_list_numbered() {

    }

    /**
     * Delete a section from the page and editor
     * @param { PageSection } section
     * @static
     */
    static delete_section(section) {
        
        Editor.element.removeChild(section.container)
        Editor.page.content.splice(section.index, 1)

        PageController.save_page(Editor.page)
    }

    /**
     * Highlight the provided section 
     * @param { PageSection } section
     * @static
     */
    static highlight_section(section) {

        Editor.element.childNodes.forEach((item) => {
            item.classList.remove('selected')
        })

        section.container.classList.add('selected')
    }
}