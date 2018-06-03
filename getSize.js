// Get size of one image, then call cbFun
function getSize(cbFun) {
	var imgUrl = 'http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/A%20Torre%20Manuelina.jpg';
    var options = url.parse(imgURL);

    // call http get 
    http.get(options, function (response) {
	var chunks = [];
	response.on('data', function (chunk) {
	    chunks.push(chunk);
	}).on('end', function() {
	    var buffer = Buffer.concat(chunks);
	    dimensions = sizeOf(buffer);
	    cbFun(dimensions.width, dimensions.height);
	})
    })
}


function cbFun(width, height) {
	console.log(width, height);
}

getSize();