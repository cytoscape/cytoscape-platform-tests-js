window.DATA = {'log': [], 'responses': {}}
let currentSlide = undefined;


const logArea = document.getElementsByTagName('textarea')[0]
const app_version_dict = {
    'NetworkAnalyzer': "3.3.2",
    'Biomart Web Service Client': "3.3.2",
    'CyNDEx-2': "2.2.4.SNAPSHOT",
    'cyREST': "3.8.0",
    'CyCL': "3.5.0",
    'Welcome Screen': "3.5.2",
    'ID Mapper': "3.6.3",
    'JSON Support': "3.6.2",
    'Network Merge': "3.3.4",
    'Core Apps': "3.4.0",
    'copycatLayout': "1.2.3",
    'cyBrowser': "1.0.4",
    'BioPAX Reader': "3.3.3",
    'PSICQUIC Web Service Client': "3.4.0",
    'Diffusion': "1.5.4.SNAPSHOT",
    'PSI-MI Reader': "3.3.3",
    'SBML Reader': "3.3.4",
    'OpenCL Prefuse Layout': "3.5.0",
    'CX Support': "2.2.4"
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
    cyCaller.get("/v1/networks/" + suid + "/edges", function(edges){
      edges = JSON.parse(edges)
      log("Edges in galfiltered = " + edges.length, "response")
      addResponse("galfiltered", {'cyrestEdgeCount': edges.length})
    });
    cyCaller.get("/v1/networks/" + suid + "/nodes", function(nodes){
      nodes = JSON.parse(nodes)
      log("Nodes in galfiltered = " + nodes.length, "response")
      addResponse("galfiltered", {'cyrestNodeCount': nodes.length})
    });
    showControls()
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
    cyCaller.get("/v1/apply/layouts/circular/" + suid)
  })
}

function session_save(){
  const url = "http://chianti.ucsd.edu/~bsettle/galFiltered.cx"
  cyCaller.load_file_from_url(url, function(suid){
    const abspath = ""
    cyCaller.post("/v1/session?file=" + abspath)
    //TODO assert size is greater than 70000b
  })
}

function app_versions(){
  cyCaller.post("/v1/commands/apps/list installed", {}, function(r){
    log(r)
    const apps = JSON.parse(r)
    addResponse("app_versions", apps)
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

function log(message, type="info"){
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
      log.innerHTML += message + "\n"
      log.scrollTop = log.scrollHeight;
    }
  }
}

function buildInput(n, text){
  if (text === "CONFIRM"){
    return "<input type='checkbox' id='" + n + "'>"
  }else{
    return "<label for='" + n + "'>" + text + "</label>"
      + "<input type='text' id='" + n + "'' name='" + n + "'/>"
  }
}

function buildSlide(options, container){
  var slide = '<h3>' + options.title + "</h3>";
  if (options.text){
    slide += "<p class='text'>" + options.text + "</p>"
  }
  if (!options.hasOwnProperty('log') || options["log"] !== 'false'){
    slide += '<textarea class="slide_log" readonly></textarea>';
  }
  if (options.inputs){
    slide += '<div class="entry" id="entry">'
    for (var n in options.inputs){
      slide += buildInput(n, options.inputs[n])
    }
    slide += "</div>"
  }
  // slide += "<p class='result'></p>"
  container.innerHTML = slide;
}

function call(id){
  const funcs = {
    "status": status,
    "version": version,
    "close_session": close_session,
    "galfiltered": galfiltered,
    "diffusion": diffusion,
    "layout": layout,
    "session_save": session_save,
    "app_versions": app_versions,
    "summary": summary
  }
  log("Starting test")
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
    const id = slide.id;
    const obj = {[inp.name] : inp.value}
    addResponse(id, obj)
    i++;
  }
}

function showControls(vis=true){
  // TODO: How to handle errors that prevent this from being called?
  Reveal.configure({controls: vis})
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
  controls: false,
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
showControls()