require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const mongo = require('mongodb')
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const Schema = mongoose.Schema;
let urlSchema = new Schema({
  original: {type:String, unique:true},
  short: Number
});
let UrlData = mongoose.model("UrlData",urlSchema);

app.post("/api/shorturl/new",(req,res)=>{
  let inputUrl = req.body.url;
  let regex =  /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  if(regex.test(inputUrl)){
    UrlData.estimatedDocumentCount((error,count)=>{
      if(error){return console.log(error)}
      let num = count + 1;
      UrlData.findOne({original:inputUrl},(error,data)=>{
        if(error){return console.log(error)}
        if(data != null){
          res.json({
            original_url: data.original,
            short_url: data.short
          })
        }
        if(data == null){
          new UrlData({
            original: inputUrl,
            short: num
          }).save((error,data)=>{
            if(error){return console.log(error)}
            res.json({
              original_url: data.original,
            short_url: data.short
            })
          })
        }
      })
    })
  }else{
    res.json({
      error: 'invalid url'
    })
  }
});

app.get('/api/shorturl/:input',(req,res)=>{
  let input = req.params.input;
  UrlData.findOne({short:input},(error,data)=>{
    if(!error && data != undefined){
      res.redirect(data.original)
    }else{
      res.json("URL NOT FOUND")
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
