
/* This array is just for testing purposes.  You will need to
   get the real image data using an AJAX query. */
var photos = [];

function delete_tag_from_array(tag, array){
 var index  = array.indexOf(tag);
   if (index > -1) {
     array.splice(index, 1);
   }
}

// A react component for a tag
class Tag extends React.Component {

    render () {
      var parentupdate = this.props.parentupdate;
      let parent = this.props.parent;
	    return React.createElement('div', { className: 'tagdiv', onClick: (event) => {
          var oReq = new XMLHttpRequest();
            oReq.open("GET", "delete?key=" + this.props.parentImage + "~tag=" + this.props.text);
            oReq.addEventListener("load", fnCallback);
            oReq.send();

            function fnCallback(err) {
                // no need to do anything here
            }

          // alert("New tags: " + this.props.parentImage);

          parent.removeTag(this.props.text);

          event.stopPropagation();
          // parentupdate(event,this.props.parentImageindexOf(this.props.text));
          console.log(this.props);
          // window.dispatchEvent(new Event('resize')); /* The world is held together with duct tape */
        }
      },
      React.createElement('p', { className: 'tagText'}, this.props.text));
      // contents
    }
};


class TileControl extends React.Component {
    removeTag(tagname){
      var proptag = this.props.src.tags;
      var tag_list = this.props.src.tags;
      delete_tag_from_array(tagname,tag_list);
      this.setState({proptag : proptag});
    }

    render () {
    // remember input vars in closure
    var _selected =this.props.selected;
    var the_tags =this.props.src.tags;
    // var display_tags = this.props.tags;

    var name = this.props.src.src;

    // parse image src for photo name
    // var photoNames = _src.split("/").pop();
    // photoNames = photoNames.split('%20'); //.join(' ');
    var args = [];
    args.push( 'div' );
    args.push( { className: _selected ? 'selectedControls' : 'normalControls'} )
    for (var idx =0; idx < the_tags.length; idx++)
      args.push( React.createElement(Tag,
        {text: the_tags[idx], parentImage: name, parent: this}
      ) );

    // add input box here
    // args.push( React.createElement(input, value = , onChange = ) );
    return ( React.createElement.apply(null, args) );
}};

// A react component for an image tile
class ImageTile extends React.Component {

    render() {
	// onClick function needs to remember these as a closure
	var _onClick = this.props.onClick;
	var _index = this.props.index;
	var _photo = this.props.photo;
	var _selected = _photo.selected; // this one is just for readability

	return (
	    React.createElement('div',
	        {style: {margin: this.props.margin, width: _photo.width},
			 className: 'tile',
                         onClick: function onClick(e) {
			    console.log("tile onclick");
			    // call Gallery's onclick
			    return _onClick (e,
					     { index: _index, photo: _photo })
				}
		 }, // end of props of div
		 // contents of div - the Controls and an Image
		React.createElement(TileControl,
		    {selected: _selected,
		     src: _photo}),
		React.createElement('img',
		    {className: _selected ? 'selected' : 'normal',
                     src: _photo.src,
		     width: _photo.width,
                     height: _photo.height
			    })
				)//createElement div
	); // return
    } // render
} // class


// The react component for the whole image gallery
// Most of the code for this is in the included library
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { photos: photos };
    this.selectTile = this.selectTile.bind(this);
  }

  selectTile(event, obj) {
    console.log("in onclick!", obj);
    let photos = this.state.photos;
    photos[obj.index].selected = !photos[obj.index].selected;
    this.setState({ photos: photos });
  }

  render() {
    return (
       React.createElement( Gallery, {photos: this.state.photos,
       onClick: this.selectTile,
       ImageComponent: ImageTile} )
      );
  }
}

/* Finally, we actually run some code */

const reactContainer = document.getElementById("react");
var reactApp = ReactDOM.render(React.createElement(App),reactContainer);

/* Workaround for bug in gallery where it isn't properly arranged at init */
window.dispatchEvent(new Event('resize'));

function updateImages()
{
  document.getElementById("nosearch").style.display = "none";
  var reqIndices = document.getElementById("req-text").value;

  if (!reqIndices) return; // No query? Do nothing!

  // console.log(reqIndices.replace(/,|,/g, "+")[0]);

  var terms = reqIndices.replace(/,|,/g, "+").split("+")
  for(let i = 0; i< terms.length; i++){
    terms[i] = terms[i].trim();
  }

  terms = terms.join("+");

  console.log(terms);

  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/query?keyList=" + terms); // We want more input sanitization than this!
  xhr.addEventListener("load", (evt) => {
    if (xhr.status == 200) {
        reactApp.setState({photos:JSON.parse(xhr.responseText)});
        window.dispatchEvent(new Event('resize')); /* The world is held together with duct tape */
    } else {
        console.log("XHR Error!", xhr.responseText);
    }
  } );
  xhr.send();
}
