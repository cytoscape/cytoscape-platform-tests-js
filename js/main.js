window.DATA = {'log': [], 'responses': {}}
let currentSlide = undefined;


const logArea = document.getElementsByTagName('textarea')[0]

function tester(slide){
  addResponse(slide.id, {"appVersion": window.navigator['appVersion']})
  showControls();
}

/* SLIDES */
function close_session(slide){
  cyCaller.delete("/v1/session", {}, function(r){
    showControls();
    return;
  })
}

function galfiltered(slide){
  const url = "http://chianti.ucsd.edu/~bsettle/galFiltered.cx"
  cyCaller.load_file_from_url(url, function(suid){
    this.log("Loaded galfiltered with SUID " + suid)
    var edges = []
    cyCaller.get("/v1/networks/" + suid + "/edges", function(edges){
      edges = JSON.parse(edges)
      log("Edges in galfiltered = " + edges.length, "response")
      addResponse(slide.id, )
      
      const check = slide.getElementsByClassName("edgeCountMatches")[0]
      check.labels[0].innerText = "Edge count is " + edges.length + "?"
      cyCaller.get("/v1/networks/" + suid + "/nodes", function(nodes){
        nodes = JSON.parse(nodes)
        log("Nodes in galfiltered = " + nodes.length, "response")
        addResponse(slide.id, {'cyrestNodeCount': nodes.length,
                                    'cyrestEdgeCount': edges.length})
        
        const check = slide.getElementsByClassName("nodeCountMatches")[0]
        check.labels[0].innerText = "Node count is " + nodes.length + "?"
        showControls();
      });
    });
  });
}

function diffusion(slide){
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

function layout(slide){
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

function initDropArea(){
  const dropArea = document.getElementById('drop-area')
  dropArea.style.visibility="visible";
  
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

function session_save(slide){
  const url = "http://chianti.ucsd.edu/~bsettle/galFiltered.cx"
  cyCaller.load_file_from_url(url, function(suid){
    cyCaller.post("/v1/session?file=", {}, (loc) => {
      loc = JSON.parse(loc)['file']
      const text = slide.getElementsByClassName('text')[0]
      text.innerText = "Saved session file to " + loc + ".cys"
      
      initDropArea();
      showControls();
    })
 })
}

function runjasmine(slide){
  log(JSON.stringify(window.DATA['responses']))
  window.runtests();
}

/* HELPERS */
function addResponse(name, data){
  if (!window.DATA.responses.hasOwnProperty(name)){
    window.DATA.responses[name] = {}
  }
  window.res = Object.assign(window.DATA.responses[name], data)
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

function clearSession(callback, slide){
  cyCaller.delete("/v1/session", {}, function(r){
    callback(slide);
  })
}

function call(slide){
  const funcs = {
    "tester": tester,
    "close_session": close_session,
    "galfiltered": galfiltered,
    "diffusion": diffusion,
    "layout": layout,
    "session_save": session_save,
    // "galfiltered": (v) => { clearSession(galfiltered, v) },
    // "diffusion": (v) => { clearSession(diffusion, v) },
    // "layout": (v) => { clearSession(layout, v) },
    // "session_save": (v) => { clearSession(session_save, v) },
    "runjasmine": runjasmine
  }
  
  log("Starting test", "init", true)
  if (funcs.hasOwnProperty(slide.id)){
    Reveal.configure({controls: false})
    funcs[slide.id](slide)
    setTimeout(() => { Reveal.configure({controls: true}) }, 5000)
  }else {
    showControls()
  }
}

function save_answers(slide){
  if (!slide){
    return;
  }
  const inputs = slide.getElementsByTagName("input")
  for (let i = 0; i < inputs.length; i++){
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
  }
}

function showControls(vis=true){
  // TODO: How to handle errors that prevent this from being called?
  // A timer was placed in the slide call func
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
  controlsBackArrows: "hidden",
  controlsTutorial: false,
  progress: true, //TODO: change to false to prevent backstepping
  keyboard: false,
  overview: false,
});

Reveal.addEventListener( 'slidechanged', function( event ) {
	// event.previousSlide, event.currentSlide, event.indexh, event.indexv
  console.log(event)
  currentSlide = event.currentSlide;
  save_answers(event.previousSlide)
  call(event.currentSlide)
});

const cyCaller = new CyCaller();
cyCaller.setLogCallBack(log)
log("Started Cytoscape Testing")