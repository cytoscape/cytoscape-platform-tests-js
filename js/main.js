window.DATA = { 'log': [], 'responses': {} }

const GALFILTERED = 'https://raw.githubusercontent.com/cytoscape/cytoscape-platform-tests-js/master/networks/galFiltered.cx'

function toggleLog () {
  const log = document.getElementById('log-container')
  log.style.display = log.style.display === 'none' ? 'block' : 'none'
}

function tester (slide) {
  addResponse(slide.id, { 'appVersion': window.navigator['appVersion'] })
  showControls(slide)
}

/* SLIDES */
function close_session (slide) {
  cyCaller.delete('/v1/session', {}, function (r) {
    showControls(slide)
  })
}

function galfiltered (slide) {
  const url = GALFILTERED
  cyCaller.load_file_from_url(url, function (suid) {
    log('Loaded galfiltered with SUID ' + suid, slide.id)
    cyCaller.get('/v1/networks/' + suid + '/edges', function (edges) {
      edges = JSON.parse(edges)
      log('Edges in galfiltered = ' + edges.length, slide.id)
      addResponse(slide.id)

      const check = slide.getElementsByClassName('edgeCountMatches')[0]
      check.labels[0].innerText = 'Edge count is ' + edges.length + '?'
      cyCaller.get('/v1/networks/' + suid + '/nodes', function (nodes) {
        nodes = JSON.parse(nodes)
        log('Nodes in galfiltered = ' + nodes.length, slide.id)
        addResponse(slide.id, {
          'cyrestNodeCount': nodes.length,
          'cyrestEdgeCount': edges.length
        })

        const check = slide.getElementsByClassName('nodeCountMatches')[0]
        check.labels[0].innerText = 'Node count is ' + nodes.length + '?'
        showControls(slide)
      })
    })
  })
}

function diffusion (slide) {
  const select_nodes = (suid, node_suids) => {
    cyCaller.put('/v1/networks/' + suid + '/nodes/selected', node_suids, function () {
      cyCaller.post('/diffusion/v1/currentView/diffuse', {}, () => {
        showControls(slide)
      })
    })
  }
  const url = GALFILTERED
  cyCaller.load_file_from_url(url, function (suid) {
    cyCaller.get('/v1/networks/' + suid + '/tables/defaultnode/rows', function (r) {
      const rows = JSON.parse(r)
      for (var i in rows) {
        if (rows[i]['COMMON'] === 'RAP1') {
          select_nodes(suid, [rows[i]['SUID']])
          return
        }
      }
    })
  })
}

function layout (slide) {
  const url = GALFILTERED
  cyCaller.load_file_from_url(url, function (suid) {
    cyCaller.get('/v1/apply/layouts/circular/' + suid,
      function () {
        showControls(slide)
      })
  })
}

function handleCYS (area, files) {
  addResponse('session_save', { 'file_size': files[0].size })
  area.style.backgroundColor = '#669166'
}

function initDropArea () {
  const dropArea = document.getElementById('drop-area')
  dropArea.style.visibility = 'visible'

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

  function highlight (e) {
    dropArea.classList.add('highlight')
  }

  function unhighlight (e) {
    dropArea.classList.remove('highlight')
  }
  dropArea.addEventListener('drop', handleDrop, false)

  function handleDrop (e) {
    let dt = e.dataTransfer
    let files = dt.files

    handleCYS(dropArea, files)
  }

  return dropArea
}

function session_save (slide) {
  const post_save = (loc) => {
		const text = slide.getElementsByClassName('text')[0]
		text.innerText = 'Saved session file to ' + loc + '.cys'

		initDropArea()
		showControls(slide)
	}
	const url = GALFILTERED
  cyCaller.load_file_from_url(url, function (suid) {
    cyCaller.get('/v1/session?file=//', (loc) => {
      loc = JSON.parse(loc)
			if (loc.hasOwnProperty('errors')){
				path = loc['errors'][0]['link']
				loc = path.substr(5, path.lastIndexOf('.')-5)
    		cyCaller.post('/v1/session?file=' + loc, {}, (loc2) => {
					loc2 = JSON.parse(loc2)['file']
					post_save(loc2)
				})
			}
		})
  })
}

function runjasmine (slide) {
  log(JSON.stringify(window.DATA['responses']), slide.id)

  const testDiv = document.getElementById('tests')
  testDiv.style.position = 'absolute'
  testDiv.style.zIndex = 200
  testDiv.style.bottom = 0
  testDiv.style.height = '50%'

  const revealContainer = document.getElementById('reveal-container')
  revealContainer.style.height = '50%'

  window.runtests()
}

/* HELPERS */
function addResponse (name, data) {
  if (!window.DATA.responses.hasOwnProperty(name)) {
    window.DATA.responses[name] = {}
  }
  window.res = Object.assign(window.DATA.responses[name], data)
}

function log (message, context = 'info') {
  const line = context + ' :: ' + message
  window.DATA['log'].push(line)
  const log = document.getElementById('log')
  log.innerHTML = window.DATA['log'].join('\n')
  log.scrollTop = log.scrollHeight
}

function buildInput (n) {
  let entry = ''
  if (n['type'] === 'checkbox') {
    entry = "<input type='checkbox' id='" + n['id'] + "' class='" + n['id'] + "'/>" +
      "<label for='" + n['id'] + "'>" + n['text'] + '</label>'
  } else if (n['type'] === 'text') {
    entry = "<label for='" + n['id'] + "'>" + n['text'] + '</label>' +
      "<input type='text' id='" + n['id'] + "'' name='" + n['id'] + "'/>"
  } else {
    entry = "<input type='" + n['type'] + "' id='" + n['id'] + "' class='" + n['id'] + "'/>"
  }
  return "<div class='entry'>" + entry + '</div>'
}

function buildSlide (options, container) {
  var slide = '<h3>' + options.title + '</h3>'
  if (options.text) {
    slide += "<p class='text'>" + options.text + '</p>'
  }
  slide += '<div class="preload" id="preload" style="display: block;">Preparing test<br><img src="images/preload.svg" style="border-width:0px;  background: none;"></img></div>'
  slide += '<div class="entries" id="entries" style="display: none;">'
  if (options.inputs) {
    for (var n in options.inputs) {
      slide += buildInput(options.inputs[n])
    }
  }
  slide += '</div>'
  // slide += "<p class='result'></p>"
  container.innerHTML = slide
}

function clearSession (callback, slide) {
  cyCaller.delete('/v1/session', {}, function (r) {
    callback(slide)
  })
}

function call (slide) {
  const funcs = {
    'tester': tester,
    'close_session': close_session,
    'galfiltered': (v) => { clearSession(galfiltered, v) },
    'diffusion': (v) => { clearSession(diffusion, v) },
    'layout': (v) => { clearSession(layout, v) },
    'session_save': (v) => { clearSession(session_save, v) },
    'runjasmine': runjasmine
  }

  log('Starting slide', slide.id)
  if (funcs.hasOwnProperty(slide.id)) {
    Reveal.configure({ controls: false })
    funcs[slide.id](slide)
    setTimeout(() => { Reveal.configure({ controls: true }) }, 10000)
  } else {
    showControls(slide)
  }
}

function save_answers (slide) {
  if (!slide) {
    return
  }
  const inputs = slide.getElementsByTagName('input')
  for (let i = 0; i < inputs.length; i++) {
    const inp = inputs[i]
    if (inp.type === 'file') {
      continue
    }
    const id = slide.id
    const value = {
      'checkbox': inp.checked,
      'text': inp.value
    }[inp.type]
    const obj = { [inp.id]: value }
    addResponse(id, obj)
  }
}

function showControls (slide, vis = true) {
	var preloaddisplay = vis ? "none" : "block";
  var entriesdisplay = vis ? "block" : "none";
	if (slide.getElementsByClassName("preload").length > 0) {
		slide.getElementsByClassName("preload")[0].style.display = preloaddisplay;
	}
	if (slide.getElementsByClassName("entries").length > 0) {
		slide.getElementsByClassName("entries")[0].style.display = entriesdisplay;
	}
	if (slide.id === 'runjasmine'){
		addResponse(slide.id, {'results': window.tests.innerText})
	}
	Reveal.configure({ controls: vis })
}

Reveal.initialize({
  dependencies: [
    { src: 'plugin/anything/anything.js' },
    { src: 'plugin/markdown/marked.js' },
    { src: 'plugin/markdown/markdown.js' },
    { src: 'plugin/notes/notes.js', async: true },
    { src: 'plugin/highlight/highlight.js', async: true, callback: function () { hljs.initHighlightingOnLoad(); } }
  ],
  anything: [{
    className: 'cyrest',
    defaults: { 'name': 'start', 'title': 'Cytoscape Testing' },
    initialize: function (container, options) {
      if (!options) {
        options = {}
      }
      buildSlide(options, container)
    }
  }],
  controlsBackArrows: 'hidden',
  controlsTutorial: false,
  progress: false,
  keyboard: false,
  overview: false
})

Reveal.addEventListener('slidechanged', function (event) {
  // event.previousSlide, event.currentSlide, event.indexh, event.indexv
  save_answers(event.previousSlide)
  call(event.currentSlide)
})

const cyCaller = new CyCaller()
cyCaller.setLogCallBack(log)
log('Started Cytoscape Testing', 'init')
