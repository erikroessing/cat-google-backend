const express = require('express');
const fs = require('fs');
const axios = require('axios').default;
const cheerio = require('cheerio')
const cors = require('cors');
require('dotenv').config();
const https = require('https');

const app = express();

var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

const port = process.env.PORT || 3000;

const url = "https://real-time-google-search.p.rapidapi.com/search?q="
let path = "/search?q="
const options = {
  hostname: "real-time-google-search.p.rapidapi.com",
  port: null,
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': process.env.APIKEY,
    'X-RapidAPI-Host': 'real-time-google-search.p.rapidapi.com',
    'useQueryString': true
  }
};

app.get('/:query',  async (req, response) => {
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log(fullUrl)
    console.log(req.socket.remoteAddress)
    console.log(req.header('origin'))
    console.log(req.params.query)
    let query = "cat%20"+ String(req.params.query).replace(/ /g, "%20")
    console.log(query)
    // console.log(process.env.TIMES)
    options.path = path + query
    console.log(options)
    let jsonData = JSON.parse(fs.readFileSync('responseData.json'));
    // await https.get(options, res => {
    //   const chunks = [];
    //   res.on('data', chunk => {
    //     chunks.push(chunk)
    //   });
    //   res.on('end', () => {
    //     const body = Buffer.concat(chunks);
    //     data = JSON.parse(body)
    //     let stringifyData = JSON.stringify(data);
    //     fs.writeFileSync('student-2.json', stringifyData);
		//     console.log(stringifyData);
    //     response.send(stringifyData)
        
    //   })
    // }).on('error', err => {
    //   console.log(err.message);
    // })
    const options2 = {
      hostname: "real-time-google-search.p.rapidapi.com",
      port: null,
      method: 'GET',

    }
    jsonData['imagesProcessed'] = []
    let imageSources = [];
    // console.log("getting:", jsonData.data.image_results[0].source)
    // console.log(jsonData.data.image_results)
    let urlCount = 0
    jsonData.data.image_results.forEach(async (element) => {
      console.log("trying", element.source)
      const { data } = await axios.get(element.source);
      const $ = cheerio.load(data);
      // if(element.source == 'https://www.freefavicon.com/freefavicons/animal/iconinfo/cat--5-152-85909.html'){
      //   console.log($('img'))
      // }
      for (const source of $('img')) {
        if(!source.attribs.src.includes("logo") && !source.attribs.src.includes("Logo")){
          if (source.attribs.src.includes("cat") || source.attribs.src.includes("Cat")) {
            if (source.attribs.src.includes(".com")) {
              if (source.attribs.src.startsWith('http')) {
                imageSources.push(source.attribs.src);
                break;
              }
              if(source.attribs.src.startsWith('//')){
                imageSources.push(source.attribs.src.replace('//', 'http://'));
                break;
              }
            }
          }
        }
      }
      urlCount += 1
      
    }); 
    console.log("image results.length", jsonData.data.image_results.length)
    let triesCount = 0; 
    while(jsonData.data.image_results.length != urlCount  && triesCount < 10){
      console.log("urlCount", urlCount)
      console.log("tries count:", triesCount)
      triesCount++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log("image results.length", jsonData.data.image_results.length)
    console.log("urlCount", urlCount)
    console.log("imageSources.length", imageSources.length)
    
    imageSources = [...new Set(imageSources)];

    imageSources.forEach( async (element) => {
      console.log("getting",element);
      axios.get(element, {responseType: 'arraybuffer'}).then((image)=>{
        let returnedB64 = Buffer.from(image.data).toString('base64');
        jsonData['imagesProcessed'].push(returnedB64);
      }).catch(error => {
        console.error(error.response);
        jsonData['imagesProcessed'].push(error.response);
    });
      
    })
    
    
    while(imageSources.length != jsonData['imagesProcessed'].length){
      await new Promise(resolve => setTimeout(resolve, 500));
      
    }
    // const { data } = await axios.get(jsonData.data.image_results[0].source);
    // // Load HTML we fetched in the previous line
    // const $ = cheerio.load(data);
    // const listImages = $('img');
    // listImages.each((index, element) => {
    //   console.log(index, element.attribs.src)
    // });
    // console.log($('img'))
    // axios.get(data.data.image_results[0].source)
    //   .then((res)=>{
    //     console.log(response);
    //   })
    //   .catch(function (error) {
    //     // handle error
    //     console.log(error);
    //   })
    response.send(JSON.stringify(jsonData))
   
    
    // fetch(`https://real-time-google-search.p.rapidapi.com/search?q=cat%20bitcoin`, options)
    //   .then(response => response.json())
    //   .then(response => res.send(response))
    //   .catch(err => {
    //     throw new Error(err)
    //   });
    // res.send(query)
    
  })

app.listen(port, () =>{
    console.log("now listening on", port);
})

