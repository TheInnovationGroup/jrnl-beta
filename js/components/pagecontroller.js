import { Page, PageIndexItem } from '../types/page.js'
import { Editor } from './editor.js'
import { API } from '../lib/api.js'

export class PageController {

    /**
     * @returns {Array<PageIndexItem>} 
     */
    static get items() { return this._items ? this._items : null }

    /**
     * @param {Array<PageIndexItem>} value
     */
    static set items(value) { this._items = value }

    /**
     * @returns {HTMLUListElement} 
     */
    static get element() { return this._element ? this._element : null }

    /**
     * @param {HTMLUListElement} value
     */
    static set element(value) { this._element = value }

    /**
     * Initialize this component using the provided CSS selector
     * @param {string} selector 
     */
    static init(selector) {

        PageController.element = document.querySelector(selector)
        PageController.refresh()
    }

    /**
     * Refreshes the page list
     * @returns {Promise<any>}
     */
    static refresh() {

        return new Promise((resolve, reject) => {
            
            try {

                while (PageController.element.childElementCount) {
                    PageController.element.removeChild(PageController.element.firstChild)
                }
                
                API.get_page_list()
                    .then((items) => { resolve(PageController.render(items)) })
                
            }
            catch (e) { console.log(e) && reject(e) }
        })
    }

    /**
     * Render the page list from the provided array of items
     * @param {Array<{id: string, title: string}>} items 
     */
    static render(items) {

        try {

            items.sort((a, b) => { return a.update_timestamp < b.update_timestamp })
            this.items = items
            
            for (var i = 0, ii = items.length; i != ii; ++i) {
    
                let li = PageController.render_item(items[i])
                PageController.element.appendChild(li)
            }
        }
        catch (e) { console.log(e) }
    }

    /**
     * Returns a li representing a page list item
     * @param {PageIndexItem} item
     * @returns {HTMLLIElement}
     */
    static render_item(item) {

        let li = document.createElement('li')
    
        li.dataset.id = item.id
        li.innerHTML = item.title
        li.onclick = (ev) => { PageController.on_click_page(ev.target.dataset.id) }

        return li
    }

    /**
     * Create a new notebook page, saves it to DB, and loads it
     * @returns { Promise<Page> }
     */
    static new_page() {

        return new Promise((resolve, reject) => {

            let page = new Page()

            page.save()
                .then(() => { return PageController.refresh() })
                .then(() => { return Editor.load_page(page) })
                .then((page) => { return PageController.highlight(page.id) })
                .catch((e) => { console.log(e) })
        })
    }

    /**
     * Save the page and refresh the page list
     * @param { Page } page
     * @returns { Promise<Page } page
     */
    static save_page(page) {

        return new Promise((resolve, reject) => {
            
            page.save()
                .then(() => { return PageController.refresh() })
                .then(() => { return PageController.highlight(page.id) })
                .then(() => { resolve(page) })
                .catch((e) => { console.log(e) })
        })
    }

    /**
     * Handles a click event for page list
     * @param {string} id 
     */
    static on_click_page(id) {

        Page.load(id)
            .then((page) => { return Editor.load_page(page) })
            .then((page) => { return PageController.highlight(id) })
            .catch((e) => { console.log(e) })
    }

    /**
     * Highlights a list item
     * @param {string} id
     */
    static highlight(id) {

        try {

            let nodelist = PageController.element.querySelectorAll('li')
            nodelist.forEach((li) => {

                if (li.dataset.id === id) { li.classList.add('selected') }
                else { li.classList.remove('selected') }
            })
        }
        catch(e) { console.log(e) }
    }
}