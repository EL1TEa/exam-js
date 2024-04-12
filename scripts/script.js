const apiKey = "01d73ec098c7fbad35f2023e1e1c62bf";
const searchInput = document.getElementById("search");
const todaySection = document.getElementById("today");
const fiveDaySection = document.getElementById("five-days");
const errorSection = document.getElementById("error");

let flag = "";

document.addEventListener("DOMContentLoaded", () => {
  const headerMenu = document.getElementById("header__menu");
  searchInput.addEventListener("change", handleSearch);
  headerMenu.addEventListener("click", handleTabClick);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(handleGeolocation, handleGeolocationError);
  } else {
    getDefaultWeather();
  }
  showTodayTab();
});

function handleTabClick(event) {
  const clickedElement = event.target;
  const menuLink = clickedElement.closest(".menu__item");
  if (menuLink) {
    event.preventDefault();
    const tabId = menuLink.querySelector(".menu__link").dataset.name;

    if (tabId === "today") {
      showTodayTab();
    } else if (tabId === "five-days") {
      showFiveDayTab();
    }
  }
}

function handleGeolocation(position) {
  const { latitude, longitude } = position.coords;
  getWeatherByCoordinates(latitude, longitude);
}

function handleGeolocationError() {
  getDefaultWeather();
}

function getDefaultWeather() {
  const defaultCity = "Kyiv";
  getWeatherByCity(defaultCity);
}

function handleSearch() {
  const city = searchInput.value;
  getWeatherByCity(city);
}

function getWeatherByCoordinates(latitude, longitude) {
  // by coordinates
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
  const hourlyForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

  flag = "currentWeather";
  getWeather(currentWeatherUrl, flag);
  flag = "hourlyForecast";
  getWeather(hourlyForecastUrl, flag);
}

function getWeatherByCity(city) {
  // by city
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const hourlyForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  flag = "currentWeather";
  getWeather(currentWeatherUrl, flag);
  flag = "hourlyForecast";
  getWeather(hourlyForecastUrl, flag);
}

function showTodayTab() {
  todaySection.style.display = "flex";
  fiveDaySection.style.display = "none";
  errorSection.style.display = "none";
}

function showFiveDayTab() {
  todaySection.style.display = "none";
  fiveDaySection.style.display = "flex";
  errorSection.style.display = "none";
}

function getWeatherByCityNearest(latitude, longitude) {
  const currentWeatherNearest = `https://api.openweathermap.org/data/2.5/find?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

  fetch(currentWeatherNearest)
    .then((response) => response.json())
    .then((data) => {
      createNearbyCities(data);
    })
    .catch((error) => {
      showError();
      console.error("Error:", error);
    });
}

function getWeather(apiUrl, flag) {
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      updatePage(data, flag);
    })
    .catch((error) => {
      showError();
      console.error("Error:", error);
    });
}

function updatePage(data, flag) {
  if (data.status === "404") {
    showError();
  } else {
    if (flag === "hourlyForecast") {
      updateFiveDayTab(data);
    }
    updateTodayTab(data, flag);
  }
}

function updateTodayTab(data, flag) {
  if (flag === "currentWeather") {
    createShortInfo(data);
    searchInput.placeholder = data.name;
    getWeatherByCityNearest(data.coord.lat, data.coord.lon);
  } else if (flag === "hourlyForecast") {
    const currentDay = new Date().getDate();
    createHourlyForecast(data, currentDay, "hourly-forecast");
  }
}

function updateFiveDayTab(data) {
  createShortForecastBlocks(data);
  const now = new Date();
  const currentDay = now.getDate();
  createHourlyForecast(data, currentDay, "day-hourly");
}

function createShortInfo(data) {
  const shortInfo = document.querySelector(".short-info");
  const date = new Date(data.dt * 1000);
  const dateString = `${date.toLocaleDateString()}`;
  const iconUrl = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dayDuration = new Date((data.sys.sunset - data.sys.sunrise) * 1000).toISOString().substr(11, 5);

  shortInfo.innerHTML = `
  <div class="short__title">
    <div class="title__name">current weather</div>
    <div class="title__date">${dateString}</div>
  </div>
  <div class="short__content">
    <div class="content__item flex j-d">
      <div class="weather-icon">
        <img src="${iconUrl}" alt="${data.weather[0].description}">
      </div>
      <div class="wether-description">${data.weather[0].description}</div>    
    </div>
    <div class="content__item flex j-d ">
      <div class="short__temperature">${Math.ceil(data.main.temp)}°C</div>
      <div class="short__feels">Real Feel: ${data.main.feels_like}°C</div>    
    </div>
    <div class="content__item flex g-15">
      <div class="short__about-label"> 
        <div class="about-label-item">Sunrise:</div>
        <div class="about-label-item">Sunset:</div>
        <div class="about-label-item">Duration:</div>
      </div>
      <div class="short__about-content"> 
        <div class="about-label-content">${sunrise}</div>
        <div class="about-label-content">${sunset}</div>
        <div class="about-label-content">${dayDuration}</div>
      </div>
    </div>
  </div>
  `;
}
function addTitleToBlock(titleName, styleTitle, nameInstance) {
  const title = document.createElement("div");
  title.classList.add(`${styleTitle}__title`);
  title.innerHTML = `<div class="${styleTitle}__date">${titleName}</div>`;
  nameInstance.appendChild(title);
  const content = document.createElement("div");
  content.classList.add(`${styleTitle}__content`);
  nameInstance.appendChild(content);
  const titleNameContentContainer = document.querySelector(`.${styleTitle}__content`);
  return titleNameContentContainer;
}

function createHourlyForecast(data, date, titleClassMain) {
  const hourlyForecast = document.querySelector(`.${titleClassMain}`);

  hourlyForecast.innerHTML = "";

  const hourlyData = hourlyArray(data, date);

  const hourlyContentContainer = addTitleToBlock("HOURLY", titleClassMain, hourlyForecast);
  const labelTitle = dayOfWeek(date, hourlyData);

  const forecastItemTitle = document.createElement("div");
  forecastItemTitle.classList.add("forecast-items-title");
  forecastItemTitle.innerHTML = `
  <div class="items-title__title">${labelTitle}</div>
  <div class="items-title__element-desc">Forecast</div>
  <div class="items-title__element">Temp (°C)</div>
  <div class="items-title__element">Real feel</div>
  <div class="items-title__element">Wind (km/h)</div>
  `;
  hourlyContentContainer.appendChild(forecastItemTitle);
  let count = 1;

  hourlyData.forEach((forecast) => {
    if (count === 1 || count <= 6) {
      ++count;
      const forecastItem = document.createElement("div");
      forecastItem.classList.add("forecast-item");

      const date = new Date(forecast.dt * 1000);
      const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const temperature = `${Math.ceil(forecast.main.temp)}°`;
      const feelsLike = `${Math.ceil(forecast.main.feels_like)}°`;
      const weatherDescription = `${forecast.weather[0].description}`;
      const windInfo = `${Math.ceil(forecast.wind.speed / 1000)} ${getWindDirection(forecast.wind.deg)}`;
      const iconUrl = `http://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;

      forecastItem.innerHTML = `
        <div class="item__time">${timeString}</div>
        <div class="weather-icon">
          <img src="${iconUrl}" alt="${forecast.weather[0].description}">
        </div>
        <div class="item__descr">${weatherDescription}</div>
        <div class="item__temp">${temperature}</div>
        <div class="item__feels">${feelsLike}</div>
        <div class="item__wind">${windInfo}</div>
      `;
      hourlyContentContainer.appendChild(forecastItem);
    }
  });
}

function createNearbyCities(data) {
  const nearestCities = document.querySelector(".nearby-cities");
  nearestCities.innerHTML = "";
  const nearestContentContainer = addTitleToBlock("nearby places", "nearby-places", nearestCities);

  data.list.slice(0, 4).forEach((city) => {
    const cityName = city.name;
    const iconUrl = `http://openweathermap.org/img/w/${city.weather[0].icon}.png`;
    const temperature = `${Math.ceil(city.main.temp_max)}°C`;

    const cityItem = document.createElement("div");
    cityItem.classList.add("city-item");
    cityItem.innerHTML = `
      <div>${cityName}</div>
      <div class="city-item-data">
        <div class="weather-icon">
          <img src="${iconUrl}" alt="${city.weather[0].description}">
        </div>
        <div>${temperature}</div>
      </div>
    `;

    nearestContentContainer.appendChild(cityItem);
  });
}

function createShortForecastBlocks(data) {
  const forecastDiv = document.querySelector(".five-days-list");
  let count = 1;
  let buf = "";
  forecastDiv.innerHTML = "";
  data.list.forEach((forecast) => {
    const forecastDate = new Date(forecast.dt * 1000);
    const forecastDay = forecastDate.getDate();
    const forecastHour = forecastDate.getHours();

    if (count === 1 || (count <= 5 && forecastHour <= 12 && forecastDay != buf)) {
      buf = forecastDay;
      const date = forecastDate;
      const dayOfWeek = count == 1 ? "TODAY" : date.toLocaleDateString("en-US", { weekday: "short" });
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const dayOfMonth = date.toLocaleDateString("en-US", { day: "numeric" });
      const dayInfoDiv = document.createElement("div");
      const temp = Math.ceil(forecast.main.temp_max);
      dayInfoDiv.classList.add("day-info");
      dayInfoDiv.setAttribute("data-date", forecastDay);
      dayInfoDiv.innerHTML = `
      <div class="five-day__day-week">${dayOfWeek}</div>
      <div class="five-day__day-date">${month} ${dayOfMonth}</div>
      <div class="five-day__weather-icon">
        <img src="http://openweathermap.org/img/w/${forecast.weather[0].icon}.png" alt="${
        forecast.weather[0].description
      }">
      </div>
      <div class="five-day__temp">${temp}°C</div>
      <div class="five-day__desc">${forecast.weather[0].description}</div>
      <div class="five-day__desc">${determineTemperatureState(temp)}</div>
      `;
      forecastDiv.appendChild(dayInfoDiv);
      dayInfoDiv.addEventListener("click", (e) => {
        const clickedElement = e.target;
        const dayInfoElement = clickedElement.closest(".day-info");
        if (dayInfoElement) {
          dayInfoElement.classList.toggle("selected");
          document.querySelectorAll(".day-info").forEach((element) => {
            if (element !== dayInfoElement) {
              element.classList.remove("selected");
            }
          });
        }

        const selectedDate = e.currentTarget.getAttribute("data-date");
        createHourlyForecast(data, selectedDate, "day-hourly");
      });
      ++count;
    }
  });
}

function showError() {
  const errorDiv = document.querySelector(".error-404");
  const errorMessage = `${searchInput.value} could not be found.<br>Please enter different location.`;
  const img = "img/error-404-page.png";
  todaySection.style.display = "none";
  fiveDaySection.style.display = "none";
  errorSection.style.display = "flex";
  errorDiv.innerHTML = `
      <div class="error-404">
        <img src="${img}" alt="404 not found">
      </div>
      <div class="error-message">${errorMessage}</div>`;
}

//get wind direction
function getWindDirection(degrees) {
  const directions = ["N", "NW", "W", "SW", "S", "SE", "E", "NE"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

//get title for feeling
function determineTemperatureState(temperature) {
  if (temperature > 25) {
    return "Hot";
  } else if (temperature >= 18) {
    return "Warm";
  } else if (temperature >= 10) {
    return "Comfort";
  } else if (temperature >= 0) {
    return "Cold";
  } else {
    return "Frosty";
  }
}

//get day name of week from date
function dayOfWeek(date, dataArray) {
  const now = new Date();
  const currentDay = now.getDate();
  const dateSelected = new Date(dataArray[0].dt * 1000);
  const dayOfWeek = dateSelected.toLocaleDateString("en-US", { weekday: "long" });
  const labelTitle = date == currentDay ? "Today" : dayOfWeek;
  return labelTitle;
}

//ger array fore hourly forecast 6pcs
function hourlyArray(dataWichFiltered, dateLooking) {
  const array = dataWichFiltered.list.filter((forecast) => {
    const forecastDay = new Date(forecast.dt * 1000).getDate();
    return forecastDay == dateLooking;
  });
  if (array.length < 6) {
    const startIndex = array.length;
    for (let i = startIndex; i < 6; i++) {
      array.push(dataWichFiltered.list[i]);
    }
  }

  return array;
}
