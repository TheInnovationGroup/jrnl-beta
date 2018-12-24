import { Page, PageContent } from '../types/page.js'
import { Dialog } from './dialog.js'
import { Editor } from './editor.js';

export class PageSection {

    /**
     * @returns { number }
     */
    get index() { return this._index ? this._index : null }

    /**
     * @param { number } value 
     */
    set index(value) { this._index = value }

    /**
     * @returns { PageContent }
     */
    get content() { return this._content ? this._content : null }

    /**
     * @param { PageContent } value 
     */
    set content(value) { this._content = value }

    /**
     * @returns { HTMLElement }
     */
    get container() { return this._container ? this._container : null }

    /**
     * @param { Element } value 
     */
    set container(value) { this._container = value }

    /**
     * @returns { HTMLElement }
     */
    get element() { return this._element ? this._element : null }

    /**
     * @param { Element } value 
     */
    set element(value) { this._element = value }

    /**
     * @returns { Function }
     */
    get on_change() { return this._on_change ? this._on_change : () => { } }

    /**
     * @param { Function } value 
     */
    set on_change(value) { this._on_change = value }

    /**
     * @param { Dialog } value
     */
    static set confirm_delete_dialog(value) { this._confirm_delete_dialog = value}

    /**
     * @returns { Dialog }
     */
    static get confirm_delete_dialog() { return this._confirm_delete_dialog ? this._confirm_delete_dialog : null }

    /**
     * @param { Dialog } value
     */
    static set edit_tags_dialog(value) { this._edit_tags_dialog = value}

    /**
     * @returns { Dialog }
     */
    static get edit_tags_dialog() { return this._edit_tags_dialog ? this._edit_tags_dialog : null }

    /**
     * @param { number } index
     * @param { PageContent } content 
     */
    constructor(index, content) {

        this.index = index
        this.content = content

        this.container = document.createElement('section')
        this.container.dataset.index = index
        this.container.onclick = () => { Editor.highlight_section(this) }

        this.confirm_delete_dialog = new Dialog('confirm-delete-section')
        this.edit_tags_dialog = new Dialog('edit-section-tags')

        let controls = document.createElement('div')
        controls.classList.add('controls')

        let delete_section = document.createElement('button')
        delete_section.title = "Delete this section"
        delete_section.classList.add('icon-trash-empty')
        delete_section.onclick = this.on_click_delete_section.bind(this)
        controls.appendChild(delete_section)

        let tag_section = document.createElement('button')
        tag_section.title = "Add or remove tags for this section"
        tag_section.classList.add('icon-tag')
        tag_section.onclick = this.on_click_tag_section.bind(this)
        controls.appendChild(tag_section)

        switch (content.type) {

            default:
            case 'text':
                this.element = document.createElement('textarea')
                this.element.value = content.value
                this.element.onblur = this.on_blur.bind(this)
                this.element.onkeydown = () => { window.setTimeout(this.resize_textarea.bind(this), 0) }
                window.setTimeout(this.resize_textarea.bind(this), 10)
                break
                
            case 'list-numbered':
                this.element = document.createElement('ol')
                this.populate_list()
                break
                
            case 'list-bullet':
                this.element = document.createElement('ul')
                this.populate_list()
                break
        }

        this.element.onchange = this.on_change_init.bind(this)
        this.container.appendChild(this.element)
        this.container.appendChild(controls)
    }

    /**
     * Give UI focus to this section's element
     */
    focus() {

        try { this.element.focus() }
        catch (e) { console.log(e) }
    }

    /**
     * Handles a blur event for this element
     * @param { MouseEvent } ev
     */
    on_blur(ev) {

        if (this.content.value == null && !this.element.value.length) {
            this.delete_section()
        }
    }

    /**
     * Handles a change event and passes it up to the parent controller
     * @param { Event } ev
     */
    on_change_init(ev) {

        switch (this.content.type) {

            default:
            case 'textarea':
                this.content.value = (this.element.value.length) ? this.element.value : null
                break
        }

        // if (!this.content.options) { this.content.options = { size: { } }}
        // this.content.options.size = { h: this.element.style.height, w: this.element.style.width }

        this.on_change(this)
    }

    /**
     * Handles a resize event
     * @param { Event } ev 
     */
    on_resize(ev) {
        
        debugger
    }

    /**
     * Populates a <ul> or <ol> with items
     */
    populate_list() {

        for (var i = 0, ii = this.content.value.length; i != ii; ++i) {

            let el = document.createElement('li')
            el.innerText = this.content.value[i]
        }
    }

    /**
     * @param { MouseEvent } ev
     */
    on_click_delete_section(ev) {

        let options = {
            params: { content: this.content.value },
            handlers: { ok: this.delete_section.bind(this) }
        }

        this.confirm_delete_dialog.show(options)
    }

    /**
     * Delete the current section by passing the command to the editor
     */
    delete_section() { Editor.delete_section(this) }

    /**
     * Handles a click event for tag section button
     * @param { MouseEvent } ev
     */
    on_click_tag_section(ev) {

        this.edit_tags_dialog.show()
    }

    /**
     * Resize a textarea
     */
    resize_textarea() {

        this.element.style.visibility = 'hidden'
        this.element.style.height = 'auto'
        this.element.style.height = this.element.scrollHeight + 'px'
        this.element.style.visibility = 'visible'
    }
}