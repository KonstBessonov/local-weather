var temperatureUnits = localStorage.getItem("temperatureUnits") || "C";
var showRawData = localStorage.getItem("showRawData"); //  || false

$(document).ready(function() {
    if(navigator.geolocation) {
        getLocalWeather();
        $("#temp-units").click(changeTempUnits);
        $("#show-raw-data").click(toggleRawData);
    } else {    
        $("#weather-data").text("Sorry. Navigation is NOT supported in your browser!");
    }
});

function changeTempUnits() {
    temperatureUnits = temperatureUnits == "C" ? "F" : "C";
    localStorage.setItem("temperatureUnits", temperatureUnits);
    getLocalWeather();
}

function toggleRawData() {
    showRawData = !showRawData;
    localStorage.setItem("showRawData", showRawData);
    getLocalWeather();
}

function getLocalWeather() {
    getPosition()
        .then(getWeatherData)
        .then(showWeatherData)
        .catch(catchError);
}

function getPosition() {
    return new Promise(function(resolve, reject) {
        navigator.geolocation.getCurrentPosition(function(position) {
            resolve([position.coords.latitude, position.coords.longitude]);
        }, function(err) {
            reject(err.message);
        });
    });
}

function getWeatherData(coords) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: "https://fcc-weather-api.glitch.me/api/current?lat="+coords[0]+"&lon="+coords[1],
            success: function(data) {
                resolve(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                reject("Failed to get weather data: "+textStatus+" "+errorThrown);
            }

        });
    });
}

function showWeatherData(data) {
    $("#city-name").text(data.name+", "+data.sys.country);
    $("#current-temp").text(convertTemperature(data.main.temp, temperatureUnits));
    $("#temp-units").text(temperatureUnits);
    $("#current-humi").text(data.main.humidity);
    $("#weather-cond").text(data.weather[0].main);
    $("#weather-cond-img").attr("src", data.weather[0].icon);
    $("#weather-cond-img").attr("alt", data.weather[0].description);
    $("#current-wind").html(data.wind.speed+" m/s "+", "+data.wind.deg+"&deg; ("+describeDirection(data.wind.deg)+")");
    $("#sunrise-time").text(timestampToTimeString(data.sys.sunrise));
    $("#sunset-time").text(timestampToTimeString(data.sys.sunset));

    $("#raw-weather-data").text(showRawData ? JSON.stringify(data) : "");
}

function catchError(err) {
    $("#weather-data").text(err);
}

function convertTemperature(tempInC, toUnits) {
    return toUnits == "C" ? tempInC : tempInC*1.8+32;
}

function describeDirection(dir) {
    var rhumbs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return rhumbs[Math.floor((dir+11.25)%360/22.5)];
}

function timestampToTimeString(timestamp) {
    var d = new Date(timestamp*1000);
    return d.toLocaleTimeString();
}