// Configuração da API (OpenWeatherMap)
const API_KEY = "SUA_CHAVE_API"; // Obtenha em: https://openweathermap.org/
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Elementos do DOM
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const temperature = document.getElementById("temperature");
const cityName = document.getElementById("city");
const weatherDesc = document.getElementById("weather-description");
const weatherIcon = document.getElementById("weather-icon");
const windSpeed = document.getElementById("wind-speed");
const humidity = document.getElementById("humidity");
const feelsLike = document.getElementById("feels-like");
const updateTime = document.getElementById("update-time");
const forecastContainer = document.getElementById("forecast-container");

// Função para buscar dados do tempo
async function fetchWeatherData(city) {
    try {
        // Busca dados atuais
        const currentResponse = await fetch(
            `${BASE_URL}/weather?q=${city}&units=metric&lang=pt_br&appid=${API_KEY}`
        );
        const currentData = await currentResponse.json();
        
        // Busca previsão para 5 dias
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${city}&units=metric&lang=pt_br&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();
        
        // Atualiza a UI
        updateCurrentWeather(currentData);
        updateForecast(forecastData);
        updateBackground(currentData.weather[0].main);
        
        // Atualiza hora
        updateTime();
        
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        alert("Não foi possível encontrar a cidade. Verifique o nome e tente novamente.");
    }
}

// Atualiza dados atuais
function updateCurrentWeather(data) {
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    weatherDesc.textContent = data.weather[0].description;
    windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    humidity.textContent = `${data.main.humidity}%`;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    
    // Atualiza ícone
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `assets/icons/${iconCode}.png`;
}

// Atualiza previsão
function updateForecast(data) {
    forecastContainer.innerHTML = "";
    
    // Filtra para pegar 1 previsão por dia (a cada 24h)
    const dailyForecasts = data.list.filter((item, index) => index % 8 === 0);
    
    dailyForecasts.slice(0, 5).forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString("pt-BR", { weekday: "short" });
        const temp = Math.round(item.main.temp);
        const iconCode = item.weather[0].icon;
        
        const forecastCard = document.createElement("div");
        forecastCard.className = "forecast-card";
        forecastCard.innerHTML = `
            <div class="forecast-day">${day}</div>
            <img class="forecast-icon" src="assets/icons/${iconCode}.png" alt="${item.weather[0].description}">
            <div class="forecast-temp">${temp}°C</div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
}

// Atualiza background conforme o clima
function updateBackground(weatherCondition) {
    const body = document.body;
    
    switch(weatherCondition.toLowerCase()) {
        case "clear":
            body.style.background = "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)";
            break;
        case "clouds":
            body.style.background = "linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)";
            break;
        case "rain":
        case "drizzle":
            body.style.background = "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)";
            break;
        case "thunderstorm":
            body.style.background = "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)";
            break;
        case "snow":
            body.style.background = "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)";
            break;
        default:
            body.style.background = "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)";
    }
}

// Atualiza hora da última atualização
function updateTime() {
    const now = new Date();
    updateTime.textContent = now.toLocaleTimeString("pt-BR", { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Busca localização do usuário
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            error => {
                console.error("Erro ao obter localização:", error);
                alert("Não foi possível obter sua localização. Por favor, digite sua cidade manualmente.");
            }
        );
    } else {
        alert("Geolocalização não é suportada pelo seu navegador.");
    }
}

// Busca tempo por coordenadas
async function fetchWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`
        );
        const data = await response.json();
        cityInput.value = data.name;
        fetchWeatherData(data.name);
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
}

// Event Listeners
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) fetchWeatherData(city);
});

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = cityInput.value.trim();
        if (city) fetchWeatherData(city);
    }
});

locationBtn.addEventListener("click", getUserLocation);

// Inicialização
fetchWeatherData("São Paulo"); // Cidade padrão