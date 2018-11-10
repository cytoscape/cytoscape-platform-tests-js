// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
//TODO must update path correctly
var testHarnessPath = "./docs";

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Welcome to Cytoscape Test harness' });  

});


// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
app.use('/', express.static(testHarnessPath));
// Jira code to submit report
 function CreateJiraIssue(data) {
      const Http = new XMLHttpRequest()
      Http.open("POST", "https://cytoscape.atlassian.net/rest/api/3/issue")
      Http.setRequestHeader("Content-type", "application/json")
      Http.setRequestHeader("Accept", "application/json")
      Http.setRequestHeader("X-Atlassian-Token", "nocheck")
      Http.setRequestHeader("Authorization", "Basic a291aXNzYXJAZ21haWwuY29tOmppcmFzdWNrcw==")
      Http.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          alert(this.responseText);
        }
      };
      Http.send(data)
      alert(data);
      alert(JSON.stringify(Http.response))
}

// send attachment
function SendJiraAttach(id) {
    const auth = 'Basic ' + new Buffer(props['jiraAppUserName'] + ':' + props['jiraAppPassword']).toString('base64');
      var options = {
        url: 'https://cytoscape.atlassian.net/rest/api/3/issue/'+ issueID + '/attachments',
        headers: {
          'Authorization': auth,
          'X-Atlassian-Token': 'nocheck'
        }
      };
    
      var r = request.post(options, function (err, res, body) {
          if (err) {
            console.error(err);
            resOut.status(500).json({
              messages: 'outch',
              obj: {}
            });
          } else {
            console.log('Upload successful!  Server responded with:', body);
            resOut.status(200).json({
              messages: 'successfully updated jira ticket',
              obj: {}
            });
          }
        }
      );
      var form = r.form();
      form.append('file', fs.createReadStream('./somefile.png'));
    }


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Test Magic happens on port ' + port);
