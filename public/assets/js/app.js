var app = new Clarifai.App(
  '2uTO6-WWfa6w-xgQHGsstkltLnzCmkseYQfzlv7O',
  'QiCvvZcc_Nms65D2VSBZCqqG4xHscOpogE7eWOKv'
);
var weather;
var currentPrediction = "fail";
var predicitonReady = false;
var closet;
var refCats = ["shirts","bottoms","outerwear"];
var refItems = [["ssleeve","polo","lbutton","lsleeve","sbutton","tanks.dat"],
   ["chino","jeans","shorts"],
   ["djacket","hjacket","hoodies","ljacket","sweaters"]];

window.onload = function() {
    if (navigator.geolocation) {
        console.log("no cookie");
        navigator.geolocation.getCurrentPosition(showLocation);
    } else {
        alert('It seems like Geolocation, which is required for this page,' +
            ' is not enabled in your browser.' +
            ' Please use a browser which supports it.');
    }
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

    console.log("Lat: " + lat + " Long: " + long);

    fetchData(lat, long);
}

function predict(clothesModel, imgBase64) {
  var info;
  predicitonReady = false;
  app.models.predict(clothesModel, imgBase64).then(
    function(response) {
      var data = predictCore(response);
      var category = data.split("|")[0];
      var type = data.split("|")[1];
      currentPrediction = type;
      predicitonReady = true;
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
                    "#98cec2"];

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
    modifiedColor = base_colors[index];
    predict('clothes-v2', 'https://students.washington.edu/akash221/public/' + source);
    while(!predicitonReady){}
    console.log("Type : " + currentPrediction + " Color: " + modifiedColor);

  }
}

function getOutput(data) {
  weather = data;
  var date = new Date();
  var hour = Math.floor(date.getHours() / 3);
  var description = weather.Days[1].Timeframes[hour].wx_desc;
  var temp = weather.Days[1].Timeframes[hour].temp_f;
  var rain = (weather.Days[1].Timeframes[hour].prob_precip_pct > 25);

  var summerNoRain = [["t_shirt_short", "chino", "light_jacket"], ["button_up_short", "chino", "light_jacket"], ["t_shirt_short", "jeans", "light_jacket"],
                      ["button_up_short", "jeans", "light_jacket"]];
  var chillyRain   = [["t_shirt_short", "chino", "light_jacket"], ["button_up_short", "chino", "light_jacket"], ["t_shirt_short", "jean", "light_jacket"],
                    ["button_up_short", "jean", "light_jacket"]];
  var chillyNoRain = [["t_shirt_short", "chino"], ["button_up_short", "chino"], ["t_shirt_short", "jean"], ["button_up_short", "jean"]];
  var coldRain     = [["hoodie", "light_jacket", "chino"], ["hoodie", "light_jacket", "jean"], ["sweater", "light_jacket", "chino"], ["sweater", "light_jacket", "jean"]];
  var coldNoRain   = [["t_shirt_short", "hoodie", "chino"], ["t_shirt_short", "hoodie", "jean"], ["button_up_short", "sweater", "chino"], ["button_up_short", "sweater", "jean"],
                    ["t_shirt_short", "denim_jacket", "chino"], ["t_shirt_short", "denim_jacket", "jean"]];
  var vColdRain    = [["hoodie", "heavy_jacket", "chino"], ["hoodie", "heavy_jacket", "jean"], ["sweater", "heavy_jacket", "chino"], ["sweater", "heavy_jacket", "jean"]];
  var vColdNoRain  = [["hoodie", "denim_jacket", "chino"], ["hoodie", "denim_jacket", "jean"], ["hoodie", "light_jacket", "chino"], ["hoodie", "heavy_jacket", "chino"],
                    ["hoodie", "light_jacket", "jean"], ["hoodie", "heavy_jacket", "jean"], ["sweater", "light_jacket", "chino"], ["sweater", "heavy_jacket", "chino"],
                    ["sweater", "light_jacket", "jean"], ["sweater", "heavy_jacket", "jean"]];

  var typeOfWeather;
  switch (true) {
      case (temp >= 90):
          if(rain) {
            typeOfWeather = summerRain;
          } else {
            typeOfWeather = summerNoRain;
          }
          break;
      case (temp >= 70 && temp < 90):
          if(rain) {
            typeOfWeather = chillyRain;
          } else {
            typeOfWeather = chillyNoRain;
          }
          break;
      case (temp >= 60 && temp < 70):
          if(rain) {
            typeOfWeather = coldRain;
          } else {
            typeOfWeather = coldNoRain;
          }
          break;
      case (temp < 60):
          if(rain) {
            typeOfWeather = vColdRain;
          } else {
            typeOfWeather = vColdNoRain;
          }
          break;
      default:
          alert("illegal temp");
          break;
  }

  var randNum = Math.floor((Math.random() * typeOfWeather.length) + 1);
  var outfit = typeOfWeather[randNum];
  var finalColor;
  getCloset('assets/img/0.jpg');
  console.log("Hour: " + hour + " Description: " + description + " Temp: " + temp + " Rain: " + rain + " Oufit: " + outfit);
}
