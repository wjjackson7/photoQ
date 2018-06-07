var fs = require('fs');  // file access module
var imgList = [];
var h = [];
var w = [];

var http  = require('http');
var sqlite3 = require("sqlite3").verbose();  // use sqlite
var dbFileName = "PhotoQ.db";
// Load the db
var db = new sqlite3.Database(dbFileName);

dumpDB();

// dump database
// function dumpDB() {
//   db.all ( 'SELECT * FROM photoTags', dataCallback);
//       function dataCallback( err, data ) {
// 		console.log(data) 
//       }
// }


function dumpDB() {
	for(let i = 0; i < 988; i++){
	  db.get( 'SELECT * FROM photoTags WHERE idNum = '+ i, dataCallback);
	  function dataCallback( err, data ) {
	    try{

			console.log(data);
			
		}
		catch(err){
			console.log(i);
		}
		
	    }
	} 
}
