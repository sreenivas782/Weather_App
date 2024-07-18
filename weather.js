document.addEventListener('DOMContentLoaded', function() {   // the loadRecentCities function is called as soon as the HTML document completely loaded.
    loadRecentCities();    
});      

const cityInputs = document.getElementById("inputs");
const buttonS = document.getElementById("btn-1S");
const buttonL = document.getElementById("btn-2L");

const city = document.getElementById("city");
const temp = document.getElementById("temp");
const humd = document.getElementById("humd");
const wind = document.getElementById("wind");
const icon = document.getElementById("icon-area");
const des = document.getElementById("des");
const date = document.getElementById("date");
const forecastContainer = document.getElementById("forecast");

buttonS.addEventListener("click", disWeather);   // When user click on search button disWeather function will call

const apiKey = "cb699b250ef980d5bea649f753ba2844"; // this apikey provided by Open-weather-maps website

function disWeather() {                         // this is disWeather to display current day weather
    const cityName = cityInputs.value.trim();                      
    if (cityName === "") {
        alert("Please enter a city name.");
    } else if (!isNaN(cityName) || cityName.toLowerCase() === 'undefined') { // if user enter numbers or undefined values in input box provide alert box saying please enter correct city name
        alert("Please enter a valid city name.");
    } else {
        let now = new Date();
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`; // this is url provided by Open-weather-maps website
        fetch(url)
            .then(res => res.json())
            .then(result => {
                if (result.cod === 200) {
                    console.log(result);
                    city.innerHTML = result.name;
                    date.innerHTML = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`; // to get date/month/year
                    temp.innerHTML = Math.floor(result.main.temp - 273.15) + ' °C'; // this will convert to Celsius
                    wind.innerHTML = result.wind.speed + ' m/s';  // this is to get wind speed from api
                    humd.innerHTML = result.main.humidity + ' %'; // this is to get humidity from api
                    let iconCode = result.weather[0].icon;                     // this is to get weather icon
                    let iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;
                    icon.innerHTML = `<img src="${iconUrl}" alt="Weather icon">`;
                    des.innerHTML = result.weather[0].description;

                    cityInputs.value = "";

                    updateRecentCities(result.name); // these lines update the list of recently searched cities with the current city 
                    loadRecentCities();
                    fetchFiveDayForecast(cityName);   // this function will fill-up the five-days forecast section
                } else {
                    alert("City not found. Please enter a valid city name.");
                }
            })
            .catch(error => console.error("ERROR"));
    }
}

buttonL.addEventListener("click", getLocation);  // when user click on use current location this getLocation function will call

function getLocation() {                         // this is to get current-location based on longitude and latitude
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {  // these are JavaScript in-built functions
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            let now = new Date();
            let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`; // api this will call based on longitude and latitude
            fetch(url)
                .then(res => res.json())
                .then(result => {
                    console.log(result);
                    city.innerHTML = result.name;
                    date.innerHTML = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
                    temp.innerHTML = Math.floor(result.main.temp - 273.15) + ' °C';
                    wind.innerHTML = result.wind.speed + ' m/s';
                    humd.innerHTML = result.main.humidity + ' %';
                    let iconCode = result.weather[0].icon;
                    let iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;
                    icon.innerHTML = `<img src="${iconUrl}" alt="Weather icon">`;
                    des.innerHTML = result.weather[0].description;

                    updateRecentCities(result.name); // These lines add the city name to the list of recently searched cities 
                    loadRecentCities();
                    fetchFiveDayForecastByCoords(lat, lon);  // Fetch 5-day forecast by coordinates
                })
                .catch(error => console.error("ERROR"));
        });
    }
}

function fetchFiveDayForecast(city) {
    let url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            displayFiveDayForecast(data);
        })
        .catch(error => console.error("ERROR"));
}

function fetchFiveDayForecastByCoords(lat, lon) {
    let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            displayFiveDayForecast(data);
        })
        .catch(error => console.error("ERROR"));
}

function displayFiveDayForecast(data) {    // this function will fill the five-days forecast section with the weather details
    const dailyData = data.list.filter(entry => entry.dt_txt.includes("12:00:00")); // This line filters the weather forecast data to only include entries where the date and time contain "12:00:00", which represents the daily forecast at noon.
    
    dailyData.forEach((forecast, index) => {
        const dayElement = document.getElementById(`day${index + 1}`); // This line selects the HTML element with the ID corresponding to day1, day2, day3, etc., based on the current index value in the loop (index + 1).
        const forecastDate = dayElement.querySelector(".forecast-date");
        const forecastTemp = dayElement.querySelector(".forecast-temp");
        const forecastHumd = dayElement.querySelector(".forecast-humd");
        const forecastWind = dayElement.querySelector(".forecast-wind");
        const forecastIcon = dayElement.querySelector(".forecast-icon");

        const date = new Date(forecast.dt_txt);
        forecastDate.innerHTML = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        forecastTemp.innerHTML = Math.floor(forecast.main.temp - 273.15) +'°C';
        forecastHumd.innerHTML = forecast.main.humidity + ' %';
        forecastWind.innerHTML = forecast.wind.speed + ' m/s';
        let iconCode = forecast.weather[0].icon;
        let iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;
        forecastIcon.innerHTML = `<img src="${iconUrl}" alt="Weather icon">`;
    });
}

function updateRecentCities(city) {                         // This function manages a list of recently searched cities using local storage.
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!recentCities.includes(city)) {
        recentCities.push(city);
        if (recentCities.length > 5) {
            recentCities.shift();
        }
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }
}

function loadRecentCities() {                                  // this function adds to dropdown menu with the list of recently searched cities stored in local storage
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    const recentCitiesSelect = document.getElementById('recentCitiesSelect');
    recentCitiesSelect.innerHTML = '<option value="">Recent Cities</option>';
    recentCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        recentCitiesSelect.appendChild(option);
    });
}

function selectRecentCity(selectElement) {                  // this function handles the event when a user selects a city from the dropdown menu of recent cities.
    const selectedCity = selectElement.value;
    if (selectedCity) {
        cityInputs.value = selectedCity;
        disWeather();
    }
}


