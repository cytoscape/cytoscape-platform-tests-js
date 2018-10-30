/**
 * The base class for Slides.
 */
class BaseSlide {
    constructor(label) {
        if (!BaseSlide._id) { BaseSlide._id = 0; }
        BaseSlide._id++;
        this._uid = `${this.constructor.name}-${BaseSlide._id}`;
        this._label = label;
    }
    /**
     * The Id number of the slide instances created.
     */
    static get id() {
        return BaseSlide._id;
    }
    /**
     * Returns the unique identifier for the slide instance
     */
    get uid() {
        return this._uid;
    }
    /**
     * Returns the unique idenfing ID of the slide instance.
     */
    toString() {
        return this._uid;
    }
}
/**
 * Class to hold the model of the Test Case. It holds the necessary parts of a test case
 * including, but not limited to: the question, a series of steps, test operations, and
 * the user answer.
 */
class TestSlide extends BaseSlide {
    constructor() {
        super();
        /**
         * The question or text for the slide.
         */
        this.question = "";
        /**
         * [Optional] Options for the slide. If it's a test, then it would be possible options for the 
         * question's answer.
         */
        this.options = [];
        /**
         * Breadcrum steps for the slide. These can be instructions for the user to follow.
         */
        this.steps = [];
        /**
         * [Optional] The answer to the question. 
         */
        this.answer = "";
        /**
         * The user's response to the slide's question.
         */
        this.userResponse = "";
        /**
         * [Optional] The function operations that the slide will perform. 
         */
        this.operations = [];
    }

    toString() {
        return `\n` +
            `\tName: ${this.uid}\n` +
            `\tCategory: ${this._label}\n ` +
            `\tQuestion: ${this.question}\n ` +
            `\tOptions: ${this.options}\n ` +
            `\tSteps: ${this.steps}\n ` +
            `\tUser Response: ${this.userResponse}\n ` +
            `\tCorrect Response: ${this.answer}\n ` +
            `\tResult... ${this.userResponse == this.answer ? "Pass!" : "Fail!"}\n ` +
            `\n`
            ;
    }

    /**
     * Starts the test slide and it's operations.
     */
    run() {
        if (this.question == null || this.question.trim() === "") {
            return;
        }
        console.debug(`Starting ${this.uid}...`);
        this.runOperations();
    }

    /**
     * Runs the operations for the current slide.
     */
    runOperations() {
        if (this.operations.constructor.name != "Array") {
            return;
        }
        // Running each operation in the test slide.
        let currentOperation = 0;
        console.debug(`\t\tStarting operations for ${this.uid}...`);
        this.operations.forEach(operation => {
            try {
                currentOperation++;
                console.debug(`\t\t\tAttempting to run operation ${currentOperation}...`);
                operation();
                console.debug(`\t\t\tFinished running operation ${currentOperation}.`);
            } catch (err) {
                console.error(`\t\t\tTest operation ${currentOperation} failed.`, err);
                return err;
            }
        });
    }

    /**
     * Adds the passed in function operation to the TestSlide's list of operations.
     * These would get added to the test instance to run.
     * @param {*} operation function to run
     */
    addTestOperation(operation) {
        if (operation.constructor.name === "Function") {
            this.operations.push(operation);
        } else {
            console.error("An invalid operation was attepted to be added.");
        }
    }
}

/**
 * Holds the metadata for a test session of the application.
 */
class TestSession {
    constructor() {
        /**
         * The id of the session. 
         */
        this.sessionId = `${TestSession.constructor.name}-${Math.random().toString().slice(2)}`;
        this.userInformation = USER_INFO_DEFAULTS;
    }

    get testSessionId() {
        return this.sessionId.toString();
    }

    /**
     * Opens up the session, performing the necessary steps to set things up.
     */
    open(){
        console.log("Opening session", this.sessionId);
        /**
         * Time in (ms) that the session was started.
         */
        this.startDate = Date.now();
    }

    /**
     * Closes and cleans up a test session.
     */
    close(){
        console.log("Closing session", this.sessionId);
        /**
         * Time in (ms) that the session was started.
         */
        this.endDate = Date.now();
    }
}

/**
 * Defaults of the User's information that will be filled in by the user and system.
 */
let USER_INFO_DEFAULTS =  {
    name: null,
    OS: null,
}

function main() {
    let slides = [new TestSlide(), new TestSlide(), new TestSlide()];
    slides[0].question = "Starting Test";
    slides[slides.length - 1].question = "Ending Test";
    // console.log("Making slide(s)...", ...slides.toString());
    slides.forEach(slide => {
        console.log("Starting slide...", ...slide.uid);
        slide.run();
    });

}

// main();