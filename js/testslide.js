
class BaseTestSlide {
    static get id() {
        return TestSlide._id;
    }
    get uid() {
        return this._uid;
    }
    set uid(newId){
        this._uid = newId;
    }
    constructor(label) {
        if (!TestSlide._id){  TestSlide._id = 0; }  
        TestSlide._id++;
        this._uid = `${this.constructor.name}-${TestSlide._id}`;
        this._label = label;
    }
    toString(){
        return this.uid;
    }
}

class TestSlide extends BaseTestSlide {
    constructor(){
        super();
        this.question = "";
        this.options = [];
        this.steps = [];
        this.answer = "";
        this.userResponse = "";
    }


    toString(){
        return `\n`+
        `\tName: ${this.uid}\n`+
        `\tCategory: ${this._label}\n `+
        `\tQuestion: ${this.question}\n `+
        `\tOptions: ${this.options}\n `+
        `\tSteps: ${this.steps}\n `+
        `\tUser Response: ${this.userResponse}\n `+
        `\tCorrect Response: ${this.answer}\n `+
        `\tResult... ${this.userResponse == this.answer? "Pass!":"Fail!"}\n `+
        `\n`
        ;
    }
}

function main(){
    let slides =[new TestSlide(), new TestSlide(), new TestSlide()];
    console.log("Making slide(s)...",...slides.toString());

}

main();