import { Database } from './database.js'
import { Page, PageIndexItem } from '../types/page.js'

export class API {

    /**
     * @returns {Promise<Page[]>}
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
}