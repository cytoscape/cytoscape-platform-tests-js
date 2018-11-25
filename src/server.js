// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
const request = require('request-promise');
var urlencodedParser = bodyParser.urlencoded({ limit: '50mb', extended: true });
var testHarnessPath = "./src/app";
var port = process.env.PORT || 8080;        // set our port



// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', (req, res) => {
  res.send('Welcome to Cytoscape Test Harness API')
});

app.post('/receiveData', urlencodedParser, (req, res) => {

  var testerName = JSON.stringify(req.body.testerName)
  var testerEnv = JSON.stringify(req.body.testerEnv)
  var fileData = JSON.stringify(req.body.fileData)
  var summary = testerEnv + ', Tester: ' + testerName;

  // define Jira tickets parameters
  request_data = {
    "fields": {
      "summary": summary,
      "project":
      {
        "id": "10101"
      },
      "issuetype": {
        "id": "10100"
      }
    }
  };

  const options = {
    method: 'POST',
    uri: 'https://cytoscape.atlassian.net/rest/api/3/issue',
    body: request_data,
    json: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Basic a291aXNzYXJAZ21haWwuY29tOmppcmFzdWNrcw=='
    }
  }

  request(options).then(function (response) {
    issueKey = response.key;
    SendJiraAttach(issueKey, fileData);
    res.send(response)
    res.status(200).json(response);
  })
    .catch(function (err) {
      console.log(err);
    })
  // capture the encoded form data
  req.on('data', (data) => {
    console.log(data.toString());
  });
  // send a response when finished reading
  // the encoded form data
  req.on('end', () => {
    res.send('OK');
  });
});



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
app.use('/', express.static(testHarnessPath));

// create issue id
function createJiraIssue() {
  var summary = testerEnv + ', Tester: ' + testerName;

  // define Jira tickets parameters
  request_data = {
    "fields": {
      "summary": summary,
      "project":
      {
        "id": "10101"
      },
      "issuetype": {
        "id": "10100"
      }
    }
  };

  const options = {
    method: 'POST',
    uri: 'https://cytoscape.atlassian.net/rest/api/3/issue',
    body: request_data,
    json: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Basic a291aXNzYXJAZ21haWwuY29tOmppcmFzdWNrcw=='
    }
  }

  request(options).then(function (response) {
    issueKey = response.key;
    SendJiraAttach(issueKey, fileData);
    res.send(response)
    res.status(200).json(response);
  })
    .catch(function (err) {
      console.log(err);
    })
}
//send attachment
function SendJiraAttach(key, data) {
  var options = {
    url: 'https://cytoscape.atlassian.net/rest/api/3/issue/' + key + '/attachments',
    headers: {
      // 'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Basic a291aXNzYXJAZ21haWwuY29tOmppcmFzdWNrcw==',
      'X-Atlassian-Token': 'nocheck'
    }
  };

  var req = request.post(options, function (err, res, body) {
    if (err) {
      console.error(err);
      res.status(500).json({
        messages: 'outch',
        obj: {}
      });
    } else {
      console.log('Upload successful!  Server responded with:', body);
      console.log(JSON.stringify(body))
      return res
    }
  });
  var form = req.form();
  form.append('file', data, {
    filename: 'test.txt',
    contentType: 'text/plain'
  });
}



// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Test Magic happens on port ' + port);
