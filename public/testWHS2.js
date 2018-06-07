/* This array is just for testing purposes.  You will need to
   get the real image data using an AJAX query. */
var photos = [];

function delete_tag_from_array(tag, array) {
  var index = array.indexOf(tag);
  if (index > -1) {
    array.splice(index, 1);
  }
}

//testWHS2.js
function getSuggestedTags()
{
  let input = document.getElementById('req-text');
  let text = input.value;

  if ( text.length <= 1
    || ( getSuggestedTags.calls !== undefined && 1 < getSuggestedTags.calls+1 )
  )
  {
    return;//do nothing
  }

  if ( getSuggestedTags.calls === undefined )
  {
    getSuggestedTags.calls = 1;
  }

  let tagTable = {};

  let request = new XMLHttpRequest();
  request.open('GET', '/query?autocomplete=' + text);
  request.addEventListener(
    'load',
    function(){//callback function
      tagTable = JSON.parse(request.responseText);
    }
  );
  request.send();
}

// A react component for a tag
class Tag extends React.Component {

  render() {
    var parentupdate = this.props.parentupdate;
    let parent = this.props.parent;
    return React.createElement('div', {
        className: 'tagdiv',
        onClick: (event) => {
          var oReq = new XMLHttpRequest();
          oReq.open("GET", "delete?key=" + this.props.parentImage + "~tag=" + this.props.text);
          oReq.addEventListener("load", fnCallback);
          oReq.send();

          function fnCallback(err) {}

          // alert("New tags: " + this.props.parentImage);
          parent.removeTag(this.props.text);
          event.stopPropagation();
          // console.log(this.props);
        }
      },
      React.createElement('p', {
        className: 'tagText'
      }, this.props.text));
    // contents
  }
};

// A react component for a tag
class Input extends React.Component {
  constructor() {
		super();
		this.handleChange = this.handleChange.bind(this);
		this.state = {
			content_add: "",
			width: 100,
			myItems: [],
		};
		this.lastId = -1;
	}
  handleChange(event) {
		const usr_input = event.target.value;
		this.setState({ content_add: usr_input });
	}
  render() {
    return React.createElement(
      "div",
      {className: 'inputdiv'},
      React.createElement("input", {
        id: "add",
        type: "text",
        className: "inputtext",
        onChange: this.handleChange,
        value: this.state.content_add,
        onClick: (event) => {
          event.stopPropagation();
        }
      }),
      React.createElement("button", {
        className: 'addbutton',
        label:'+',
        onClick: (event) => {
            var oReq = new XMLHttpRequest();
            var input = this.state.content_add;
            let parent = this.props.parent;
            oReq.open("GET", "insert?key=" + this.props.parentImage + "~tag=" + input);
            oReq.addEventListener("load", fnCallback);
            oReq.send();
            function fnCallback(err) {
              // no need to do anything here
            }
            // console.log(input);
            // console.log(this.props);
            if(this.state.content_add!='')
              parent.addTag(this.state.content_add);
            event.stopPropagation();

          },
      }, '+')
    );
	}
};


class TileControl extends React.Component {
  removeTag(tagname) {
    var proptag = this.props.src.tags;
    var tag_list = this.props.src.tags;
    delete_tag_from_array(tagname, tag_list);
    this.setState({
      proptag: proptag
    });
  }

  addTag(tagname) {
    var proptag = this.props.src.tags;
    proptag.push(tagname);
    console.log(proptag);
    this.setState({
      proptag: proptag
    });
  }

  render() {
    var _selected = this.props.selected;
    var the_tags = this.props.src.tags;

    var name = this.props.src.src;
    var args = [];
    args.push('div');
    args.push({
      className: _selected ? 'selectedControls' : 'normalControls'
    })
    for (var idx = 0; idx < the_tags.length; idx++)
      args.push(React.createElement(Tag, {
        text: the_tags[idx],
        parentImage: name,
        parent: this
      }));

    // add input box here
    if(the_tags.length<6){
      args.push( React.createElement(Input, {
        value: "",
        parentImage: name,
        parent: this
      }));
    }
    return (React.createElement.apply(null, args));
  }
};

// A react component for an image tile
class ImageTile extends React.Component {

  render() {
    // onClick function needs to remember these as a closure
    var _onClick = this.props.onClick;
    var _index = this.props.index;
    var _photo = this.props.photo;
    var _selected = _photo.selected; // this one is just for readability

    return (
      React.createElement('div', {
          style: {
            margin: this.props.margin,
            width: _photo.width
          },
          className: 'tile',
          onClick: function onClick(e) {
            console.log("tile onclick");
            // call Gallery's onclick
            return _onClick(e, {
              index: _index,
              photo: _photo
            })
          }
        }, // end of props of div
        // contents of div - the Controls and an Image
        React.createElement(TileControl, {
          selected: _selected,
          src: _photo
        }),
        React.createElement('img', {
          className: _selected ? 'selected' : 'normal',
          src: _photo.src,
          width: _photo.width,
          height: _photo.height
        })
      ) //createElement div
    ); // return
  } // render
} // class


// The react component for the whole image gallery
// Most of the code for this is in the included library
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      photos: photos
    };
    this.selectTile = this.selectTile.bind(this);
  }

  selectTile(event, obj) {
    console.log("in onclick!", obj);
    let photos = this.state.photos;
    photos[obj.index].selected = !photos[obj.index].selected;
    this.setState({
      photos: photos
    });
  }

  render() {
    return (
      React.createElement(Gallery, {
        photos: this.state.photos,
        onClick: this.selectTile,
        ImageComponent: ImageTile
      })
    );
  }
}

/* Finally, we actually run some code */

const reactContainer = document.getElementById("react");
var reactApp = ReactDOM.render(React.createElement(App), reactContainer);

/* Workaround for bug in gallery where it isn't properly arranged at init */
window.dispatchEvent(new Event('resize'));

function updateImages() {
  document.getElementById("nosearch").style.display = "none";
  var reqIndices = document.getElementById("req-text").value;

  if (!reqIndices) return; // No query? Do nothing!

  var terms = reqIndices.replace(/,|,/g, "+").split("+")
  for (let i = 0; i < terms.length; i++) {
    terms[i] = terms[i].trim();
  }

  terms = terms.join("+");

  console.log(terms);

  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/query?keyList=" + terms); // We want more input sanitization than this!
  xhr.addEventListener("load", (evt) => {
    if (xhr.status == 200) {
      reactApp.setState({
        photos: JSON.parse(xhr.responseText)
      });
      window.dispatchEvent(new Event('resize')); /* The world is held together with duct tape */
    } else {
      console.log("XHR Error!", xhr.responseText);
    }
  });
  xhr.send();
}
