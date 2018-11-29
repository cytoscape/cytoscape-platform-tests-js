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
const dotenv = require('dotenv');
const config = dotenv.config();
var apiKey =  "";
var jiraURL = "";

if(!config || config.error){
  console.error("No .env file found in the root of the directory. Plase add a .env file.");
  throw result.error;
}
if(!config.parsed.JIRA_API_KEY || config.parsed.JIRA_API_KEY.trim() == "" || config.parsed.JIRA_API_KEY.trim() == "[PLACE YOUR TOKEN HERE]"){
  console.error(`\n The .env file in the root of the directory is missing an entry for JIRA_API_KEY. \n 
  Please add an entry in the file for JIRA_API_KEY. \n
  To do so, copy and past the following in the .env file along with a valid API token string at the end: \N
  JIRA_API_KEY="[PLACE YOUR TOKEN HERE]" \n
  Be sure to replace [PLACE YOUR TOKEN HERE], including the brackets, with your valid API token.
  `);
  throw new Error("Missing JIRA_API_KEY in .env");
}
apiKey = config.parsed.JIRA_API_KEY;

if(!config.parsed.JIRA_URL || config.parsed.JIRA_URL.trim() == ""){
   console.error(`\n The .env file in the root of the directory is missing or has an invalid entry for JIRA_URL. \n 
  Please add an entry in the file for JIRA_URL. \n
  To do so, copy and past the following in the .env file: \N
  JIRA_URL="https://cytoscape.atlassian.net/rest/api/3/issue/" \n
  `);
  throw new Error("Missing or invalid url for JIRA_URL in .env");
}

jiraURL = config.parsed.JIRA_URL;

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

  var testerName = req.body.testerName
  var testerEnv = req.body.testerEnv
  var testerFeedback = req.body.testerFeedback
  var fileData = req.body.fileData
  var summary = testerEnv + ', Tester: ' + testerName;
  // submit a request to create a jira ticket issue id, we will then call SendJiraAttach to attach the generated report file
  // define Jira tickets parameters
  request_data = {
    "fields": {
      "summary": summary,
      "description": {
          "type": "doc",
          "version": 1,
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": testerFeedback
                }
              ]
            }
          ]
        },
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
    uri: jiraURL,
    body: request_data,
    json: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${apiKey}`
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

//send attachment
function SendJiraAttach(key, data) {
  var options = {
    url: `${jiraURL}${key}/attachments`,
    headers: {
      // 'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${apiKey}`,
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
    filename: 'CytoscapeTestHarness.log',
    contentType: 'text/plain'
  });
}



// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Test Magic happens on port ' + port);
