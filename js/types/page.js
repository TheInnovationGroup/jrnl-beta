import { Database } from '../lib/database.js'
import { Util } from '../lib/util.js'
import { API } from '../lib/api.js';

export class PageIndexItem {
    
    /**
     * @param { PageIndexItem } item 
     */
    constructor(item) {

        this.id = item.id
        this.title = item.title
        this.create_timestamp = item.create_timestamp
        this.update_timestamp = item.update_timestamp
    }
}

export class PageContent {

    get type() { }
    get value() { }
    get options() { }

    constructor() {

    }
}

export class Page {

    /**
     * Load a page by page id
     * @param { string } id
     * @returns { Promise<Page> }
     * @static
     */
    static load(id) { return API.load_page(id) }

    /**
     * Create a page instance using the provided data, or create a new page
     * @param { Page } data 
     */
    constructor(data) {

        if (data && typeof data === typeof {}) {

            this.id = data.id
            this.title = data.title
            this.create_timestamp = data.create_timestamp
            this.update_timestamp = data.update_timestamp
            this.content = data.content ? data.content : []
            this.tags = data.tags ? data.tags : ''
        }
        else {

            let timestamp = new Date().getTime()
            this.id = Util.random_uuid
            this.title = Util.todays_date
            this.create_timestamp = timestamp
            this.update_timestamp = timestamp
            this.content = []
            this.tags = ''
        }
    }

    /**
     * Saves a new page, or updates the record for an existing one
     * @returns { Promise<Page> }
     */
    save() { return API.save_page(this) }
}