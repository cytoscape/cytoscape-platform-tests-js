class CyRESTInstance {
  constructor(base_url, port) {
    if (base_url === undefined){
      base_url = CyRESTInstance.BASE_URL
    }
    if (port === undefined){
      port = CyRESTInstance.PORT
    }
    this.port = port
    this.base_url = base_url
  }
}
CyRESTInstance.PORT = 1234
CyRESTInstance.BASE_URL = "http://localhost"

class TestUtils {

  constructor() {

  }

  static is_yes(answer) {
    return (answer.upper() === 'Y' || answer.upper() === 'YES')
  }
}

class CyCaller {
  // ""
  // "Basic functions for calling CyREST"
  // ""
  constructor(cy_rest_instance) {
    // ""
    // "Constructor remembers CyREST location and NDEx credentials"
    // ""
    if (cy_rest_instance === undefined){
      cy_rest_instance = new CyRESTInstance()
    }
    this.cy_rest_instance = cy_rest_instance
    this.log = undefined
  }
  
  setLogCallBack(callback){
    this.log = callback
  }

  static get_ci_data(result) {
    // ""
    // "Pulls CI data out of a result or throws an exception"
    // ""
    const return_json = CyCaller._return_json(result)

    errors = return_json["errors"]
    if (len(errors) === 0){
      return return_json["data"]
    }else {
      throw new Exception(errors)
    }
  }
  static _return_json(result) {
    // ""
    // "Return JSON if the call was successful, or an exception if not"
    // ""
    return JSON.parse(result)
  }
  
  request(method, url, data, callback){
    const Http = new XMLHttpRequest();
    Http.open(method, url);
    Http.setRequestHeader('Content-type', 'application/json')
    Http.setRequestHeader('Accept', 'application/json')
    Http.send(data);
    Http.onreadystatechange=(e)=>{
      if (Http.readyState == 4 && Http.status == 200) {
        callback(Http.responseText)
      }
    }
  }

  _execute(http_method, endpoint, data, callback) {
    // ""
    // "Set up a REST call then return result"
    // ""
    const hasData = (data instanceof Array && data.length > 0) || (data instanceof Object && Object.keys(data).length !== 0)
    var url = this.cy_rest_instance.base_url + ":" + this.cy_rest_instance.port + endpoint;
    if (this.log){
      this.log(http_method.toUpperCase() + " " + url, "call")
      if (hasData){
        this.log("data=" + JSON.stringify(data))
      }
    }
    
    if (hasData){
      data = JSON.stringify(data)
    }else{
      data = {}
    }
    
    this.request(http_method,
      url,
      data,
      callback)
  }

  post(endpoint, data, callback=console.log) {
    // ""
    // "Execute a REST call using POST"
    // ""
    return this._execute("post", endpoint, data, callback)
  }
  put(endpoint, data, callback=console.log) {
    // ""
    // "Execute a REST call using PUT"
    // ""
    return this._execute("put", endpoint, data, callback)
  }
  get(endpoint, callback=console.log) {
    // ""
    // "Execute a REST call using GET"
    // ""
    return this._execute("get", endpoint, {}, callback)
  }
  delete(endpoint, data, callback=console.log) {
    // ""
    // "Execute a REST call using DELETE"
    // ""
    return this._execute("delete", endpoint, data, callback)
  }
  
  load_file_from_url(url, callback) {
    const body = [{"source_location": url,"source_method": "GET"}]
    this.post("/v1/networks?source=url&format=cx", body, function(r){
      const data = JSON.parse(r)
      const suid = data[0]['networkSUID']
      callback(suid)
    })
  }
  
  get_network_suid(callback) {
    this.get("/v1/networks", callback)
  }
}