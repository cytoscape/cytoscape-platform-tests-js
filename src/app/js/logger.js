/**
* This is the logger class containing log items and responsible for holding different log types.
*/

import BaseSlide from './slides/slidesModel';

var Logger = (function () {

    // Instance stores a reference to the Singleton
    var instance;
  
    function init() {
  
      // Singleton

  
      return {
  
        // Public methods and variables
        writeErrorLog: function (message) {
          console.log(message);
        },
        log: function(message, context = 'info') {
                    const line = context + ' :::: ' + message
                    this.logItems.push(line)
                    const log = document.getElementById('log')
                    log.innerHTML = this.logItems.join('\n')
                    log.scrollTop = log.scrollHeight
        },
        addSlidetoLog:function(BaseSlide){
            this.logItems.push(BaseSlide);
        },
        writeSlidestoLog:function(){
            //write to file? What do we want?
        },
        logItems: []
      };
  
    };
  
    return {
  
      // Get the Singleton instance if one exists
      // or create one if it doesn't
      getInstance: function () {
  
        if ( !instance ) {
          instance = init();
        }
  
        return instance;
      }
  
    };
  
  })();


// class CyLogger{
//     constructor(){
//         this.logItems = [];

//         function info(message, context){
//             console.log(message, context)            
//         }
//         function debug(message, context){
//             console.log(message, context)            
//         }
//         function warn(message, context){
//             console.log(message, context)
//         }
//         function error(message, context){
//             console.log(message, context)
//         }
//     } 

//     log(message, context = 'info') {
//         const line = context + ' :::: ' + message
//         this.logItems.push(line)
//         const log = document.getElementById('log')
//         log.innerHTML = this.logItems.join('\n')
//         log.scrollTop = log.scrollHeight
//     }

// }
// class CyLogItem{
//     constructor(){
//     this.uid = ""
//     this.label = ""
//     this.question = ""
//     this.options = []
//     this.steps = []
//     this.expectedAnswer = ""
//     this.userResponse = ""
//     this.operations = []
//     this.data = ""
//     this.context = ""
//     this.message = ""
//     this.sessionID = ""
//     this.test_date = Date.now()
//     this.endDate = Date.now()
//     this.startDate = Date.now()
//     }
//     toString() {
//         return `\n` +
//             `\tName: ${this.uid}\n` +
//             `\tCategory: ${this.label}\n ` +
//             `\tQuestion: ${this.question}\n ` +
//             `\tOptions: ${this.options}\n ` +
//             `\tSteps: ${this.steps}\n ` +
//             `\Expected Response: ${this.expectedAnswer}\n ` +
//             `\tUser Response: ${this.userResponse}\n ` +
//             `\tOperations: ${this.operations}\n ` +
//             `\Data: ${this.data}\n` +
//             `\Context: ${this.context}\n ` +
//             `\Message: ${this.message}\n ` +
//             `\Session ID: ${this.sessionID}\n ` +
//             `\Test Date: ${this.test_date}\n ` +
//             `\End Date: ${this.endDate}\n ` +
//             `\tStart Date: ${this.startDate}\n ` +
//             `\n`;
//     }
      
// }