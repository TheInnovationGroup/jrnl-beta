import { Database } from './lib/database.js'
import { PageController } from './components/pagecontroller.js'
import { Editor } from './components/editor.js'
import { Menu } from './components/menu.js'

class JRNL {

    /**
     * Initialize the application
     */
    static init() {

        Database.init().then(JRNL.init_components)
              
    }

    static init_components() {

        Menu.init('header')
        Editor.init('main')
        PageController.init('ul.pagelist')
    }
}

window.onload = JRNL.init 