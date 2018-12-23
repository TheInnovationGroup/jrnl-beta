export class Database {

    /**
     * @returns {IDBDatabase}
     */
    static get db() { return this._db ? this._db : null }

    /**
     * @param {IDBDatabase} value
     */
    static set db(value) { this._db = value }

    /**
     * @returns {IDBObjectStore}
     */
    static get pages_store() { return this._pages ? this._pages : null }

    /**
     * @param {IDBObjectStore} value
     */
    static set pages_store(value) { this._pages = value }

    /**
     * Initializes the Database class
     * @returns {Promise}
     */
    static init() {

        return new Promise((resolve, reject) => {

            try {
                let request = indexedDB.open("journal", new Date().getTime())
                request.onupgradeneeded = () => { Database.on_upgrade_needed(request, resolve) }
                request.onsuccess = () => { resolve(Database.on_open(request)) }
            }
            catch(error) { reject(error) }
        })
    }

    /**
     * @param {IDBOpenDBRequest} request
     * @param {Function} resolve
     */
    static on_upgrade_needed(request, resolve) {
    
        Database.db = request.result
        Database.db.transaction.oncomplete = resolve

        if (!Database.db.objectStoreNames.contains('pages')) {
    
            Database.pages_store = Database.db.createObjectStore("pages", { keyPath: "id" })
            var title_index = Database.pages_store.createIndex('by_title', 'title', { unique: true })
            var create_stamp_index = Database.pages_store.createIndex('by_create_timestamp',  'create_timestamp')
            var update_stamp_index = Database.pages_store.createIndex('by_update_timestamp',  'update_timestamp')
        }
    }

    /**
     * @param {IDBOpenDBRequest} request
     */
    static on_open(request) {

        Database.db = request.result
        let tx = Database.db.transaction('pages', 'readwrite')
        Database.pages_store = tx.objectStore('pages')
    }
}