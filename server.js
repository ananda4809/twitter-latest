const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const Twitter = require('twitter');
const util = require("util");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

const mongoose = require('mongoose');

let mongoURL = 'mongodb://anand:anand5@ds035674.mlab.com:35674/twitter_users';
mongoose.connect(mongoURL, { useNewUrlParser: true }, (err)=>{
    console.log("connection successful to mongoose");
});

var Message = mongoose.model('twitter_login_users', {
    email: String,
    consumer_key: String,
    consumer_secret: String,
    access_token_key: String,
    access_token_secret: String
});

var TwitterData = mongoose.model('twitter_data', {
    email: String,
    text: String,
    hashtags: String,
    expandedurl: String,
    name: String,
    screenname: String,
    location: String
});

app.post("/apis/getUserAuthenticate", (req, res)=>{
    let data = req.body;
    console.log(data);

    Message.findOne({email:data.email}).exec(function(err, data){
        
        if(data === null) 
        { 
            res.json({
                "status" : "fail",
                "message" : "No email id found"
            });
        }
        else
        {
            var twitter = new Twitter({
                consumer_key: data.consumer_key,
                consumer_secret: data.consumer_secret,
                access_token_key: data.access_token_key,
                access_token_secret: data.access_token_secret
            });

            // console.log("twitter : ", twitter["options"]);
            
            let date = new Date();
            date.setDate(date.getDate()-7);
            let startDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
            let filterParams = {count : 200, since : startDate};

            twitter.get('statuses/home_timeline', filterParams, function(error, tweets, response) {
                if(error) throw error;
                
                let allDataToSave = [];
                tweets.forEach(eachData => {
                    if((eachData.entities.urls).length > 0)
                    {
                        
                        let hashtags = [];
                        for(let i=0; i<(eachData.entities.hashtags).length; i++)
                        {
                            hashtags.push(eachData.entities.hashtags[i].text);
                        }

                        let tempObj = {
                            email : data.email,
                            text : eachData.text,
                            hashtags : hashtags.join(","),
                            expandedurl : eachData.entities.urls[0].expanded_url,
                            name : eachData.user.name,
                            screenname : eachData.user.screen_name,
                            location : eachData.user.location
                        };

                        allDataToSave.push(tempObj);
                    }
                });

                TwitterData.collection.insert(allDataToSave, (error, result)=>{
                    if(error) { throw error; }
                    res.json(result["result"])
                });
            });
        }
    });
});

app.post("/apis/getAllData", (req, res)=>{
    let emailId = req.body.email;
    TwitterData.find({email:emailId}, (err, data)=>{
        if(err) { throw err; }

        let tableData = {
            columns: [
                {
                    label: 'Name',
                    field: 'name',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'ScreenName',
                    field: 'screenname',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'Location',
                    field: 'location',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'Text',
                    field: 'text',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'Hashtags(s)',
                    field: 'hashtag',
                    sort: 'asc',
                    width: 270
                },
                {
                    label: 'URL',
                    field: 'url',
                    sort: 'asc',
                    width: 200
                }
            ],
            rows : []
        };

        let returningData = [];
        data.forEach(eachData => {
            let tempObj = {
                "name" : eachData.name,
                "screenname" : eachData.screenname,
                "location" : eachData.location,
                "text" : eachData.text,
                "hashtag" : eachData.hashtags,
                "url" : eachData.expandedurl
            }
            tableData.rows.push(tempObj);
        });
        
        res.json(tableData);
    })
});

const port = 5001;
app.listen(port, ()=>{
    console.log(`App listening to port ${port}`);
});