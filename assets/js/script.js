$("#current-date").text(moment().format("MM/DD/YYYY"));
var forecastDate = document.querySelectorAll("#forecast-date");

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

// Debug array to search without typing
// var debugArray = ["Pittsburgh", "Sultan", "Kent", "Maryland", "Miami", "Baltimore", "Seattle", "New York", "Everett", "Bothell"]
// var debugArraySelector = 0;

init();

searchButton.addEventListener("click", getSearch);

function getSearch(){
    var searchInput = document.getElementById("search").value;
    

    // Debug conditional
    // if(!searchInput.value){
    //     searchInput = debugArray[debugArraySelector];
    //     debugArraySelector++;
    //     console.log(searchInput);
    // }

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

// Get weather data from returned latitude and longitude
function getWeather(cityLat, cityLon){
    var weatherUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + cityLat + '&lon=' + cityLon + '&appid=4c4c59402058e94a485f056d3960bb7a'

    fetch(weatherUrl)
    .then(function(response){
        return response.json();
    })
    .then(function(weatherData){
        renderWeather(weatherData);
    })
};

// Create a history button for last search
function storeSearch(cityName){
    var storedHistory = document.querySelectorAll("#history-item");
    var historyItem = document.createElement('li');
    var searchInput = document.getElementById("search");
    var searchHistoryContainer = document.getElementById("search-history");
    historyItem.setAttribute("id", "history-item");
    historyItem.innerHTML = cityName.textContent;
    searchHistoryContainer.prepend(historyItem);

    // Search selected city if clicked
    historyItem.addEventListener("click", function() {
        var searchInput = document.getElementById("search");
    
        searchInput.value = this.textContent;
        getSearch();
    });

    // Delete the 6th item on the list and scroll everything down
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



function renderWeather(weatherData){
    // Set moment time zone based on weatherData
    timezone = weatherData.timezone;
    renderDates(timezone);

    currentWeather.temp.textContent = Math.trunc(1.8*(weatherData.current.temp-273) + 32) + '°';
    currentWeather.wind.textContent = weatherData.current.wind_speed + " mph";
    currentWeather.humidity.textContent = weatherData.current.humidity + "%";
    currentWeather.uv.textContent = weatherData.current.uvi;

    // Set UV background color depending on current UVI
    if(weatherData.current.uvi >= 7){
        document.getElementById("uv").style.background = "#ff0000";
    } else if(weatherData.current.uvi >= 3){
        document.getElementById("uv").style.background = "#fbff00";
    } else {
        document.getElementById("uv").style.background = "#008000";
    }
    // Add current weather icon
    currentWeather.icon.setAttribute("src", 
      "http://openweathermap.org/img/wn/" + weatherData.current.weather[0].icon + '.png')

    // Fill in forecast cards based on day selected from data
    for(i = 0; i < 5; i++) {  
        forecastWeather.temp[i].textContent = Math.trunc(1.8*(weatherData.daily[i].temp.day-273) + 32) + '°';
        forecastWeather.wind[i].textContent = weatherData.daily[i].wind_speed + " mph";
        forecastWeather.humidity[i].textContent = weatherData.daily[i].humidity + "%";
        forecastWeather.uv[i].textContent = weatherData.daily[i].uvi;
    }
};

// Render forecast dates based on current timezone
function renderDates(){
    for(i = 0; i < forecastDate.length; i++) {
        var futureDate = moment().add(i + 1, 'days');
        forecastDate[i].textContent = futureDate.format("MM/DD/YYYY", timezone);
    }
}


// Render search history buttons based on local storage, add click event listener for each one
function renderHistory(){
    var searchHistoryContainer = document.getElementById("search-history");
    for(i = 0; i < localStorage.length; i++){
        var cityName = localStorage.getItem(localStorage.key(i));
        var historyItem = document.createElement('li');
        historyItem.setAttribute("id", "history-item");
        historyItem.textContent = cityName;
        searchHistoryContainer.prepend(historyItem);

        historyItem.addEventListener("click", function() {
            var searchInput = document.getElementById("search");
        
            searchInput.value = this.textContent;
            getSearch();
        });
    }
    return;
}

function init(){
    renderHistory();

    // // Clear localStorage for debugging
    // localStorage.clear();
}