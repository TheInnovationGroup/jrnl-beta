export class Util {

    /**
     * Returns today's date as a formatted string e.g. 12-21-2018
     * @returns {string}
     */
    static get todays_date() {

        return (new Date()).toJSON().replace(/T.+/g, '')
    }

    /**
     * Generates and returns a universally unique identifier (UUID) as a string
     * @returns {string}
     */
    static get random_uuid() {

        let fn = (c) => {

            let dt = new Date().getTime()
            let r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c == 'x' ? r : (r&0x3|0x8)).toString(16);
        }

        return ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, fn))
    }
}