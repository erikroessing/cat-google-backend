const express = require('express');
require('dotenv').config();
const app = express();
const port = 5001;

app.get('/search', function (req, res) {
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log(fullUrl)
    console.log(process.env.TIMES)
    res.send('GET request to homepage');
  })

app.listen(port, () =>{
    console.log("now listening on", port);
})

