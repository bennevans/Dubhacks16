var app = new Clarifai.App(
  '2uTO6-WWfa6w-xgQHGsstkltLnzCmkseYQfzlv7O',
  'QiCvvZcc_Nms65D2VSBZCqqG4xHscOpogE7eWOKv'
);
var weather;
var currentPrediction = "fail";
var closet = [];
var refCats = ["shirts","bottoms","outerwear"];
var refItems = [["ssleeve","polo","lbutton","lsleeve","sbutton","tanks.dat"],
   ["chino","jeans","shorts"],
   ["djacket","hjacket","hoodies","ljacket","sweaters"]];
var numClothes = 14;
var outfit;

window.onload = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showLocation);
    } else {
        alert('It seems like Geolocation, which is required for this page,' +
            ' is not enabled in your browser.' +
            ' Please use a browser which supports it.');
    }
    processImages();
};

function fetchData(lat, long) {
  $.ajax({
        url: "https://api.weatherunlocked.com/api/forecast/" + lat + "," + long + "?app_id=1b974b48&app_key=1dc38da7b1d536c9fe9f3ff4e3703ebe",
        data: {
           format: 'json'
        },
        success: function (data) {
            getOutput(data);
        },
        error: function() {
           $('#info').html('<p>An error has occurred</p>');
        },
        type: 'GET'
    });
}


function showLocation(position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;

    lat = (lat * 1000) / 1000;
    long = (long * 1000) / 1000;

    fetchData(lat, long);
}

function predict(clothesModel, imgBase64, id, modifiedColor) {
  var info;
  app.models.predict(clothesModel, imgBase64, id, modifiedColor).then(
    function(response) {
      var data = predictCore(response);
      var category = data.split("|")[0];
      var type = data.split("|")[1];
      currentPrediction = type;
      closet.push([type, modifiedColor, id]);
    },
    function(err) {
      // there was an error
      console.error('error: ' + err.message);
    }
  );
}

function predictCore(response) {
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
      if(index != -1 && value >= 0.1) {
        categories.push(id);
      }
      else if (index == -1 && value >= 0.1){
        types.push(id);
      }
    }
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
    return info;
}

function processImages() {
  for(var i = 0; i < numClothes; i++) {
    var filename = "assets/img/" + i + ".png";
    //predict(clothesModel, filename);
    getCloset(filename);
  }
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

//Function to convert HEX to RGB
function hex2rgb( colour ) {
  var r,g,b;
  if ( colour.charAt(0) == '#' ) {
    colour = colour.substr(1);
  }

  r = colour.charAt(0) + colour.charAt(1);
  g = colour.charAt(2) + colour.charAt(3);
  b = colour.charAt(4) + colour.charAt(5);

  r = parseInt( r,16 );
  g = parseInt( g,16 );
  b = parseInt( b ,16);
  return r+','+g+','+b;
}

function getCloset(source) {
  var colorThief = new ColorThief();
  var myImage = new Image(400,400);
  myImage.src = source;
  myImage.onload = function() {
    var color = rgbToHex(colorThief.getColor(myImage)[0],colorThief.getColor(myImage)[1],colorThief.getColor(myImage)[2]);
    var base_colors=["5F444A","B5444A","66685B","3F454E","000000","6B494B","f44242","6d0202","f29d9d","ff7b00","d6a82a","5a6d0f",
                    "58d18e","1abfe0","6b84ef","a4d7d8","273e6b","6f46a8","9487db","330770","efa0eb","a31351","93a354","f5f5dc",
                    "98cec2", "f5f5dc"];

    //Convert to RGB, then R, G, B
    var color_rgb = hex2rgb(color);
    var color_r = color_rgb.split(',')[0];
    var color_g = color_rgb.split(',')[1];
    var color_b = color_rgb.split(',')[2];

    //Create an emtyp array for the difference betwwen the colors
    var differenceArray=[];

    //Function to find the smallest value in an array
    Array.min = function( array ){
           return Math.min.apply( Math, array );
    };

    //Convert the HEX color in the array to RGB colors, split them up to R-G-B, then find out the difference between the "color" and the colors in the array
    $.each(base_colors, function(index, value) {
      var base_color_rgb = hex2rgb(value);
      var base_colors_r = base_color_rgb.split(',')[0];
      var base_colors_g = base_color_rgb.split(',')[1];
      var base_colors_b = base_color_rgb.split(',')[2];

      //Add the difference to the differenceArray
      differenceArray.push(Math.sqrt((color_r-base_colors_r)*(color_r-base_colors_r)+(color_g-base_colors_g)*(color_g-base_colors_g)+(color_b-base_colors_b)*(color_b-base_colors_b)));
    });

    //Get the lowest number from the differenceArray
    var lowest = Array.min(differenceArray);

    //Get the index for that lowest number
    var index = differenceArray.indexOf(lowest);

    //Bumm, here is the closest color from the array
    var modifiedColor = base_colors[index];
    predict('clothes-v2', 'https://students.washington.edu/akash221/public/' + source, source, modifiedColor);
  }
}

function getOutput(data) {
  weather = data;
  var date = new Date();
  var hour = Math.floor(date.getHours() / 3);
  var description = weather.Days[1].Timeframes[hour].wx_desc;
  var temp = weather.Days[1].Timeframes[hour].temp_f;
  var rain = (weather.Days[1].Timeframes[hour].prob_precip_pct > 25);

  var summerNoRain = [["ssleeve", "shorts"]];
  var chillyRain   = [["ssleeve", "chino", "hjacket"], ["ssleeve", "jeans", "hacket"]];
  var chillyNoRain = [["ssleeve", "chino"], ["ssleeve", "jeans"]];
  var coldRain     = [["hoodies", "hjacket", "chino"], ["hoodies", "hjacket", "jeans"], ["lsleeve", "hjacket", "chino"], ["lsleeve", "hjacket", "jeans"]];
  var coldNoRain   = [["ssleeve", "hoodies", "chino"], ["ssleeve", "hoodies", "jeans"]];
  var vColdRain    = [["hoodies", "hjacket", "chino"], ["hoodies", "hjacket", "jeans"], ["lsleeve", "hjacket", "chino"], ["lsleeve", "hjacket", "jeans"]];
  var vColdNoRain  = [["hoodies", "hjacket", "chino"],["hoodies", "hjacket", "jeans"],
                      ["lsleeve", "hjacket", "chino"], ["lsleeve", "hjacket", "jeans"]];

  var typeOfWeather;
  var weatherImage;
  switch (true) {
      case (temp >= 90):
          if(rain) {
            typeOfWeather = summerRain;
            weatherImage = "raining.png";
          } else {
            typeOfWeather = summerNoRain;
            weatherImage = "sunny.png";
          }
          break;
      case (temp >= 70 && temp < 90):
          if(rain) {
            typeOfWeather = chillyRain;
            weatherImage = "raining.png";
          } else {
            typeOfWeather = chillyNoRain;
            weatherImage = "cloudy.png"
          }
          break;
      case (temp >= 60 && temp < 70):
          if(rain) {
            typeOfWeather = coldRain;
            weatherImage = "raining.png";
          } else {
            typeOfWeather = coldNoRain;
            weatherImage = "cloudy.png"
          }
          break;
      case (temp < 60):
          if(rain) {
            typeOfWeather = vColdRain;
            weatherImage = "raining.png"
          } else {
            typeOfWeather = vColdNoRain;
            weatherImage = "cloudy.png"
          }
          break;
      default:
          alert("illegal temp");
          break;
  }

  var randNum = Math.floor((Math.random() * typeOfWeather.length) + 1);
  outfit = typeOfWeather[randNum];
  var finalColor;

  document.getElementById("weather-icon").src = "assets/img/weather/" + weatherImage;
  document.getElementById('weather-description').innerHTML = description;
  document.getElementById('temp').innerHTML = temp + "F";
  setTimeout(function() {getOutfitGrid(outfit)}, 5000);
  console.log("Hour: " + hour + " Description: " + description + " Temp: " + temp + " Rain: " + rain + " Oufit: " + outfit);

}

// You should wear a <span style="color: red">red shirt</span>, <span style="color: green">green sweater</span> and <span style="color:navy">navy pants</span>.
function getOutfitGrid(outfit) {
  // one -> hoodie, jacket, pants
  // one -> shirt, hoodie, pants
  // two -> shirt, hoodie, shorts
  // three -> shirt, pants
  // four -> shirt, short
  var size  = outfit.length;
  var closetSize = closet.length;
  var template;

  var color = [];
  var url = [];
  for (var i = 0; i < size; i++) {
    var type = outfit[i];
    for (var j = 0; j < closetSize; j++) {
      console.log("Closet Choice: " + closet[j][0] + " Type: " + type);
      if (closet[j][0] == type) {
        color[i] = closet[j][1];
        url[i] = closet[j][2];
        break;
      }
    }
  }

  console.log("Color: " + color);
  console.log("URL: " + url);


  var map = {"lsleeve":"Long Sleeve", "ssleeve": "Short Sleeve", "hjacket": "Light Jacket", "chino":"Chino", "hoodies":"Hooide"
             ,"jeans":"Jeans"};

  if (size == 2) {
    if (outfit.indexOf('shorts') > -1) {
      template = "<div class = 'clothing' id = 'shirt' style = 'background-image: url(" + url[0] +");'></div><div class = 'clothing' id = 'pants' style = 'background-image: url(" + url[1] +");'></div>";
    } else {
      template = "<div class = 'clothing' style = 'background-image: url(" + url[0] +");'></div><div class = 'clothing' style = 'background-image: url(" + url[0] + ");'></div>";
    }
    document.getElementById('what-to-wear').innerHTML = "You should wear a <span style=color:#" + color[0] +">" + map[outfit[0]] + "</span> and <span style=color:#" + color[1] + ">" + map[outfit[1]] + "</span>."
  } else {
    if (outfit.indexOf('shorts') > -1) {
      template = "<div class = 'clothing' style = 'background-image: url(" + url[1] +");'></div><div class = 'bot-top-contain'><div class = 'bot-top' style = 'background-image: url(" + url[0] +");'></div><div class = 'bot-top' style = 'background-image: url(" + url[2] +");'></div></div>";
    } else {
      template = "<div class = 'bot-top-contain'><div class = 'bot-top' style = 'background-image: url(" + url[1] + ");'></div><div class = 'bot-top' style = 'background-image: url(" + url[0] +");'></div></div><div class = 'side-clothing' style = 'background-image: url(" + url[2] +");'></div>";
    }
    document.getElementById('what-to-wear').innerHTML = "You should wear a <span style=color:#" + color[0] +">" + map[outfit[0]] + "</span>, <span style=color:#" + color[1] +">" + map[outfit[1]] + "</span> and <span style=color:#" + color[2] +">" + map[outfit[2]] + "</span>."
  }

  document.getElementById('template-wrapper').innerHTML = template;
}
