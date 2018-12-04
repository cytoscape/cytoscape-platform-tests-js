
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
        writeErrorLog: function (message,id) {
          var cylogitem = new CyLogItem();
          cylogitem.uid = id;
          cylogitem.message = message;
          this.addDevNote(cylogitem);
          this.log(message);
        },
        writeGenericLog(message,id,slide){
          var cylogitem = new CyLogItem();
          cylogitem.uid = id;
          cylogitem.message = message;
          cylogitem.question;
          if(slide == undefined){
             cylogitem.slide = "No slide data sent"; 
          }
          this.addDevNote(cylogitem);
          this.log(message);

        },
        writeSlideError(message,slide){ // This funtion will be used when the slideModel is completely implemented. 
          var cylogitem = new CyLogItem();
          cylogitem.id = slide.id;
          cylogitem.expectedAnswer = slide.expectedAnswer;
          cylogitem.context = typeof(slide);
          cylogitem.operations = slide.operations;
          cylogitem.message = message;
          this.addDevNote(cylogitem);
          this.log(message,"error");
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
        exportLogsToFile(session){
          let logExport = this.toJson();
          if(session){
            session.sessionLog = this.toJson();
            logExport = session;
          }
          let jsonData=  JSON.stringify(logExport);
          // let contentType = "text/plain";
          let contentType = "application/json";
          let a = document.createElement("a");
          let file = new Blob([jsonData], {type: contentType});
          a.href = URL.createObjectURL(file);
          a.download = "logFile.json";
          a.click();

        },
        toJson(){
          return {
            logItems: this.logItems,
            developmentNotes: this.developmentNotes
          }
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
