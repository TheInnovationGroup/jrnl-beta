import { Database } from '../lib/database.js'
import { Util } from '../lib/util.js'

export class PageIndexItem {
    
    /**
     * @param {Page} page 
     */
    constructor(page) {

        this.id = page.id
        this.title = page.title
        this.create_timestamp = page.create_timestamp
        this.update_timestamp = page.update_timestamp
    }
}

export class Page {

    constructor(data) {

        if (data && typeof data === typeof {}) {

            this.id = data.id
            this.title = data.title
            this.create_timestamp = data.create_timestamp
            this.update_timestamp = data.update_timestamp
            this.content = data.content ? data.content : []
        }
        else {

            let timestamp = new Date().getTime()
            this.id = Util.random_uuid
            this.title = Util.todays_date
            this.create_timestamp = timestamp
            this.update_timestamp = timestamp
            this.content = []
        }
    }

    /**
     * Creates a new page
     * @returns { Promise<Page> }
     */
    create() {

        return new Promise((resolve, reject) => {

            let page = new Page()

            let tx = Database.db.transaction("pages", "readwrite")
            let store = tx.objectStore("pages")
            let index = store.index('by_title')

            let search = index.count(this.title)
            search.onsuccess = (ev) => { this.check_title(store, index, this.title, 1, ev, resolve, reject) }
        })
    }

    /**
     * 
     * @param {IDBObjectStore} store 
     * @param {IDBIndex} index
     * @param {string} title 
     * @param {integer} idx 
     * @param {Event} ev 
     * @param {Function} resolve 
     * @param {Function} reject 
     */
    check_title(store, index, title, idx, ev, resolve, reject) { 

        if (ev.target.result) { 

            ++idx
            title = this.title + ' (' + idx + ')'
            let search = index.count(title)
            search.onsuccess = (ev) => { this.check_title(store, index, title, idx, ev, resolve, reject) }
            return
        }

        this.title = title
        store.put(this)
        resolve(this)
    }

    /**
     * @param { string } id
     * @returns { Promise<Page> }
     */
    static load(id) {

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
     * Commits the page data to the DB
     * @returns { Promise<Page> }
     */
    save() {

        return new Promise((resolve, reject) => {

            let tx = Database.db.transaction("pages", "readwrite")
            let store = tx.objectStore("pages")

            let request = store.count(this.id)
            request.onsuccess = (ev) => {

                if (ev.target.result) { 
                    store.put(this) 
                    return resolve(this) 
                }

                let index = store.index('by_title')
                let search = index.count(this.title)
                search.onsuccess = (ev) => { this.check_title(store, index, this.title, 1, ev, resolve, reject) }
            }
        })
    }
}