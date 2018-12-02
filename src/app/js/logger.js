
/**
* This is the logger class containing log items and responsible for holding different log types.
*/


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
        writeGenericLog(message,id,slide){
          var cylogitem = new CyLogItem();
          cylogitem.uid = id;
          cylogitem.message = message;

          this.addDevNote(cylogitem);

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
        addDevNote(message, slide, data){
          this.developmentNotes.push(message + slide + " :" + " " + data);
        },
        logItems: [],
        developmentNotes:[]
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
