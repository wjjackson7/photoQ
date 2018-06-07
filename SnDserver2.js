var http = require('http');
var static = require('node-static');

var sqlite3 = require("sqlite3").verbose();
var fs = require("fs");

var dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);


var fileServer = new static.Server('./public');

var _name = [];
var _width = [];
var _height = [];
var _tags = []
// var count = 0;
var goal = 0;
var nananame;
var wawawidth;
var heheheight;
var tag_array;


function delete_tag_from_array(tag, array) {
  var index = array.indexOf(tag);
  if (index > -1) {
    array.splice(index, 1);
  }
}


function arrayContainsArray(superset, subset) {
  if (0 === subset.length) {
    return false;
  }
  return subset.every(function (value) {
    return (superset.indexOf(value) >= 0);
  });
}


function handler(request, response) {
  var url = request.url;
  url = url.replace("/", "");
  request.addListener('end', function () {
    fileServer.serve(request, response, function (e, res) {

      if (url.substring(0, 14) == "query?keyList=") { // valid query
        terms = url.substring(14, url.length).split("+");

        goal = 0;
        response.write('[');
        // for all terms write name
        for (var i = 0; i < 989; i++) {


          // may need to add check if landmark as well
          // skip 732
          if (i != 732) {
            db.get('SELECT * FROM photoTags WHERE idNum = ' + i, dataCallback);

            function dataCallback(err, data) {

              try {
                tag_array = `${data.tags}`;
                mark = [];
                mark.push(`${data.landmark}`);


                if (arrayContainsArray(tag_array, terms) == true || arrayContainsArray(terms, mark) == true) {
                  nananame = `${data.fileName}`;
                  wawawidth = `${data.width}`;
                  heheheight = `${data.height}`;
                  goal++;
                  handleData(response);


                }
                // went through db, return found images
                let i = `${data.idNum}`;
                if (i == 988) {
                  goal = 10000;
                  handleData(response);
                }


              }
              // end try
              catch (err) {
                console.log(err);
                console.log("error searching at: " + i);
              }


            } // end callback

          } //end if skip 732


          // end else for valid query
        }




      }
      // end of valid query
      else if (url.substring(0, 11) == "delete?key=") {

        name = url.substring(11, url.length).split("~tag=");
        // get tag to be removed and get the name of corrosponding photo
        remove_tag = name[1];
        name = name[0];

        console.log(name);
        console.log(remove_tag);


        // make db.run to get photo and update entry; the callback will return 200
        // in test2 after request to delete tell it to update state
        db.get('SELECT * FROM photoTags WHERE fileName = "' + name + '"', remove_tag_callback);

        function remove_tag_callback(err, data) {

          // console.log(data);
          var delete_update_tags = `${data.tags}`;


          delete_update_tags = delete_update_tags.split(",");

          // console.log("before remove: " + delete_update_tags);

          delete_tag_from_array(decodeURIComponent(remove_tag), delete_update_tags);
          console.log('deleted: ' + delete_update_tags);


          db.get('UPDATE photoTags SET tags = "' + delete_update_tags + '"' + 'WHERE fileName = "' + name + '"', updatecallback);

          function updatecallback(err, data) {
            console.log(err);
            response.end();
          }

          // call update


        } // end callback


      } else if (e && (e.status === 404)) { // If the file wasn't found
        fileServer.serveFile('/error.html', 404, {}, request, response);
      }
    });
  }).resume();

}




var server = http.createServer(handler);

server.listen(51745);
//server.listen(56149);

function handleData(response) {
  // console.log("in handleData" + "\n");
  // console.log(nananame);
  // console.log(wawawidth);
  // console.log(heheheight);

  // console.log("goal:" + goal);

  if (goal != 10000) {
    _name.push(nananame);
    _height.push(heheheight);
    _width.push(wawawidth);
    _tags.push(tag_array);
  }

  if (goal == 10000) {

    // console.log(_tags[0]);
    arr = _tags[0].split(",");
    // console.log(arr);

    for (let i = 0; i < _name.length - 1; i++) {
      response.write('{"src": "' + _name[i] + '",');
      response.write('"width": ' + _width[i] + ',');
      response.write('"height": ' + _height[i] + ',');

      arr = _tags[i].split(",");

      response.write('"tags": ');
      response.write('[');
      for (let j = 0; j < arr.length - 1; j++)
        response.write('"' + arr[j] + '",');
      response.write('"' + arr[arr.length - 1] + '"');


      response.write(']},');;

    }

    response.write('{"src": "' + _name[_name.length - 1] + '",');
    response.write('"width": ' + _width[_name.length - 1] + ',');
    response.write('"height": ' + _height[_name.length - 1] + ',');

    arr = _tags[_name.length - 1].split(",");
    response.write('"tags": ');
    response.write('[');
    for (let j = 0; j < arr.length - 1; j++)
      response.write('"' + arr[j] + '",');
    response.write('"' + arr[arr.length - 1] + '"');

    response.write(']}');;



    response.write(']');

    // count = 0;
    _name = [];
    _width = [];
    _height = [];
    _tags = [];

    response.end();


  }
  // else {
  //     count++;
  // }


}
// maybe make global array to hold all names width and height and store them all then
// call handledata that has it's own callback to call printing everything???



// dump database
function dumpDB() {
  db.all('SELECT * FROM photoTags', dataCallback);

  function dataCallback(err, data) {
    console.log(data)
  }
}