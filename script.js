document.addEventListener('DOMContentLoaded', () => {
    // ========== API Keys ==========
    const OPENWEATHER_API_KEY = '17eaa54618b9ebc007ea67560cfcd97b';
    const WEATHERAPI_KEY = 'a62aaf33a3624e7e8d8232941250604';

    // ========== DOM Elements ==========
    const elements = {
        searchBtn: document.getElementById('searchBtn'),
        inputBox: document.querySelector('.input-box'),
        weatherBody: document.querySelector('.weather-body'),
        locationNotFound: document.querySelector('.location-not-found'),
        cityName: document.getElementById('city-name'),
        temperature: document.querySelector('.temperature'),
        description: document.querySelector('.description'),
        humidity: document.getElementById('humidity'),
        windSpeed: document.getElementById('wind-speed'),
        weatherIcon: document.querySelector('.weather-icon img'),
        sunrise: document.getElementById('sunrise'),
        sunset: document.getElementById('sunset'),
        moonrise: document.getElementById('moonrise'),
        moonset: document.getElementById('moonset'),
        moonPhase: document.getElementById('moon-phase'),
        moonIllumination: document.getElementById('moon-illumination'),
        moonPhaseIcon: document.getElementById('moon-phase-icon'),
        forecastContainer: document.querySelector('.forecast-cards')
    };

    // ========== Initialize App ==========
    function initializeApp() {
        const urlParams = new URLSearchParams(window.location.search);
        const cityParam = urlParams.get('city');
        const defaultCity = 'bhagalpur';
        
        elements.inputBox.value = cityParam || defaultCity;
        fetchWeatherData(cityParam || defaultCity);
        
        // Event Listeners
        elements.searchBtn.addEventListener('click', handleSearch);
        elements.inputBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }

    // ========== Main Functions ==========
    function handleSearch() {
        const city = elements.inputBox.value.trim();
        if (city) {
            fetchWeatherData(city);
        }
    }

    async function fetchWeatherData(city) {
        try {
            // Show loading state
            elements.weatherBody.style.display = 'none';
            elements.locationNotFound.style.display = 'none';
            
            // Fetch current weather
            const weatherResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
            );
            const weatherData = await weatherResponse.json();

            if (weatherData.cod === '404') {
                showError();
                return;
            }

            updateWeatherUI(weatherData);
            fetchMoonData(city);
            fetchForecast(city);

        } catch (error) {
            console.error('Error fetching weather data:', error);
            showError();
        }
    }

    function updateWeatherUI(data) {
        elements.weatherBody.style.display = 'block';
        elements.locationNotFound.style.display = 'none';

        elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
        elements.temperature.innerHTML = `${Math.round(data.main.temp)}<span>°C</span>`;
        elements.description.textContent = data.weather[0].description;
        elements.humidity.textContent = `${data.main.humidity}%`;
        elements.windSpeed.textContent = `${data.wind.speed} km/h`;
        
        const iconCode = data.weather[0].icon;
        elements.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const sunriseTime = new Date(data.sys.sunrise * 1000);
        const sunsetTime = new Date(data.sys.sunset * 1000);
        elements.sunrise.textContent = formatTime(sunriseTime);
        elements.sunset.textContent = formatTime(sunsetTime);
    }

    async function fetchMoonData(city) {
        try {
            const response = await fetch(
                `https://api.weatherapi.com/v1/astronomy.json?key=${WEATHERAPI_KEY}&q=${city}`
            );
            const data = await response.json();
            const astro = data.astronomy.astro;
            
            elements.moonrise.textContent = astro.moonrise;
            elements.moonset.textContent = astro.moonset;
            elements.moonPhase.textContent = astro.moon_phase;
            elements.moonIllumination.textContent = `${Math.round(astro.moon_illumination * 100)}%`;
            
            updateMoonPhaseIcon(astro.moon_phase);

        } catch (error) {
            console.error('Error fetching moon data:', error);
            resetMoonData();
        }
    }

    async function fetchForecast(city) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=7`
            );
            const forecastData = await response.json();
            updateForecastUI(forecastData.list);
        } catch (error) {
            console.error('Error fetching forecast:', error);
            elements.forecastContainer.innerHTML = '<p>Forecast unavailable</p>';
        }
    }

    // ========== Helper Functions ==========
    function showError() {
        elements.locationNotFound.style.display = 'block';
        elements.weatherBody.style.display = 'none';
    }

    function resetMoonData() {
        elements.moonrise.textContent = 'N/A';
        elements.moonset.textContent = 'N/A';
        elements.moonPhase.textContent = 'N/A';
        elements.moonIllumination.textContent = 'N/A';
    }

    function formatTime(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutes} ${ampm}`;
    }

    function updateMoonPhaseIcon(phase) {
        const moonPhases = {
            'New Moon': 'fa-moon',
            'Waxing Crescent': 'fa-moon',
            'First Quarter': 'fa-moon-half',
            'Waxing Gibbous': 'fa-moon',
            'Full Moon': 'fa-moon',
            'Waning Gibbous': 'fa-moon',
            'Last Quarter': 'fa-moon-half',
            'Waning Crescent': 'fa-moon'
        };
        elements.moonPhaseIcon.className = 'fas ' + (moonPhases[phase] || 'fa-moon');
    }

    function updateForecastUI(forecastItems) {
        elements.forecastContainer.innerHTML = '';
        
        forecastItems.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            const temp = Math.round(item.main.temp);
            const icon = item.weather[0].icon;
            
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card';
            forecastCard.innerHTML = `
                <p class="forecast-day">${day}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${item.weather[0].description}">
                <p class="forecast-temp">${temp}°C</p>
            `;
            
            elements.forecastContainer.appendChild(forecastCard);
        });
    }

    // Start the app
    initializeApp();
});