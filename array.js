// function arrayContainsArray (superset, subset) {
//   if (0 === subset.length) {
//     return false;
//   }
//   return subset.every(function (value) {
//     return (superset.indexOf(value) >= 0);
//   });
// }

// var sub = ['a','b','c','d'];
// var sup = ['b','c','d','a'];

// console.log(sub);
// console.log(sup);

// console.log(arrayContainsArray(sub, sup));


function delete_tag_from_array(tag, array) {
  var index = array.indexOf(tag);
  if (index > -1) {
    array.splice(index, 1);
  }
}


var del = 'mountain';
var arr = ['tree', 'mountain', 'sky', 'apple'];


delete_tag_from_array(del, arr);
console.log(arr);