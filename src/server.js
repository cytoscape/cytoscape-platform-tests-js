const express = require('express');
const bodyParser     = require('body-parser');

const app   = express();

const port = 9000;
app.listen(port, () => {
  console.log('We are live on ' + port);
});
