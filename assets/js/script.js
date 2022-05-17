var currentWeather = {
    temp: document.getElementById("temp"),
    wind: document.getElementById("wind"),
    humidity: document.getElementById("humid"),
    uv: document.getElementById("uv"),
    icon: document.getElementById("icon")};
var forecastWeather = {
    temp: document.querySelectorAll("#forecast-temp"),
    wind: document.querySelectorAll("#forecast-wind"),
    humidity: document.querySelectorAll("#forecast-humid"),
    uv: document.querySelectorAll("#forecast-uv")};
var searchButton = document.getElementById("search-submit");
var searchHistoryContainer = document.getElementById("search-history");

var debugArray = ["Pittsburgh", "Sultan", "Kent", "Maryland", "Miami", "Baltimore", "Seattle"]
var debugArraySelector = 0;

init();

searchButton.addEventListener("click", getSearch);

function getSearch(){
    var searchInput = document.getElementById("search").value;
    
    if(!searchInput.value){
        searchInput = debugArray[debugArraySelector];
        debugArraySelector++;
        console.log(searchInput);
    }

    var geoUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=' + searchInput + '&limit=20&appid=4c4c59402058e94a485f056d3960bb7a';

    fetch(geoUrl)
    .then(function(response){
        if(response.ok){
            return response.json();
        } else {
            alert('Error: ' + response.statusText);
            return;
        }
    })
    .then(function(data){
        var cityLat = data[0].lat;
        var cityLon = data[0].lon;
        var cityName = document.getElementById("city-name");

        cityName.textContent = data[0].name;   

        getWeather(cityLat, cityLon);
        storeSearch(cityName);
    });
};

function getWeather(cityLat, cityLon){
    var weatherUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + cityLat + '&lon=' + cityLon + '&appid=4c4c59402058e94a485f056d3960bb7a'

    fetch(weatherUrl)
    .then(function(response){
        return response.json();
    })
    .then(function(weatherData){
        renderWeather(weatherData);
    })
}

function renderWeather(weatherData){
    currentWeather.temp.textContent = Math.trunc(1.8*(weatherData.current.temp-273) + 32) + '°';
    currentWeather.wind.textContent = weatherData.current.wind_speed + " mph";
    currentWeather.humidity.textContent = weatherData.current.humidity + "%";
    currentWeather.uv.textContent = weatherData.current.uvi;
    currentWeather.icon.setAttribute("src", 
      "http://openweathermap.org/img/wn/" + weatherData.current.weather[0].icon + '.png')

    for(i = 0; i < 5; i++) {  
        forecastWeather.temp[i].textContent = Math.trunc(1.8*(weatherData.daily[i].temp.day-273) + 32) + '°';
        forecastWeather.wind[i].textContent = weatherData.daily[i].wind_speed + " mph";
        forecastWeather.humidity[i].textContent = weatherData.daily[i].humidity + "%";
        forecastWeather.uv[i].textContent = weatherData.daily[i].uvi;
    }
}


function storeSearch(cityName){
    var storedHistory = document.querySelectorAll("#history-item");
    var historyItem = document.createElement('li');
    var searchInput = document.getElementById("search");

    historyItem.setAttribute("id", "history-item");
    historyItem.innerHTML = cityName.textContent;
    searchHistoryContainer.prepend(historyItem);

    if(storedHistory.length > 5){
        storedHistory = document.querySelectorAll("#history-item");
        storedHistory[6].remove();

        localStorage.setItem(5, cityName.textContent);
        for(i = 4, x = 1; i > -1; i--, x++){
            localStorage.setItem([i], storedHistory[x].textContent);
        }
        localStorage.removeItem(localStorage.key(6));
    } else {
        localStorage.setItem(JSON.parse(storedHistory.length), cityName.textContent);
    }
    searchInput.value = "";
};


function renderHistory(){

}

function init(){
    if(!localStorage){
        return;
    } else {
        renderHistory();
    }
}