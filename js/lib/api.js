import { Database } from './database.js'
import { Page, PageIndexItem } from '../types/page.js'

export class API {

    /**
     * Get list of pages with id and title
     * @returns { Promise<Page[]> }
     * @static
     */
    static get_page_list() {

        return new Promise((resolve, reject) => {

            let tx = Database.db.transaction("pages", "readonly")
            let store = tx.objectStore("pages")
            let index = store.index('by_title')

            let request = index.openCursor()
            let items = []
    
            request.onsuccess = (ev) => {
                
                let cursor = ev.target.result
                if (!cursor) { return resolve(items) }
            
                let item = new PageIndexItem(cursor.value)
                items.push(item)
                cursor.continue()
            }
        })
    }

    /**
     * Load a page with the provided id
     * @param { string } id
     * @static
     */
    static load_page(id) {

        return new Promise((resolve, reject) => {

            let tx = Database.db.transaction("pages", "readonly")
            let store = tx.objectStore("pages")
            let request = store.get(id)

            request.onsuccess = (ev) => {
                let page = new Page(ev.target.result)
                resolve(page) 
            }

            request.onerror = (e) => { reject(e) }
        })
    }

    /**
     * Saves the provided Page to the DB
     * @param { Page } page 
     * @returns { Promise<Page> }
     * @static
     */
    static save_page(page) {

        return new Promise((resolve, reject) => {

            try {
                let tx = Database.db.transaction("pages", "readwrite")
                let store = tx.objectStore("pages")
    
                let request = store.count(page.id)
                request.onsuccess = (ev) => {
    
                    if (ev.target.result) { 
                        store.put(page) 
                        return resolve(page) 
                    }
    
                    let index = store.index('by_title')
                    let search = index.count(page.title)
                    search.onsuccess = (ev) => { API.check_page_title(page, store, index, page.title, 1, ev, resolve, reject) }
                }

                request.onerror = (e) => { reject(e) }
            }
            catch(e) { 
                console.log(e) 
                reject(e)
            }
        })
    }

      /**
     * Check whether the title already exists and if so append (x+1)
     * 
     * @param { Page } page
     * @param { IDBObjectStore } store 
     * @param { IDBIndex } index
     * @param { string } title 
     * @param { number } idx 
     * @param { Event } ev 
     * @param { Function } resolve 
     * @param { Function } reject 
     */
    static check_page_title(page, store, index, title, idx, ev, resolve, reject) { 

        if (ev.target.result) { 

            ++idx
            title = page.title + ' (' + idx + ')'
            let search = index.count(title)
            search.onsuccess = (ev) => { API.check_page_title(page, store, index, title, idx, ev, resolve, reject) }
            return
        }

        page.title = title
        store.put(page)
        resolve(page)
    }

    /**
     * Delete a page with the provided id
     * @param {string} id
     * @returns { Promise<void> }
     * @static
     */
    static delete_page(id) {

        return new Promise((resolve, reject) => {

            let tx = Database.db.transaction("pages", "readwrite")
            let store = tx.objectStore("pages")

            let request = store.delete(id)
            request.onsuccess = (ev) => { return resolve(ev) }
            request.onerror = (e) => { return reject(e) }
        })
    }
}