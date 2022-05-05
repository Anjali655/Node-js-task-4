const express = require('express');
let app = express();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/formdb";
const multer =  require('multer');
const bodyParser = require("body-parser");
const path = require('path');
// app.set('view engine', 'ejs');
var fs =  require('fs');
const PORT = process.env.PORT || 3000;

// use the middleware of bodyParser
app.use(bodyParser.urlencoded({ extended: true }))

 
// multer code
var storage =  multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'uploads');
    },
    filename: function(req,file,cb){
        cb(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname));
    }
})

var upload =  multer({
    storage : storage
})


// configuring the home route
app.get('/',(req, res) =>{
    res.writeHead(200);
    fs.createReadStream("index.html", "UTF-8").pipe(res);
    // res.sendFile(__dirname + '/index.html');
})


// getting the countries in the dropdown
app.get('/countries', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db('formdb');
        dbo.collection("countries").find({}).toArray((err,response)=>{
            if(err) throw err;
            // console.log(response);
            res.send(response);
            })
      });
})
 

// configuring the upload file route
app.post('/uploadData', upload.single("profilePic"), (req,res,next) =>{
    const file = req.file;
    let imageUrl = '';

    if(!file){
        const error = new Error("Please upload a file");
        error.httpStatusCode = 404;
        return next(error);
    }

    imageUrl = "/uploads/" + file.filename

    // user details object
        let details = 
        {first_name: req.body.first_name,
        last_name:req.body.last_name,
        email:req.body.email,
        gender:req.body.gender,
        userProfile: imageUrl
    };

   
    imageUrl?

//configuring the data and image upload to the database
MongoClient.connect(url, async function(err, db) {
  if (err) throw err;
  var dbo = db.db("formdb");
//   var myobj = { UserImage: imageUrl};
var myobj = details;
  let userId = await new Promise((resolve, reject) => { dbo.collection("col1").insertOne(myobj, function(err, res) {
    if (err) reject(err);

    console.log("Details and profile pic uploaded Successfully");
    resolve( res.insertedId);
    //db.close();
    return res.insertedId;
  })

});

  console.log(userId);

// address object
const address = JSON.parse( req.body.addresses);

console.log(address, "address");

const dataDetails = Promise.all( address.map((value)=>{
    data =  {
        userId:userId,
        city: value.city,
        state: value.state,
        zip:value.zip,
        country:value.country,
}
var myobj = data;
  dbo.collection("address").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("Address uploaded Successfully");
    userId = res.insertedId;
    // db.close();

  })

}));
//  details = 
//         {
//             userId:userId,
//             city: address[0].city,
//             state: address[0].state,
//             zip:address[0].zip
//             // countries:req.body.countries,
//     };



})


// save into mongodb instance ends here
:res.send("Couldn't upload a file");
    res.send(file);
})



app.listen(3000,()=>{
    console.log("server is listening on port 3000");
});