window.DATA = {'log': [], 'responses': {}}
let currentSlide = undefined;


const logArea = document.getElementsByTagName('textarea')[0]

function tester(){
  addResponse("tester", {"appVersion": window.navigator['appVersion']})
}

/* SLIDES */
function status(){
  cyCaller.get("/v1", function(v){
    log(v)
    v = JSON.parse(v)
    data = {"allAppsStarted": v['allAppsStarted'], "apiVersion": v['apiVersion']}
    addResponse("status", data)
    showControls()
  })
}

function version(){
  cyCaller.get("/v1/version", function(v){
    log(v)
    v = JSON.parse(v)
    addResponse("version", v)
    showControls()
  })
}

function close_session(){
  cyCaller.delete("/v1/session", {}, function(r){
    showControls();
    return;
  })
}

function galfiltered(){
  const url = "http://chianti.ucsd.edu/~bsettle/galFiltered.cx"
  cyCaller.load_file_from_url(url, function(suid){
    this.log("Loaded galfiltered with SUID " + suid)
    var edges = []
    cyCaller.get("/v1/networks/" + suid + "/edges", function(edges){
      edges = JSON.parse(edges)
      log("Edges in galfiltered = " + edges.length, "response")
      addResponse("galfiltered", )
      
      const check = currentSlide.getElementsByClassName("edgeCountMatches")[0]
      check.labels[0].innerText = "Edge count is " + edges.length + "?"
      cyCaller.get("/v1/networks/" + suid + "/nodes", function(nodes){
        nodes = JSON.parse(nodes)
        log("Nodes in galfiltered = " + nodes.length, "response")
        addResponse("galfiltered", {'cyrestNodeCount': nodes.length,
                                    'cyrestEdgeCount': edges.length})
        
        const check = currentSlide.getElementsByClassName("nodeCountMatches")[0]
        check.labels[0].innerText = "Node count is " + nodes.length + "?"
        showControls();
      });
    });
  });
}

function diffusion(){
  const select_nodes = (suid, node_suids) => {
    cyCaller.put("/v1/networks/"+ suid + "/nodes/selected", node_suids, function(){
      cyCaller.post("/diffusion/v1/currentView/diffuse", {}, () => {
        showControls()
      })
    })
  }
  const url = "http://chianti.ucsd.edu/~bsettle/galFiltered.cx"
  cyCaller.load_file_from_url(url, function(suid){
    cyCaller.get("/v1/networks/" + suid + "/tables/defaultnode/rows", function(r){
      const rows = JSON.parse(r)
      for (var i in rows){
        if (rows[i]['COMMON'] === 'RAP1'){
          select_nodes(suid, [rows[i]['SUID']])
          return;
        }
      }
    })
  });
}

function layout(){
  const url = "http://chianti.ucsd.edu/~bsettle/galFiltered.cx"
  cyCaller.load_file_from_url(url, function(suid){
    cyCaller.get("/v1/apply/layouts/circular/" + suid, 
    function(){
      showControls();
    })
  })
}

function handleCYS(area, files){
  addResponse("session_save", {"file_size": files[0].size})
  area.style.backgroundColor = "#669166"
}

function createCysInput(){
  const dropArea = document.createElement("div")
  dropArea.id = "drop-area"
  dropArea.innerHTML = '<form class="my-form">' +
    '<p>Drag the .cys file onto the dashed area</p>' +
    '<input type="file" id="fileElem" accept=".cys" onchange="handleCYS(this.parentElement.parentElement, this.files)">' +
    '<label class="button" for="fileElem">Select CYS</label>' +
  '</form>';
  ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
  })

  function preventDefaults (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  ;['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
  })

  ;['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
  })

  function highlight(e) {
    dropArea.classList.add('highlight')
  }

  function unhighlight(e) {
    dropArea.classList.remove('highlight')
  }
  dropArea.addEventListener('drop', handleDrop, false)

  function handleDrop(e) {
    let dt = e.dataTransfer
    let files = dt.files

    handleCYS(dropArea, files)
  }
  
  return dropArea;
}

function session_save(){
  const url = "http://chianti.ucsd.edu/~bsettle/galFiltered.cx"
  cyCaller.load_file_from_url(url, function(suid){
    cyCaller.post("/v1/session?file=", {}, (loc) => {
      loc = JSON.parse(loc)['file']
      const text = currentSlide.getElementsByClassName('text')[0]
      text.innerText = "Saved session file to " + loc + ".cys"
      
      const entries = currentSlide.getElementsByClassName('entries')[0]
      entries.appendChild(createCysInput())
    })
 })
}

function summary(){
  logArea.innerHTML = JSON.stringify(window.DATA['responses'])
}

/* HELPERS */
function addResponse(name, data){
  if (!window.DATA.responses.hasOwnProperty(name)){
    window.DATA.responses[name] = {}
  }
  window.res = Object.assign(window.DATA.responses[name], data)//.push(data)
}

function log(message, type="info", clear=false){
  let context = "log";
  if (currentSlide && currentSlide.id){
    context = currentSlide.id
  }
  
  const line = context + "::" + type + " - " + message
  window.DATA['log'].push(line)
  logArea.innerHTML = window.DATA['log'].join("\n")
  logArea.scrollTop = logArea.scrollHeight;
  if (currentSlide){
    const log = currentSlide.getElementsByClassName("slide_log")[0]
    if (log){
      if (clear){
        log.innerHTML = ""
      }
      log.innerHTML += message + "\n"
      log.scrollTop = log.scrollHeight;
    }
  }
}

function buildInput(n){
  let entry = ""
  if (n['type'] === 'checkbox'){
    entry = "<input type='checkbox' id='" + n['id'] + "' class='" + n['id'] + "'/>" + 
    "<label for='" + n['id'] + "'>" + n['text'] + "</label>"
  }else if (n['type'] === 'text'){
    entry = "<label for='" + n['id'] + "'>" + n['text'] + "</label>"
      + "<input type='text' id='" + n['id'] + "'' name='" + n['id'] + "'/>"
  }else {
    entry = "<input type='" + n['type'] + "' id='" + n['id'] + "' class='" + n['id'] + "'/>"
  }
  return "<div class='entry'>" + entry + "</div>"
}

function buildSlide(options, container){
  var slide = '<h3>' + options.title + "</h3>";
  if (options.text){
    slide += "<p class='text'>" + options.text + "</p>"
  }
  if (!options.hasOwnProperty('log') || options["log"] !== 'false'){
    slide += '<textarea class="slide_log" readonly></textarea>';
  }
  slide += '<div class="entries" id="entries">'
  if (options.inputs){
    for (var n in options.inputs){
      slide += buildInput(options.inputs[n])
    }
  }
  slide += "</div>"
  // slide += "<p class='result'></p>"
  container.innerHTML = slide;
}

function clearSession(callback){
  cyCaller.delete("/v1/session", {}, function(r){
    callback();
  })
}

function call(id){
  const funcs = {
    "tester": tester,
    "status": status,
    "version": version,
    "close_session": close_session,
    "galfiltered": () => { clearSession(galfiltered) },
    "diffusion": () => { clearSession(diffusion) },
    "layout": () => { clearSession(layout) },
    "session_save": () => { clearSession(session_save) },
    "summary": summary
  }
  
  log("Starting test", "init", true)
  if (funcs.hasOwnProperty(id)){
    funcs[id]()
  }else {
    showControls()
  }
}

function save_answers(slide){
  if (!slide){
    return;
  }
  const inputs = slide.getElementsByTagName("input")
  let i = 0;
  while (i < inputs.length){
    const inp = inputs[i];
    if (inp.type === 'file'){
      continue;
    }
    const id = slide.id;
    const value = {
      "checkbox": inp.checked,
      "text": inp.value
    }[inp.type]
    const obj = {[inp.id] : value}
    addResponse(id, obj)
    i++;
  }
}

function showControls(vis=true){
  // TODO: How to handle errors that prevent this from being called?
  // Reveal.configure({controls: vis})
}

Reveal.initialize({
  dependencies: [
    { src: 'plugin/anything/anything.js' },
    { src: 'plugin/markdown/marked.js' },
    { src: 'plugin/markdown/markdown.js' },
    { src: 'plugin/notes/notes.js', async: true },
    { src: 'plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } }
  ], 
  anything: [{
    className: "cyrest",
    defaults: {"name": "start", "title": "Cytoscape Testing"},
    initialize: (function(container, options){
      if (!options){
        options = {}
      }
      buildSlide(options, container)
      if (container.id === "init"){
        currentSlide = container;
      }
    })
  }],
  controlsBackArrows: "hidden",
  controlsTutorial: false,
  progress: true, //TODO: change to false to prevent backstepping
  keyboard: false,
  overview: false,
});

Reveal.addEventListener( 'slidechanged', function( event ) {
	// event.previousSlide, event.currentSlide, event.indexh, event.indexv
  currentSlide = event.currentSlide;
  showControls(false)
  save_answers(event.previousSlide)
  call(event.currentSlide.id)
});

const cyCaller = new CyCaller();
cyCaller.setLogCallBack(log)
log("Started Cytoscape Testing")