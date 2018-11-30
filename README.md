# Cytoscape Platform Testing in Javascript

A web framework for running platform tests on Cytoscape Milestone releases for interactive sanity checks via CyREST. [Check out the example webapp](http://brettjsettle.github.io/cytoscape-platform-tests-js).
## NOTE: If you are using a browser other than Chrome, there may be issues communicating with Cytoscape CyREST

The webapp was created as a set of [reveal.js slides](https://github.com/hakimel/reveal.js) and tested via the [Jasmine testing framework](https://jasmine.github.io/) but can be implemented in any script or application.

## Table of contents

- [Motivation](#motivation)
- [API](#api)
- [Developer Instructions](#developer-instructions)
 - [Full setup](#full-setup)
 - [Folder Structure](#folder-structure)
- [Issues](#issues)
- [License](#license)

## Motivation

Cytoscape is intended to operate across multiple platforms (Windows, Mac, Linux, etc). On occasion, Cytoscape will exhibit unexpected behaviours on these platforms, due to differing file locations, UI implementations, installed Java versions, etc. Testing for these behaviours is a tedious process involving performing many Cytoscape tasks in the UI directly. We intend to automate this as much as possible to reduce the time involved for an individual tester to test a particular platform and configuration.

### API

The CyCaller class resides in `src/app/js/cycaller.js` and acts as the main communicator with Cytoscape. All calls to CyREST are made via a CyCaller instance. Here is a simple script for using CyCaller:

```python
const caller = new CyCaller()

# Clear the session
cyCaller.delete('/v1/session')

# Open a CX file
const url = 'http://chianti.ucsd.edu/~bsettle/galFiltered.cx'
cyCaller.load_file_from_url(url, function (suid) {
  console.log("SUID is " + suid")
  cyCaller.get('/v1/apply/layouts/circular/' + suid, function(){
    console.log("Layout applied")
  })
})
```

CyCaller currently provides the following functions:

```python

request (method, url, data, callback)
""" Send an XMLHTTPRequest as described by the _execute method
"""

_execute (http_method, endpoint, data, callback)
""" Internal HTTP request builder which propagates parameters to the request method
"""

post (endpoint, data, callback = console.log)
""" Execute an HTTP POST request to the given endpoint. This calls _execute with http_method="POST"
"""
  
put (endpoint, data, callback = console.log)
""" Execute an HTTP PUT request to the given endpoint. This calls _execute with http_method="PUT"
"""
  
get (endpoint, callback = console.log)
""" Execute an HTTP GET request to the given endpoint. This calls _execute with http_method="GET"
"""
  
delete (endpoint, data, callback = console.log)
""" Execute an HTTP DELETE request to the given endpoint. This calls _execute with http_method="DELETE"
"""

load_file_from_url (url, callback)
""" Load a network file from a URL. Currently only supports CX files
"""

get_network_suid (callback)
""" Fetch the SUID of the currently selected subnetwork and pass it to the callback
"""
```
These functions also return as promises which allow for cleaner and easier to read code.


### Pre-setup
To utilize this harness against Cytoscape 3.7+, be sure to download cytoscape on your machine via the [The Official Cytoscape downlaod page](https://cytoscape.org/download.html). Or simplly precede to the [Developer Instructions](#developer-instructions) and follow the instructions to install Cytoscape presented in the test harness.

## Developer Instructions

If you would like to contribute to the Cytoscape platform tests, please read the information below.

### Full setup

To setup a local server and view the reveal.js testing slides that we have created, do the following, below. However, if you want to skip all the steps, here is the TLDR.
Paste and execute this block to clone the Test harness repository and check out the desired branch:
```
DIR=${HOME}/projects
BRANCH=develop

cd $DIR && \
git clone https://github.com/Swen670Grp1/cytoscape-platform-tests-js.git && \
cd cytoscape-platform-tests-js && \
git checkout $BRANCH
npm install && \
npm run build && \
npm run start:server

```

If the previous block was run in a terminal, skip to step 7 and only execute steps 7-9.


1. Install [Node.js](http://nodejs.org/) (4.0.0 or later). We use [Grunt](https://github.com/gruntjs/grunt) to simplify the build process

1. Clone the repository
   ```sh
   $ git clone https://github.com/Swen670Grp1/cytoscape-platform-tests-js.git
   ```

1. Navigate to the folder
   ```sh
   $ cd cytoscape-platform-tests-js
   ```

1. Checkout the appropriate branch (develop or master)
   ```sh
   $ git checkout develop
   ```

1. Install dependencies
   ```sh
   $ npm install
   ```

1. Build the webapp
   ```sh
   $ npm run build
   ```

1.  Open the .env file, located at the root of the project and ensure that there exists entires for the `JIRA_API_KEY` and `JIRA_URL`. If not copy and paste the following into the file:
    ```sh
    JIRA_API_KEY="[PLACE YOUR TOKEN HERE]"
    JIRA_URL="https://cytoscape.atlassian.net/rest/api/3/issue/"'
    ```
    Be sure to replace [PLACE YOUR TOKEN HERE], including the brackets, with your valid API token for Jira.

1. Serve the presentation and monitor source files for changes be doing A or B.
   
   - A
   ```sh
   $ npm run start:server
   ```

   - B
   ```sh
   $ npm run start (for the standalone Web app)
   ```
   
1. If option A was done in the previous step, open <http://localhost:8080> to view the slides.

    If option B was done in the previous step, open <http://localhost:8000> to view the slides. You can change the port by using `npm run start -- --port=8001`.
   
   
1. To build the standalone webapp, run the build command via npm
   ```sh
   $ npm run build
   ```
### Test Deck Report Log Structure
TBD

### Folder Structure

- **src/app/js/cycaller.js** The Cytoscape platform testing Javascript API
- **src/app/networks/** Cytoscape network files for testing
- **src/app/spec/** The Jasmine spec file describing automated tests
- **src/app/plugin/** Components that have been developed as extensions to reveal.js
- **src/app/lib/** All other third party assets (JavaScript, CSS, fonts)


## Issues

* Browsers other than Chrome show security issues when trying to call CyREST
* Logs are not as informative as they could be

## License

MIT licensed
