var urls = require('url');
var http = require('http');
var sizeOf = require('image-size');
var sqlite3 = require("sqlite3").verbose();
var fs = require("fs");
var APIrequest = require('request');
var dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);
var photopath = 'http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/';

// prevent denial-of-service attacks against the TA's lab machine!
http.globalAgent.maxSockets = 1;

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (let i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

// Node module for working with a request to an API or other fellow-server
var APIrequest = require('request');


// An object containing the data the CCV API wants
// Will get stringified and put into the body of an HTTP request, below


// URL containing the API key 
// You'll have to fill in the one you got from Google
url = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBRchRNmt4L6pEgjIxsugrOJEpGT3a4CjM';


// function to send off request to the API
function annotateImage(name, index, dims) {
        APIrequestObject = {
  "requests": [
    {
      "image": {
        "source": {"imageUri": "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/"+name}
        },
      "features": [{ "type": "LABEL_DETECTION" },{ "type": "LANDMARK_DETECTION"} ]
    }
  ]
}
    // The code that makes a request to the API
    // Uses the Node request module, which packs up and sends off 
    // an HTTP message containing the request to the API server
    APIrequest(
        { // HTTP header stuff
        url: url,
        method: "POST",
        headers: {"content-type": "application/json"},
        // will turn the given object into JSON
        json: APIrequestObject
        },
        // callback function for API request
        APIcallback
    );


    // callback function, called when data is received from API
    function APIcallback(err, APIresponse, body) {
        if ((err) || (APIresponse.statusCode != 200)) {
        console.log("Got API error");
        console.log(body);
        } 
        else {
        APIresponseJSON = body.responses[0];
        // console.log(APIresponseJSON);
        // console.log(APIresponseJSON.landmarkAnnotations[0].locations);
        var tag_array = [];
        decode_name = decodeURIComponent(name);
        var mark = "";
        if(typeof APIresponseJSON.landmarkAnnotations == 'undefined')
            mark = "";
        else{
            // console.log("landmakr :" + APIresponseJSON.landmarkAnnotations[0].description);
            mark = APIresponseJSON.landmarkAnnotations[0].description;
            tag_array.push(mark);
        }

        // console.log(mark);

        // try{
        //     mark = APIresponseJSON.landmarkAnnotations[0].description;
        // }

        // catch(err){
        //     mark = "";
        // }

        // console.log(decode_name);


        
        // var tag_line = "";

        var count = 0;
        if(tag_array.length == 1)
            count++;
        // if got less than 6 tags catch it
        // try {
            while(count < 6){
                if(APIresponseJSON.labelAnnotations != undefined){
                // console.log(desc.description);
                    if(APIresponseJSON.labelAnnotations[count] != undefined){
                        var desc = APIresponseJSON.labelAnnotations[count].description;
                        tag_array.push(""+desc);
                        // tag_line += "'" + desc + "',";
                    }
                    
                }
                count++;
            }
            // end while
        // }
        // end try
        // catch(error){
        //         console.log(error);
        // }


        
        // if(typeof mark == 'undefined'){
        //     mark = "";
        //     desc = APIresponseJSON.labelAnnotations[count++].description;
        //     tag_array.push(""+desc);
        // }
        // else{
        //     tag_array.push(""+mark);
        // }
        // mark = mark.trim();

        var cmd = cmdStr.replace("_IDX", index)
            cmd = cmd.replace("_FILENAME", photopath+name)
            cmd = cmd.replace("landmark",mark)
            cmd = cmd.replace("tags", tag_array)
            cmd = cmd.replace("_WIDTH", dims.width)
            cmd = cmd.replace("_HEIGHT", dims.height)

            console.log("        item ", index, " complete!");


            db.run(cmd,insertDataCallback);



        }
        //end else   

    

        } // end callback function

} // end annotateImage




function getImageDims( index, name, callback ) {
    var imgUrl = 'http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/' + name;
    var options = urls.parse(imgUrl);



    http.get(options, function (response) {
        var chunks = [];
        var byteLen = 0;

        response.on('data', function (chunk) {
            chunks.push(chunk);
            byteLen += chunk.length;
            // console.log("        item ", index, " read", byteLen, "bytes from remote host.")

            var ready = false;
            var dims = null;

            /* Try to parse a partial download;
                           if this works, we don't need the rest of the file! */
            try {
                var buffer = Buffer.concat(chunks);
                if (dims = sizeOf(buffer)) ready = true;
            } catch(err) {
                /* We're counting on sizeOf to throw an exception if it doesn't
                          have enough information to determine image dimensions. */
                // console.log("        item ", index, " can't determine image bounds... waiting for more data!");
            }

            if (ready) {
                response.destroy();
                // console.log("        item ", index, " dimensions:", dims);
                callback(index, name, dims);
            }
        });
    });
}

var imglist = JSON.parse(fs.readFileSync("photoList.json")).photoURLs;
var cmdStr = 'INSERT INTO photoTags VALUES ( _IDX, "_FILENAME", "landmark" , "tags" , _WIDTH, _HEIGHT )';
// var cmdStr = "CREATE TABLE photoTags (idNum INTEGER UNIQUE NOT NULL PRIMARY KEY, fileName TEXT , landmark TEXT, tags TEXT, height TEXT, width TEXT)";

var cbCount = 0;
var cbGoal = imglist.length;

// Always use the callback for database operations and print out any error messages you get.
function insertDataCallback(err) {
    if (err) {
        console.log("Error while saving data in DB: ",err);
    }

    cbCount += 1;
    if (cbCount == cbGoal) db.close()
}

function saveImageDims( index, name, dims ) {



    // var cmd = cmdStr.replace("_IDX", index)
    // cmd = cmd.replace("_FILENAME", photopath+name)
    // cmd = cmd.replace("landmark","empty")
    // cmd = cmd.replace("tags", ["1","2"])
    // cmd = cmd.replace("_WIDTH", dims.width)
    // cmd = cmd.replace("_HEIGHT", dims.height)

    // console.log("        item ", index, " complete!");


    // db.run(cmd,insertDataCallback);


    annotateImage(name,index, dims);
    sleep(1200);
}

for (let i = 0; i < imglist.length; i++) {
    // console.log("Enqueuing item ", i, "   ", imglist[i]);
    /* encodeURIComponent escapes characters that are in the filename but invalid in a URL */
    getImageDims( i, encodeURIComponent(imglist[i]), saveImageDims );

}

console.log("End of script file...");
