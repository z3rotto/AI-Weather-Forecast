const weatherApp = {
    translations: {
        en: {
            title: "Weather Forecast 🌦️",
            hourlyForecastTitle: "Hourly Forecast",
            locationPlaceholder: "Enter location",
            updateButton: "Update 🔄",
            advancedInfoButton: "Advanced Information",
            hideAdvancedInfoButton: "Hide Advanced Information",
            date: "Date and Time:",
            temperature: "Temperature: 🌡️",
            humidity: "Humidity: 💧",
            windSpeed: "Wind Speed: 💨",
            precipitation: "Precipitation: 🌧️",
            uvIndex: "UV Index: ☀️",
            sunrise: "Sunrise: 🌅",
            sunset: "Sunset: 🌇",
            visibility: "Visibility: 👁️",
            pressure: "Pressure: 📈",
            weatherAlerts: "Weather Alerts: ⚠️",
            noAlerts: "No alerts",
            advancedDataTitle: "Advanced Weather Data",
            precipitationProbability: "Precipitation Probability:  확률",
            precipitationHours: "Precipitation Hours: 🕒",
            rain: "Rain: ☔",
            showers: "Showers: 🚿",
            snowfall: "Snowfall: ❄️",
            windGusts: "Wind Gusts: 🌬️",
            privacy: "Privacy",
            terms: "Terms",
            daySelector: {
                "-7": "7 Days Ago", "-6": "6 Days Ago", "-5": "5 Days Ago", "-4": "4 Days Ago",
                "-3": "3 Days Ago", "-2": "2 Days Ago", "-1": "Yesterday", "0": "Today", "1": "Tomorrow",
                "2": "2 Days After", "3": "3 Days After", "4": "4 Days After", "5": "5 Days After",
                "6": "6 Days After", "7": "7 Days After"
            }
        },
        it: {
            title: "Previsioni Meteo 🌦️",
            hourlyForecastTitle: "Previsioni Orarie",
            locationPlaceholder: "Inserisci località",
            updateButton: "Aggiorna 🔄",
            advancedInfoButton: "Informazioni Avanzate",
            hideAdvancedInfoButton: "Nascondi Informazioni Avanzate",
            date: "Data e Ora:",
            temperature: "Temperatura: 🌡️",
            humidity: "Umidità: 💧",
            windSpeed: "Velocità del Vento: 💨",
            precipitation: "Precipitazioni: 🌧️",
            uvIndex: "Indice UV: ☀️",
            sunrise: "Alba: 🌅",
            sunset: "Tramonto: 🌇",
            visibility: "Visibilità: 👁️",
            pressure: "Pressione: 📈",
            weatherAlerts: "Allerte Meteo: ⚠️",
            noAlerts: "Nessuna allerta",
            advancedDataTitle: "Dati Meteo Avanzati",
            precipitationProbability: "Probabilità di Precipitazioni: 확률",
            precipitationHours: "Ore di Precipitazione: 🕒",
            rain: "Pioggia: ☔",
            showers: "Rovesci: 🚿",
            snowfall: "Nevicata: ❄️",
            windGusts: "Raffiche di Vento: 🌬️",
            privacy: "Privacy",
            terms: "Termini",
            daySelector: {
                "-7": "7 Giorni Fa", "-6": "6 Giorni Fa", "-5": "5 Giorni Fa", "-4": "4 Giorni Fa",
                "-3": "3 Giorni Fa", "-2": "2 Giorni Fa", "-1": "Ieri", "0": "Oggi", "1": "Domani",
                "2": "2 Giorni Dopo", "3": "3 Giorni Dopo", "4": "4 Giorni Dopo", "5": "5 Giorni Dopo",
                "6": "6 Giorni Dopo", "7": "7 Giorni Dopo"
            }
        }
    },

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.cacheDOMElements();
            this.addEventListeners();
            this.prepareTranslations();

            const savedLang = localStorage.getItem('weatherLang') || 'en';
            this.switchLanguage(savedLang);

            const savedLocation = localStorage.getItem('weatherLocation');
            if (savedLocation) {
                this.dom.locationInput.value = savedLocation;
                    } else {
                        this.dom.locationInput.value = 'Rome';
            }

            this.fetchWeather();
        });
    },

    cacheDOMElements() {
        this.dom = {
            langButtons: document.querySelectorAll('.lang-btn'),
            translatableElements: document.querySelectorAll('[data-translate]'),
            locationInput: document.getElementById('location'),
            daySelector: document.getElementById('day-selector'),
            updateButton: document.getElementById('update-btn'),
            advancedButton: document.getElementById('toggle-advanced'),
            advancedSection: document.querySelector('.advanced-weather-info'),
            weatherBanner: document.getElementById('weather-banner'),
            weatherIcon: document.getElementById('weather-icon'),
            hourlyContainer: document.getElementById('hourly-container'),
            mapImage: document.getElementById('map-image'),
            suggestionsContainer: document.getElementById('suggestions-container'),
            loadingOverlay: document.getElementById('loading-overlay'),
            gpsButton: document.getElementById('gps-btn')
        };
    },

    addEventListeners() {
                console.log("Adding event listeners");
        this.dom.langButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchLanguage(btn.id.split('-')[1]));
        });
        this.dom.updateButton.addEventListener('click', () => this.fetchWeather());
        this.dom.advancedButton.addEventListener('click', () => this.toggleAdvancedInfo());
        this.dom.hourlyContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.hour-card');
            if (card) {
                this.updateMainDisplay(card.dataset.hourIndex);
            }
        });

        this.dom.locationInput.addEventListener('input', () => this.fetchCitySuggestions());
        this.dom.suggestionsContainer.addEventListener('click', (e) => {
            const suggestion = e.target.closest('.suggestion-item');
            if (suggestion) {
                this.dom.locationInput.value = suggestion.dataset.cityName;
                this.dom.suggestionsContainer.innerHTML = '';
                this.fetchWeather(suggestion.dataset.locationName);
            }
        });
        this.dom.gpsButton.addEventListener('click', () => this.useCurrentLocation());
    },

    fetchCitySuggestions() {
        const query = this.dom.locationInput.value;
                console.log(`Fetching suggestions for: ${query}`);
        if (query.length < 3) {
            this.dom.suggestionsContainer.innerHTML = '';
            return;
        }

        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`)
            .then(res => res.json())
            .then(data => {
                        console.log("Suggestions data:", data);
                this.dom.suggestionsContainer.innerHTML = '';
                if (data.results) {
                    data.results.forEach(city => {
                        const div = document.createElement('div');
                        const locationName = `${city.name}, ${city.country}`;
                        div.textContent = `${city.name}, ${city.admin1 || ''}, ${city.country}`.replace(/, ,/g, ',');
                        div.dataset.locationName = locationName;
                        div.dataset.cityName = city.name;
                        div.className = 'suggestion-item';
                        this.dom.suggestionsContainer.appendChild(div);
                    });
                }
                    })
                    .catch(error => {
                        console.error('Error fetching city suggestions:', error);
            });
    },

    prepareTranslations() {
        this.dom.translatableElements.forEach(el => {
            el.setAttribute('data-original-text', el.textContent);
        });
    },

    switchLanguage(lang) {
        this.dom.langButtons.forEach(btn => btn.classList.remove('active'));
        document.getElementById(`lang-${lang}`).classList.add('active');
        localStorage.setItem('weatherLang', lang);

        const targetLang = this.translations[lang] || this.translations.en;

        this.dom.translatableElements.forEach(el => {
            const key = el.getAttribute('data-translate');
            el.textContent = targetLang[key] || el.getAttribute('data-original-text');
        });

        this.updateDaySelector(lang);

        const bannerText = this.dom.weatherBanner.textContent;
        if (bannerText && bannerText.includes(':')) {
            const condition = bannerText.split(': ')[1].split(' ')[0];
            if (condition) this.updateBanner(condition);
        }

        this.dom.locationInput.placeholder = targetLang.locationPlaceholder;
        this.dom.updateButton.textContent = targetLang.updateButton;
        this.updateAdvancedButtonText();
    },

    updateDaySelector(lang) {
        const targetLang = this.translations[lang] || this.translations.en;
        Array.from(this.dom.daySelector.options).forEach((option) => {
            const value = option.value;
            if (targetLang.daySelector[value]) {
                option.text = targetLang.daySelector[value];
            }
        });
    },

    updateAdvancedButtonText() {
        const lang = document.getElementById('lang-en').classList.contains('active') ? 'en' : 'it';
        const isVisible = this.dom.advancedSection.style.display !== 'none';
        if (lang === 'en') {
            this.dom.advancedButton.textContent = isVisible ? this.translations.en.hideAdvancedInfoButton : this.translations.en.advancedInfoButton;
        } else {
            this.dom.advancedButton.textContent = isVisible ? "Nascondi Info Avanzate" : "Mostra Info Avanzate";
        }
    },

    showLoading() {
        this.dom.loadingOverlay.style.display = 'flex';
    },

    hideLoading() {
        this.dom.loadingOverlay.style.display = 'none';
    },

    fetchWeather(locationOverride) {
        this.showLoading();
        const location = locationOverride || this.dom.locationInput.value || 'Rome';
        if(location) {
            localStorage.setItem('weatherLocation', location);
        }
        const dayOffset = parseInt(this.dom.daySelector.value);
        const date = new Date();
        date.setDate(date.getDate() + dayOffset);
        const formattedDate = date.toISOString().split('T')[0];

        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=it&format=json`)
            .then(res => res.ok ? res.json() : Promise.reject('Geocoding API error'))
            .then(geoData => {
                if (geoData.results && geoData.results.length > 0) {
                    const { latitude, longitude } = geoData.results[0];
                    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,weathercode,surface_pressure,visibility,windspeed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_hours,windspeed_10m_max,windgusts_10m_max,uv_index_max,rain_sum,showers_sum,snowfall_sum&current_weather=true&timezone=auto&start_date=${formattedDate}&end_date=${formattedDate}`;
                    return fetch(url);
                }
                throw new Error('Location not found');
            })
            .then(res => res.ok ? res.json() : Promise.reject('Weather API error'))
            .then(data => this.updateUI(data, formattedDate))
            .catch(error => {
                console.error('Error fetching data:', error);
                this.dom.weatherBanner.textContent = 'Failed to load weather data. Please try again.';
                this.dom.weatherBanner.style.backgroundColor = 'red';
            })
            .finally(() => this.hideLoading());
    },

    hourlyData: {},
    locationData: {},

    updateUI(data, date) {
        const { current_weather, daily, hourly } = data;
        this.hourlyData = hourly;
        this.locationData = { latitude: data.latitude, longitude: data.longitude };

        document.getElementById('datetime').textContent = `${date}, ${current_weather.time.split('T')[1]}`;
        document.getElementById('temperature').textContent = `${current_weather.temperature}°C`;
        document.getElementById('wind-speed').textContent = `${current_weather.windspeed} km/h`;
        document.getElementById('precipitation').textContent = `${daily.precipitation_sum[0]} mm`;
        document.getElementById('humidity').textContent = `${hourly.relativehumidity_2m[0]}%`;
        document.getElementById('uv-index').textContent = daily.uv_index_max[0].toFixed(1);
        document.getElementById('sunrise').textContent = daily.sunrise[0].split('T')[1];
        document.getElementById('sunset').textContent = daily.sunset[0].split('T')[1];
        document.getElementById('visibility').textContent = `${(hourly.visibility[0] / 1000).toFixed(1)} km`;
        document.getElementById('pressure').textContent = `${hourly.surface_pressure[0].toFixed(0)} hPa`;
        document.getElementById('precipitation-probability').textContent = `${hourly.precipitation_probability[0]}%`;
        document.getElementById('precipitation-hours').textContent = `${daily.precipitation_hours[0]} hours`;
        document.getElementById('rain-sum').textContent = `${daily.rain_sum[0]} mm`;
        document.getElementById('showers-sum').textContent = `${daily.showers_sum[0]} mm`;
        document.getElementById('snowfall-sum').textContent = `${daily.snowfall_sum[0]} cm`;
        document.getElementById('windgusts').textContent = `${daily.windgusts_10m_max[0]} km/h`;
        this.updateBanner(this.getWeatherCondition(current_weather.weathercode));
        this.displayHourlyForecast(hourly);
        this.updateMainDisplay(new Date().getHours());
    },

    updateMainDisplay(hourIndex) {
        const hourData = {
            time: this.hourlyData.time[hourIndex],
            temperature: this.hourlyData.temperature_2m[hourIndex],
            humidity: this.hourlyData.relativehumidity_2m[hourIndex],
            windspeed: this.hourlyData.windspeed_10m[hourIndex],
            precipitation: this.hourlyData.precipitation_probability[hourIndex],
            uvIndex: this.hourlyData.uv_index[hourIndex],
            visibility: this.hourlyData.visibility[hourIndex],
            pressure: this.hourlyData.surface_pressure[hourIndex],
            weathercode: this.hourlyData.weathercode[hourIndex]
        };

        document.getElementById('datetime').textContent = `${hourData.time.split('T')[0]}, ${hourData.time.split('T')[1]}`;
        document.getElementById('temperature').textContent = `${hourData.temperature}°C`;
        document.getElementById('wind-speed').textContent = `${hourData.windspeed} km/h`;
        document.getElementById('precipitation').textContent = `${hourData.precipitation}%`;
        document.getElementById('humidity').textContent = `${hourData.humidity}%`;
        document.getElementById('uv-index').textContent = hourData.uvIndex.toFixed(1);
        document.getElementById('visibility').textContent = `${(hourly.visibility[0] / 1000).toFixed(1)} km`;
        document.getElementById('pressure').textContent = `${hourData.pressure.toFixed(0)} hPa`;

        this.updateBanner(this.getWeatherCondition(hourData.weathercode));
        this.updateMap();

        // Highlight active card
        const allCards = this.dom.hourlyContainer.querySelectorAll('.hour-card');
        allCards.forEach(card => card.classList.remove('active'));
        const selectedCard = this.dom.hourlyContainer.querySelector(`[data-hour-index='${hourIndex}']`);
        if(selectedCard) {
            selectedCard.classList.add('active');
        }
    },

    displayHourlyForecast(hourly) {
        this.dom.hourlyContainer.innerHTML = '';
        for (let i = 0; i < hourly.time.length; i++) {
            const card = document.createElement('div');
            card.className = 'hour-card';
            card.dataset.hourIndex = i;

            const time = new Date(hourly.time[i]).getHours();
            const condition = this.getWeatherCondition(hourly.weathercode[i]);
            const temp = hourly.temperature_2m[i];

            card.innerHTML = `
                <div class="time">${time}:00</div>
                <div class="icon">${this.getWeatherEmoji(condition)}</div>
                <div class="temp">${temp.toFixed(1)}°C</div>
            `;
            this.dom.hourlyContainer.appendChild(card);
        }
    },

    getWeatherEmoji(condition) {
        const emojiMap = {
            'Sunny': '☀️',
            'Slightly Cloudy': '🌤️',
            'Partly Cloudy': '🌥️',
            'Cloudy': '☁️',
            'Foggy': '🌫️',
            'Drizzle': '🌦️',
            'Rain': '🌧️',
            'Snow': '❄️',
            'Thunderstorm': '⛈️',
            'Windy': '💨',
            'Variable Conditions': '🤷'
        };
        return emojiMap[condition] || '🤷';
    },

    getWeatherCondition(code) {
        const conditions = {
            0: 'Sunny', 1: 'Slightly Cloudy', 2: 'Partly Cloudy', 3: 'Cloudy', 45: 'Foggy', 48: 'Foggy',
            51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle', 61: 'Rain', 63: 'Rain', 65: 'Rain',
            71: 'Snow', 73: 'Snow', 75: 'Snow', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
        };
        return conditions[code] || 'Variable Conditions';
    },

    getItalianWeatherCondition(condition) {
        const translations = {
            'Sunny': 'Soleggiato', 'Slightly Cloudy': 'Leggermente Nuvoloso', 'Partly Cloudy': 'Parzialmente Nuvoloso',
            'Cloudy': 'Nuvoloso', 'Foggy': 'Nebbia', 'Drizzle': 'Piovigine', 'Rain': 'Pioggia', 'Snow': 'Neve',
            'Thunderstorm': 'Temporale', 'Windy': 'Ventoso', 'Variable Conditions': 'Condizioni Variabili'
        };
        return translations[condition] || 'Condizioni Variabili';
    },

    updateBanner(condition) {
        const banner = this.dom.weatherBanner;
        const background = document.querySelector('.weather-background');
        banner.className = 'fade-in'; // Reset classes
        background.className = 'weather-background';

        let conditionClass = 'cloudy', conditionText = condition, emoji = '☁️';

        if (['sunny'].includes(condition.toLowerCase())) {
            conditionClass = 'sunny';
            emoji = '☀️';
        }
        else if (['rain', 'drizzle'].includes(condition.toLowerCase())) {
            conditionClass = 'rainy';
            emoji = '🌧️';
        }
        else if (['snow'].includes(condition.toLowerCase())) {
            conditionClass = 'snowy';
            emoji = '❄️';
        }
        else if (['thunderstorm'].includes(condition.toLowerCase())) {
            conditionClass = 'thunderstorm';
            emoji = '⛈️';
        }
         else if (['foggy'].includes(condition.toLowerCase())) {
            emoji = '🌫️';
        }

        const lang = document.getElementById('lang-en').classList.contains('active') ? 'en' : 'it';
        banner.classList.add(conditionClass);
        background.classList.add(conditionClass);
        banner.textContent = `Current Weather: ${lang === 'en' ? conditionText : this.getItalianWeatherCondition(conditionText)} ${emoji}`;

        this.updateWeatherIcon(conditionText);
    },

    updateWeatherIcon(condition) {
        let iconContent = '';
        switch(condition.toLowerCase()) {
            case 'sunny':
                iconContent = '<circle cx="50" cy="50" r="25" class="sun" />';
                break;
            case 'cloudy':
            case 'slightly cloudy':
            case 'partly cloudy':
                iconContent = '<circle cx="50" cy="50" r="20" class="sun" /><path d="M30 70 Q50 60 70 70" class="cloud" stroke-width="10" stroke="white" fill="none" />';
                break;
            case 'rain':
            case 'drizzle':
                iconContent = '<path d="M30 40 Q50 30 70 40" class="cloud" stroke-width="10" stroke="white" fill="none" /><line x1="40" y1="60" x2="35" y2="80" class="rain" stroke-width="2" /><line x1="50" y1="60" x2="45" y2="80" class="rain" stroke-width="2" /><line x1="60" y1="60" x2="55" y2="80" class="rain" stroke-width="2" />';
                break;
            case 'snow':
                iconContent = '<path d="M30 40 Q50 30 70 40" class="cloud" stroke-width="10" stroke="white" fill="none" /><circle cx="40" cy="70" r="3" class="snow" /><circle cx="50" cy="75" r="3" class="snow" /><circle cx="60" cy="70" r="3" class="snow" />';
                break;
            case 'thunderstorm':
                iconContent = '<path d="M30 40 Q50 30 70 40" class="cloud" stroke-width="10" stroke="white" fill="none" /><path d="M50 50 L45 70 L55 65 L50 85" class="lightning" stroke-width="2" />';
                break;
            default:
                iconContent = '<circle cx="50" cy="50" r="25" class="sun" /><path d="M30 70 Q50 60 70 70" class="cloud" stroke-width="10" stroke="white" fill="none" />';
        }
        this.dom.weatherIcon.innerHTML = iconContent;
    },

    toggleAdvancedInfo() {
        const isVisible = this.dom.advancedSection.style.display !== 'none';
        this.dom.advancedSection.style.display = isVisible ? 'none' : 'grid';
        this.updateAdvancedButtonText();
    },

    updateMap() {
        if (this.locationData.latitude && this.locationData.longitude) {
            const { latitude, longitude } = this.locationData;
            const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.1},${latitude-0.1},${longitude+0.1},${latitude+0.1}&layer=mapnik&marker=${latitude},${longitude}`;

            // To avoid using an iframe for the embed, which might be blocked,
            // we will use a static image from a different provider that uses OpenStreetMap data.
            const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${longitude},${latitude})/${longitude},${latitude},9,0/800x600?access_token=pk.eyJ1IjoiYWl6ZXJvIiwiYSI6ImNreWVhZ3ZqazA0Z2gyb3A1dG5sY2J3aXAifQ.l-5_b5t_FMMb2u3NSp2g7g`;

            // Since we can't use Mapbox without an API key setup on the user side,
            // let's use a simpler static map provider that does not require a key for simple use cases.
            const finalMapUrl = `https://static-maps.yandex.ru/1.x/?ll=${longitude},${latitude}&z=10&l=map&size=600,450&pt=${longitude},${latitude},pm2rdl`;

            this.dom.mapImage.src = finalMapUrl;
            this.dom.mapImage.alt = `Map of the selected location`;
        }
    },

    useCurrentLocation() {
        this.showLoading();
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            this.fetchWeatherByCoords(latitude, longitude);
        }, error => {
            console.error('Error getting location:', error);
            this.hideLoading();
            alert('Unable to retrieve your location.');
        });
    },

    fetchWeatherByCoords(lat, lon) {
        const dayOffset = parseInt(this.dom.daySelector.value);
        const date = new Date();
        date.setDate(date.getDate() + dayOffset);
        const formattedDate = date.toISOString().split('T')[0];

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,weathercode,surface_pressure,visibility,windspeed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_hours,windspeed_10m_max,windgusts_10m_max,uv_index_max,rain_sum,showers_sum,snowfall_sum&current_weather=true&timezone=auto&start_date=${formattedDate}&end_date=${formattedDate}`;

        fetch(url)
            .then(res => res.ok ? res.json() : Promise.reject('Weather API error'))
            .then(data => {
                // To get the location name from coordinates, we need a reverse geocoding API.
                // Open-Meteo does not provide this. We will use a free one.
                return fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                    .then(res => res.json())
                    .then(geoData => {
                        this.dom.locationInput.value = geoData.address.city || geoData.address.town || geoData.address.village;
                        this.updateUI(data, formattedDate);
                    });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                this.dom.weatherBanner.textContent = 'Failed to load weather data. Please try again.';
                this.dom.weatherBanner.style.backgroundColor = 'red';
            })
            .finally(() => this.hideLoading());
    }
};

weatherApp.init();
