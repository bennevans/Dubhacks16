var app = new Clarifai.App(
  '2uTO6-WWfa6w-xgQHGsstkltLnzCmkseYQfzlv7O',
  'QiCvvZcc_Nms65D2VSBZCqqG4xHscOpogE7eWOKv'
);

//var model = Clarifai.Models.get("clothes-v1");

var numClothes = 50;

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

app.models.predict("clothes-v1", 'http://images.firetrap.com/images/imgzoom/64/64426291_xxl.jpg').then(
  function(response) {
    var info = JSON.parse(response);
    console.log(info.data);
  },
  function(err) {
    console.error(err);
  }
);
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