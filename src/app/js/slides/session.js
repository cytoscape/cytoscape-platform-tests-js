/**
 * Holds the metadata for a test session of the application.
 */
class TestSession {
    constructor() {
        /**
         * The id of the session. 
         */
        let ua = UAParser();

        this.sessionId = `${TestSession.constructor.name}-${Math.random().toString().slice(2)}`;
        this._userInformation = USER_INFO_DEFAULTS;
        this.test_date = Date.now();
        this._userInformation.OS = ua.os;
        this._userInformation.browser = ua.browser;
        this.sessionLog = [];

    }

    get userInformation(){
        return this._userInformation;
    }

    get testSessionId() {
        return this.sessionId.toString();
    }

    set userName(name){
        this._userInformation.name = name;
    }

    /**
     * Opens up the session, performing the necessary steps to set things up.
     */
    open() {
       Logger.getInstance().log("Opening Session", this.sessionId);
        // console.log("Opening session", this.sessionId);
        /**
         * Time in (ms) that the session was started.
         */
        startDate = Date.now();
    }

    /**
     * Closes and cleans up a test session.
     */
    close() {
        Logger.getInstance().log("Closing session",this.sessionId);
        //cylog.log("Closing session", this.sessionId);
        /**
         * Time in (ms) that the session was started.
         */
        this.endDate = Date.now();
    }

    print() {
        console.debug(JSON.stringify(this));
    }

    // /**
    //  * Adds the message to the test session log.
    //  * @param {*} message 
    //  * @param {*} context 
    //  */
    // log(message, context = 'info'){
    //     const line = context + ' :: ' + message
    //     cylog.logItems.push(line);
    //     const log = document.getElementById('log')
    //     log.innerHTML =  cylog.logItems.join('\n')
    //     log.scrollTop = log.scrollHeight
    // }

}

/**
 * Defaults of the User's information that will be filled in by the user and system.
 */
let USER_INFO_DEFAULTS = {
    name: null,
    OS: null,
    browser: null
}