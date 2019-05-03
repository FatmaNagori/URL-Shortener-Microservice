'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var urlExist=require('url-exists')
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true})
const Schema=mongoose.Schema;
const urlSchema=new Schema({"original_url":String,"short_url":Number});
const Url=mongoose.model('Url',urlSchema);


app.use(cors());


 
/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser=require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
app.get("/api/shorturl/:url?",function(req,res){
  var url=req.params.url;
  Url.findOne({"short_url":url},(err,data)=>{
   if(err){
      return err;
   }else{
     if(data==null){res.send("Not Found")}
     else{res.redirect(data.original_url)}
   }
  })
})

  

app.post("/api/shorturl/new/", function (req, res) {
  var url=req.body.url;
  urlExist(url,(err,exist)=>{
    if(exist){
       Url.findOne({"original_url":url},(err,data)=>{
       if (err){
          return err;
       }else{
         if (data==null){
           var number=new Date().getTime();
            var obj=new Url({"original_url":url,"short_url":number});
            obj.save(err,data=>err?err:data)
            res.json({"original_url":url,"short_url":number})
         }else{
           res.json({"original_url":data.original_url,"short_url":data.short_url})
         }
       }
      })
    }
    else{
      res.json({'error':"invalid URL"})
    }
  })

});



app.listen(port, function () {
  console.log('Node.js listening ...');
});
