var weather;

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
            getWeather(data);
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

function getWeather(data) {
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

  console.log(" Description: " + description + " Temp: " + temp + " Rain: " + rain + " Oufit: " + outfit);
}
