var fs = require('fs');  // file access module
var imgList = [];
var h = [];
var w = [];

var http  = require('http');
var sqlite3 = require("sqlite3").verbose();  // use sqlite
var dbFileName = "PhotoQ.db";
// Load the db
var db = new sqlite3.Database(dbFileName);

loadImageList();
writeDB();
getheightwidth();
dumpDB();



// loads info from photolist
function loadImageList () {
    var data = fs.readFileSync('photoList.json');
    if (! data) {
        console.log("cannot read photoList.json");
    } else {
        listObj = JSON.parse(data);
        imgList = listObj.photoURLs;
    }
}

function writeDB () {

	for (var i = 0; i < imgList.length; i++) {

		//fills stuff into db
		// to do - change width and height to integers and get from url
		cmdStr =  'INSERT OR REPLACE INTO photoTags VALUES ('+i+', "'+imgList[i]+'", "landmarks", "tags", "height", "width") ';
		db.run(cmdStr, dbCallback);
		function dbCallback(err) {
		if (err) { console.log(err); }
		}

	}
	//for loop

}



function getheightwidth () {
	var imgUrl = 'http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/A%20Torre%20Manuelina.jpg';
	var options = url.parse(imgUrl);
	http.get(options, function (response) {
	   var chunks = [];
	   response.on('data', function (chunk) {
	     	chunks.push(chunk);
	 }).on('end', function() {
	    var buffer = Buffer.concat(chunks);
		dims = sizeOf(buffer); 
	    console.log( sizeOf(buffer) );
		console.log( dims.width, dims.height);

	  });
	}); 
	
}



// dump database
function dumpDB() {
  db.all ( 'SELECT * FROM photoTags', dataCallback);
      function dataCallback( err, data ) {
		console.log(data) 
      }
}





