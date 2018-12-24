import { Page, PageIndexItem } from '../types/page.js'
import { Dialog } from './dialog.js'
import { Editor } from './editor.js'
import { API } from '../lib/api.js'

export class PageController {

    /**
     * @returns { Array<PageIndexItem> }
     * @static
     */
    static get items() { return this._items ? this._items : null }

    /**
     * @param { Array<PageIndexItem> } value
     * @static
     */
    static set items(value) { this._items = value }

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
     * @param { Dialog } value
     * @static
     */
    static set confirm_delete_dialog(value) { this._confirm_delete_dialog = value}

    /**
     * @returns { Dialog }
     * @static
     */
    static get confirm_delete_dialog() { return this._confirm_delete_dialog ? this._confirm_delete_dialog : null }

    /**
     * Initialize this component using the provided CSS selector
     * @param { string } selector
     * @static
     */
    static init(selector) {

        PageController.element = document.querySelector(selector)
        PageController.refresh()
            .then(PageController.init_first_page)

        this.confirm_delete_dialog = new Dialog('confirm-delete-page')
    }

    /**
     * Load the first page, or create one if it doesn't exist
     * @static
     */
    static init_first_page() {

        if (!PageController.items.length) { PageController.new_page() }
        else { PageController.on_click_page(PageController.items[0].id) }
    }

    /**
     * Refreshes the page list
     * @returns { Promise<any> }
     * @static
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
     * @param { Array<PageIndexItem> } items
     * @static
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
     * @param { PageIndexItem } item
     * @returns { HTMLLIElement }
     * @static
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
     * @static
     */
    static new_page() {

        return new Promise((resolve, reject) => {

            let page = new Page()

            page.save()
                .then(() => { return PageController.refresh() })
                .then(() => { return Editor.load_page(page) })
                .then(() => { PageController.highlight(page.id) && resolve(page) })
                .catch((e) => { console.log(e) })
        })
    }

    /**
     * Save the page and refresh the page list
     * @param { Page } page
     * @returns { Promise<Page } page
     * @static
     */
    static save_page(page) {

        return new Promise((resolve, reject) => {
            
            page.save()
                .then(() => { return PageController.refresh() })
                .then(() => { PageController.highlight(page.id) && resolve(page) })
                .catch((e) => { console.log(e) })
        })
    }

    /**
     * Handles a click event for page list
     * @param { string } id 
     */
    static on_click_page(id) {

        Page.load(id)
            .then((page) => { return Editor.load_page(page) })
            .then((page) => { PageController.highlight(id) })
            .catch((e) => { console.log(e) })
    }

    /**
     * Highlights a list item
     * @param { string } id
     * @static
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

    /**
     * Requests confirmation to delete the current page
     * @static
     */
    static delete_current_page() {

        let page = Editor.page

        let options = {
            params: { title: page.title },
            handlers: { ok: PageController.delete_page.bind(PageController, page.id) }
        }

        PageController.confirm_delete_dialog.show(options)
    }

    /**
     * Deletes a page with the provided id
     * @param { string } id 
     */
    static delete_page(id) {
        
        try {
            API.delete_page(id)
                .then(PageController.refresh)
                .then(Editor.reset)
        }
        catch(e) { console.log(e) }
    }
}