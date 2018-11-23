/**
* This is the logger class containing log items and responsible for holding different log types.
*/

class CyLogger{
    constructor(){
        this.logItems = [];
        this.log = undefined

        function info(message, context){
            return log("this is an info log "+message, context)            
        }
        function debug(message, context){
            return log(message, context)            
        }
        function warn(message, context){
            return log(message, context)
        }
        function error(message, context){
            return log(message, context)
        }
        function log(message, context = 'info and error') {
            const line = context + ' :::: ' + message
            this.logItems.push(line)
            const log = document.getElementById('log')
            log.innerHTML = this.logItems.join('\n')
            log.scrollTop = log.scrollHeight
        }
        function export2jira(session){}
    } 
    setLogCallBack (callback) {
        this.log = callback
    }

}
class CyLogItem{
    constructor(){
    this.uid = ""
    this.label = ""
    this.question = ""
    this.options = []
    this.steps = []
    this.expectedAnswer = ""
    this.userResponse = ""
    this.operations = []
    this.data = ""
    this.context = ""
    this.message = ""
    this.sessionID = ""
    this.test_date = Date.now()
    this.endDate = Date.now()
    this.startDate = Date.now()
    }
      
}