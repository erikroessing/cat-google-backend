const express = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.get('/', function (req, res) {
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log(fullUrl)
    console.log(req.get('origin'))
    // console.log(process.env.TIMES)
    res.send('GET request to homepage');
  })

app.listen(port, () =>{
    console.log("now listening on", port);
})

