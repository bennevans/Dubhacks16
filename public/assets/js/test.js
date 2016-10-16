var app = new Clarifai.App(
  '2uTO6-WWfa6w-xgQHGsstkltLnzCmkseYQfzlv7O',
  'QiCvvZcc_Nms65D2VSBZCqqG4xHscOpogE7eWOKv'
);

window.onload = function() {
  predictTest();
  // var category = data.split("|")[0];
  // var type = data.split("|")[1];
  // console.log(category);
  // console.log(type);
};

var numClothes = 50;
var refCats = ["shirts","bottoms","outerwear"];
var refItems = [["ssleeve","polo","lbutton","lsleeve","sbutton","tanks.dat"],
   ["chino","jeans","shorts"],
   ["djacket","hjacket","hoodies","ljacket","sweaters"]];

function processImages() {
  for(var i = 0; i < numClothes; i++) {
    var clothing = document.createElement("img");
    clothing.id = i;
    clothing.className = "clothes";
    clothing.setAttribute("src",i + ".jpg");

    var canvas = document.createElement("canvas");
    canvas.width = clothing.width; 
    canvas.height = clothing.height; 
    var ctx = canvas.getContext("2d"); 
    ctx.drawImage(clothing, 0, 0); 
    var dataURL = canvas.toDataURL(i + ".jpg");
    alert("from getbase64 function"+dataURL );   

    var data = predict(clothesModel, dataURL); 
    var category = data.split("|")[0];
    var type = data.split("|")[1];

    clothing.id = type;
  }
}

function predictTest() {
  app.models.predict("clothes-v1", 'http://pukkaind.biz/images/categories/16Wool%20varsity%20Letterman%20jacket%20Royal-white.jpg').then(
    function(response) {
      var clothes = response.data.outputs[0].data.concepts;
      if (clothes[0].value < 0.1) {
        return "fail|fail";
      }

      var info = "";
      var categories = [];
      var types = [];

      //Sort into two arrays
      for (var i = 0; i < clothes.length; i++) {
        var value = clothes[i].value;
        var id = clothes[i].id;
        var index = refCats.indexOf(id);
        console.log(id);
        console.log(value);
        if(index != -1 && value >= 0.1) {
          categories.push(id);
        }
        else if (index == -1 && value >= 0.1){
          types.push(id);
        }
      }
      //No categories fit
      console.log("hi");
      console.log(categories);
      console.log(types);
      if (categories.length == 0) {
        return "fail|fail";
      }
      else {
        info = categories[0];
        var index = refCats.indexOf(info);
        //check the greatest type that is in the same category
        for (var i = 0; i < types.length; i++) {
          var found = false;
          if (refItems[index].indexOf(types[i]) != -1) {
            info += "|" + types[i];
            found = true;
            break;
          }
        }
        if (found == false) {
          info += "|fail";
        }
      }
      console.log(info);
      return info;
      
    },
    function(err) {
      console.error(err);
      console.log("error");
    }
  );
}
// function getBase64Image(){     
//     p=document.getElementById("fileUpload").value;
//     img1.setAttribute('src', p); 
//     canvas.width = img1.width; 
//     canvas.height = img1.height; 
//     var ctx = canvas.getContext("2d"); 
//     ctx.drawImage(img1, 0, 0); 
//     var dataURL = canvas.toDataURL("image/png");
//     alert("from getbase64 function"+dataURL );    
//     return dataURL;
// } 

function predict(clothesModel, imgBase64) {
  app.models.predict(clothesModel, {base64: imgBase64}).then(
    function(response) {
      // do something with response
    },
    function(err) {
      // there was an error
    }
  );
}