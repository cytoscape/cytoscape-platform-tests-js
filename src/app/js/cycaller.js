class CyRESTInstance {
  constructor (base_url, port) {
    if (base_url === undefined) {
      base_url = CyRESTInstance.BASE_URL
    }
    if (port === undefined) {
      port = CyRESTInstance.PORT
    }
    this.port = port
    this.base_url = base_url
  }
}
CyRESTInstance.PORT = 1234
CyRESTInstance.BASE_URL = 'http://localhost'

class CyCaller {
  // ''
  // 'Basic functions for calling CyREST'
  // ''
  constructor (cy_rest_instance) {
    // ''
    // 'Constructor remembers CyREST location and NDEx credentials'
    // ''
    if (cy_rest_instance === undefined) {
      cy_rest_instance = new CyRESTInstance()
    }
    this.cy_rest_instance = cy_rest_instance
    this.log = undefined
  }

  setLogCallBack (callback) {
    this.log = callback
  }

  request (method, url, data, callback) {
    let _this = this;
    return new Promise((resolve, reject)=>{
      const Http = new XMLHttpRequest();
      try{
        Http.open(method, url);
        Http.setRequestHeader('Content-type', 'application/json');
        Http.setRequestHeader('Accept', 'application/json');
        Http.onerror = function (err) {
          let resp = Http.responseText
          if(resp == ""){
            resp = "Unknown Error Occured. Server response not received.";
          }
          if (_this.log){
            _this.log(resp.substr(0, 300) + '...', 'response')
          }
          reject(resp);
        };
  
        Http.onload = function () {
          const resp = Http.responseText
          if (this.log){
            this.log(resp.substr(0, 300) + '...', 'response')
          }
          if (Http.readyState === 4) {
            resolve(resp);
            if(callback) {
              callback(resp)
            }
          // } else {
          //   reject({
          //     status: this.status,
          //     statusText: resp
          //   });
          }
        };
        Http.send(data);
        // Http.onreadystatechange = (e) => {
        //   if (Http.readyState === 4) {        
        //     const resp = Http.responseText
        //     if (this.log){
        //       this.log(resp.substr(0, 300) + '...', 'response')
        //     }
        //     // resolve(resp);
        //     callback(resp)
        //   }
        // }
      }catch(err){
        if (_this.log){
          _this.log(err.substr(0, 300) + '...', 'response')
        }
      }
    });
  }

  _execute (http_method, endpoint, data, callback) {
    // ''
    // 'Set up a REST call then return result'
    // ''
    const hasData = (data instanceof Array && data.length > 0) || (data instanceof Object && Object.keys(data).length !== 0)
    var url = this.cy_rest_instance.base_url + ':' + this.cy_rest_instance.port + endpoint
    if (this.log) {
      this.log(http_method.toUpperCase() + ' ' + url, 'call')
      if (hasData) {
        this.log('data=' + JSON.stringify(data), 'call')
      }
    }

    if (hasData) {
      data = JSON.stringify(data)
    } else {
      data = null
    }

    return this.request(http_method,
      url,
      data,
      callback)
  }

  post (endpoint, data, callback = console.log) {
    // ''
    // 'Execute a REST call using POST'
    // ''
    return this._execute('post', endpoint, data, callback)
  }
  put (endpoint, data, callback = console.log) {
    // ''
    // 'Execute a REST call using PUT'
    // ''
    return this._execute('put', endpoint, data, callback)
  }
  get (endpoint, callback = console.log) {
    // ''
    // 'Execute a REST call using GET'
    // ''
    return this._execute('get', endpoint, {}, callback)
  }
  delete (endpoint, data, callback = console.log) {
    // ''
    // 'Execute a REST call using DELETE'
    // ''
    return this._execute('delete', endpoint, data, callback)
  }

  load_file_from_url (url, callback) {
    const body = [{ 'source_location': url, 'source_method': 'GET' }]
    return this.post('/v1/networks?source=url&format=cx', body, function (r) {
      const data = JSON.parse(r)
      const suid = data[0]['networkSUID']
      if(callback){
        callback(suid)
      }
      return suid;
    })
  }

  get_network_suid (callback) {
    return this.get('/v1/networks', callback)
  }
}
