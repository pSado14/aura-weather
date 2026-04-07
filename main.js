// Aura Weather - Main Logic

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityNameEl = document.getElementById('city-name');
const temperatureEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('weather-description');
const dateEl = document.getElementById('current-date');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind-speed');
const visibilityEl = document.getElementById('visibility');
const feelsLikeEl = document.getElementById('feels-like');
const forecastGrid = document.getElementById('forecast-grid');
const mainIconContainer = document.getElementById('main-icon');

// Config
const DEFAULT_CITY = 'İstanbul';

/**
 * Fetch weather data from wttr.in (Free API, no key needed)
 */
async function fetchWeather(city) {
    try {
        const response = await fetch(`https://wttr.in/${city}?format=j1`);
        if (!response.ok) throw new Error('Şehir bulunamadı');
        const data = await response.json();
        updateUI(data, city);
    } catch (error) {
        console.error('Error fetching weather:', error);
        alert('Hava durumu bilgisi alınamadı. Lütfen geçerli bir şehir adı girin.');
    }
}

/**
 * Update the UI with fetched data
 */
function updateUI(data, cityName) {
    const current = data.current_condition[0];
    const weatherDesc = current.lang_tr ? current.lang_tr[0].value : current.weatherDesc[0].value;
    const temp = current.temp_C;
    const humidity = current.humidity;
    const wind = current.windspeedKmph;
    const visibility = current.visibility;
    const feelsLike = current.FeelsLikeC;

    // Update Text
    cityNameEl.textContent = cityName.charAt(0).toUpperCase() + cityName.slice(1);
    temperatureEl.textContent = `${temp}°`;
    descriptionEl.textContent = weatherDesc;
    humidityEl.textContent = `%${humidity}`;
    windEl.textContent = `${wind} km/s`;
    visibilityEl.textContent = `${visibility} km`;
    feelsLikeEl.textContent = `${feelsLike}°`;

    // Update Date
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    dateEl.textContent = now.toLocaleDateString('tr-TR', options);

    // Update Background & Icons
    updateTheme(weatherDesc.toLowerCase());
    
    // Update Forecast
    updateForecast(data.weather);

    // Re-initialize Lucide Icons
    lucide.createIcons();
}

/**
 * Update background theme based on condition
 */
function updateTheme(condition) {
    document.body.className = ''; // Reset
    
    if (condition.includes('güneş') || condition.includes('açık')) {
        document.body.classList.add('bg-sunny');
        updateMainIcon('sun');
    } else if (condition.includes('bulut') || condition.includes('parçalı')) {
        document.body.classList.add('bg-cloudy');
        updateMainIcon('cloud');
    } else if (condition.includes('yağmur') || condition.includes('çisenti')) {
        document.body.classList.add('bg-rainy');
        updateMainIcon('cloud-rain');
    } else {
        document.body.classList.add('bg-night');
        updateMainIcon('moon');
    }
}

function updateMainIcon(iconName) {
    mainIconContainer.innerHTML = `<i data-lucide="${iconName}" size="120" stroke-width="1.5" class="${iconName}-icon"></i>`;
    lucide.createIcons();
}

/**
 * Render weekly forecast
 */
function updateForecast(forecastData) {
    forecastGrid.innerHTML = '';
    
    // wttr.in provides 3 days in j1 format usually, or more
    forecastData.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
        const avgTemp = day.avgtempC;
        const condition = day.hourly[4].weatherDesc[0].value.toLowerCase(); // Mid-day condition
        
        let icon = 'sun';
        if (condition.includes('cloud')) icon = 'cloud';
        if (condition.includes('rain')) icon = 'cloud-rain';
        if (condition.includes('snow')) icon = 'snowflake';

        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
            <span class="forecast-day">${dayName}</span>
            <i data-lucide="${icon}"></i>
            <span class="forecast-temp">${avgTemp}°</span>
        `;
        forecastGrid.appendChild(item);
    });
    
    lucide.createIcons();
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim()) {
        fetchWeather(cityInput.value.trim());
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && cityInput.value.trim()) {
        fetchWeather(cityInput.value.trim());
    }
});

// Initial Load
window.addEventListener('load', () => {
    fetchWeather(DEFAULT_CITY);
});
