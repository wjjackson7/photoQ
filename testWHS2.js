// Global; will be replaced by a call to the server! 
// var photoURLArray = 
// [
//  { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/A%20Torre%20Manuelina.jpg"},
//  { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Uluru%20sunset1141.jpg" },
//  { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Sejong tomb 1.jpg"},
//  { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Serra%20da%20Capivara%20-%20Painting%207.JPG"},
//  { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Royal%20Palace%2c%20Rabat.jpg"},
//  { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Red%20pencil%20urchin%20-%20Papahnaumokukea.jpg"}
//  ];



// Called when the user pushes the "submit" button 
function photoByNumber() {

	var num = document.getElementById("num").value;
	num = num.trim();
	// var numbers = num.split(",");
	var numbers = num.replace(/,/g, '+');

	console.log(numbers);

	var photoNum = Number(numbers.split('+')[0]);


	if (photoNum != NaN) {
		var getURL = new XMLHttpRequest();
		var url = "query?numList=" + numbers;
		console.log(url);
		getURL.open('GET', url);
		getURL.addEventListener("load", respCallback);
		getURL.send();
		// var photo = URL(photoNum);
		// var photoURL = photoURLArray[photoNum].url;

		function respCallback() {
			var json = JSON.parse(getURL.responseText);
			// var photoName = getURL.responseText;
			// loop for each photo
			for(var i = 0; i < json.photoURLs.length; i++){
				console.log(json.photoURLs[i].name)
			}
			var photoName = json.photoURLs[0].name;
			var urlStart = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";
			var display = document.getElementById("photoImg");
			display.src = urlStart+photoName;
		}
		// end respCallback

		
	}
	// end if

}
// end photobynumber

