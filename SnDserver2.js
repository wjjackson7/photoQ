var http  = require('http');
var static = require('node-static');
 
var fileServer = new static.Server('./public');

// global variables
var fs = require('fs');  // file access module
var imgList = [];
loadImageList();

// just for testing, you can cut this out
console.log(imgList.length);

function loadImageList () {
    var data = fs.readFileSync('photoList.json');
    if (! data) {
        console.log("cannot read photoList.json");
    } else {
        listObj = JSON.parse(data);
        imgList = listObj.photoURLs;
    }
}




function handler (request, response) {
    var url = request.url;
    url = url.replace("/","");
    request.addListener('end', function () {
        fileServer.serve(request, response, function (e, res) {

            if(url.substring(0, 14) == "query?numList=" ){ // valid query 

                numbers = url.substring(14,url.length).split("+");
                console.log(numbers);
                // get list of numbers
                response.write('{ "photoURLs": ['+"\n");
            

                // for all numbers write name
                for(var i = 0; i < numbers.length; i++)
                {
                        // query >989 || < 0
                    if(parseFloat(url.substring(14, url.length)) > 988 || parseFloat(numbers[i]) < 0) {
                        response.writeHead(404, {"Content-Type": "text/html"});
                        response.write("<p>Bad Query</p>");
                        console.log("bad query");
                        // response.end();
                    }
                    // valid query send name of photo
                    else {
                        // write name width height json

                        if(i == numbers.length-1){
                            response.write('{"name": "'+imgList[parseFloat(numbers[i])]+'"}'+"\n"); 
                            //if its last one excluse ,
                            console.log(imgList[parseFloat(numbers[i])]);

                        }
                        else {
                            response.write('{"name": "'+imgList[parseFloat(numbers[i])]+'"},'+"\n"); 
                        // response.write('width: "'+imgList[parseFloat(numbers[i])]+'",'+"\n");            
                        // response.write('height: "'+imgList[parseFloat(numbers[i])]+'",'+"\n");            

                        console.log(imgList[parseFloat(numbers[i])]);
                        }
                        
                        // response.end();

                    }
                }

                response.write(']'+'\n');            
                response.write("}"+"\n");
                response.end();
                 // end for

                
            }
            // end of valid query   

            else if (e && (e.status === 404)) { // If the file wasn't found
                fileServer.serveFile('/error.html', 404, {}, request, response);
            }
        });
    }).resume();

}




var server = http.createServer(handler);

server.listen(51745);

