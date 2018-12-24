export class Database {

    /**
     * @returns { IDBDatabase }
     * @static
     */
    static get db() { return this._db ? this._db : null }

    /**
     * @param { IDBDatabase } value
     * @static
     */
    static set db(value) { this._db = value }

    /**
     * Initializes the Database class
     * @returns { Promise<void> }
     */
    static init() {

        return new Promise((resolve, reject) => {

            try {
                let request = indexedDB.open("journal", new Date().getTime())
                request.onupgradeneeded = (ev) => { Database.on_upgrade_needed(ev, request, resolve) }
                request.onsuccess = (ev) => { resolve(Database.on_open(ev, request)) }
            }
            catch(error) { reject(error) }
        })
    }

    /**
     * Perform maintenance and updates on the DB
     * @param { IDBOpenDBRequest } request
     * @param { Function } resolve
     */
    static on_upgrade_needed(ev, request, resolve) {
    
        Database.db = request.result
        Database.db.transaction.oncomplete = resolve

        let pages_store = (Database.db.objectStoreNames.contains('pages'))
            ? ev.target.transaction.objectStore('pages')
            : Database.db.createObjectStore("pages", { keyPath: "id" })

        if (!pages_store.indexNames.contains('by_title')) {
            pages_store.createIndex('by_title', 'title', { unique: true })
        }

        if (!pages_store.indexNames.contains('by_create_timestamp')) {
            pages_store.createIndex('by_create_timestamp',  'create_timestamp')
        }

        if (!pages_store.indexNames.contains('by_update_timestamp')) {
            pages_store.createIndex('by_update_timestamp',  'update_timestamp')
        }

        if (!pages_store.indexNames.contains('by_tags')) {
            pages_store.createIndex('by_tags', 'tags')
        }
    }

    /**
     * @param { IDBOpenDBRequest } request
     */
    static on_open(ev, request) {

        Database.db = request.result
        let tx = Database.db.transaction('pages', 'readwrite')
    }
}