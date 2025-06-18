        const translations = {
            en: {
                title: "Weather Forecast",
                locationPlaceholder: "Enter location",
                updateButton: "Update",
                advancedInfoButton: "Advanced Information",
                hideAdvancedInfoButton: "Hide Advanced Information",
                date: "Date and Time:",
                temperature: "Temperature:",
                humidity: "Humidity:",
                windSpeed: "Wind Speed:",
                precipitation: "Precipitation:",
                uvIndex: "UV Index:",
                sunrise: "Sunrise:",
                sunset: "Sunset:",
                visibility: "Visibility:",
                pressure: "Pressure:",
                weatherAlerts: "Weather Alerts:",
                noAlerts: "No alerts",
                advancedDataTitle: "Advanced Weather Data",
                precipitationProbability: "Precipitation Probability:",
                precipitationHours: "Precipitation Hours:",
                rain: "Rain:",
                showers: "Showers:",
                snowfall: "Snowfall:",
                windGusts: "Wind Gusts:",
                privacy: "Privacy",
                terms: "Terms",
                daySelector: {
                    "-7": "7 Days Ago",
                    "-6": "6 Days Ago",
                    "-5": "5 Days Ago",
                    "-4": "4 Days Ago",
                    "-3": "3 Days Ago",
                    "-2": "2 Days Ago",
                    "-1": "Yesterday",
                    "0": "Today",
                    "1": "Tomorrow",
                    "2": "2 Days After",
                    "3": "3 Days After",
                    "4": "4 Days After",
                    "5": "5 Days After",
                    "6": "6 Days After",
                    "7": "7 Days After"
                }
            }
        };

        let selectedDay = 0;
        let storedCoords = null;

        document.addEventListener("DOMContentLoaded", function() {
            document.querySelectorAll('[data-translate]').forEach(element => {
                element.setAttribute('data-original-text', element.textContent);
            });

            const savedLocation = localStorage.getItem('lastLocation');
            if (savedLocation) {
                document.getElementById('location').value = savedLocation;
            }
            const coords = localStorage.getItem('lastCoords');
            if (coords) {
                storedCoords = JSON.parse(coords);
            }

            createDayCards();

            switchLanguage('en');
            fetchWeather();
        });

/*************  ✨ Codeium Command ⭐  *************/
        /**
/******  cd9895a7-a295-48be-bacf-b621d6eda4e2  *******/
        function switchLanguage(lang) {
            document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById(`lang-${lang}`).classList.add('active');

            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (lang === 'en' && translations.en[key]) {
                    element.textContent = translations.en[key];
                } else {
                    element.textContent = element.getAttribute('data-original-text');
                }
            });

            updateDayCards(lang);
            
            // Only try to update banner if there's weather data
            const bannerText = document.getElementById('weather-banner').textContent;
            if (bannerText && bannerText.includes(':')) {
                const condition = bannerText.split(': ')[1];
                if (condition) {
                    updateBanner(condition);
                }
            }

            document.getElementById('location').placeholder = lang === 'en' ? translations.en.locationPlaceholder : "Inserisci la località";
            document.querySelector('.location-input button').textContent = lang === 'en' ? translations.en.updateButton : "Aggiorna";
            updateAdvancedButtonText();
        }

        function updateDayCards(lang) {
            document.querySelectorAll('#day-cards .day-card').forEach(card => {
                const day = card.getAttribute('data-day');
                const text = lang === 'en' ? translations.en.daySelector[day] : card.getAttribute('data-original-text');
                card.textContent = text;
            });
        }

        function updateAdvancedButtonText() {
            const button = document.getElementById('toggle-advanced');
            const lang = document.getElementById('lang-en').classList.contains('active') ? 'en' : 'it';
            const isAdvancedVisible = document.querySelector('.advanced-weather-info').style.display !== 'none';
            if (lang === 'en') {
                button.textContent = isAdvancedVisible ? translations.en.hideAdvancedInfoButton : translations.en.advancedInfoButton;
            } else {
                button.textContent = isAdvancedVisible ? "Nascondi Informazioni Avanzate" : "Mostra Informazioni Avanzate";
            }
        }

        function createDayCards() {
            const container = document.getElementById('day-cards');
            const values = [-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7];
            const italianTexts = [
                "7 Giorni Prima","6 Giorni Prima","5 Giorni Prima","4 Giorni Prima",
                "3 Giorni Prima","2 Giorni Prima","Ieri","Oggi","Domani",
                "2 Giorni Dopo","3 Giorni Dopo","4 Giorni Dopo","5 Giorni Dopo",
                "6 Giorni Dopo","7 Giorni Dopo"
            ];
            container.innerHTML = '';
            values.forEach((v, idx) => {
                const card = document.createElement('div');
                card.className = 'day-card rounded-xl px-3 py-2 bg-white/20 cursor-pointer snap-center';
                card.setAttribute('data-day', v);
                card.setAttribute('data-original-text', italianTexts[idx]);
                card.textContent = translations.en.daySelector[v];
                card.addEventListener('click', () => {
                    selectedDay = parseInt(v);
                    document.querySelectorAll('#day-cards .day-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    fetchWeather(storedCoords ? storedCoords.lat : undefined, storedCoords ? storedCoords.lon : undefined);
                });
                if (v === 0) card.classList.add('selected');
                container.appendChild(card);
            });
        }

        function fetchWeather(lat, lon) {
            const locationInput = document.getElementById('location').value || 'Rome';
            const dayOffset = selectedDay;
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + dayOffset);
            const formattedDate = currentDate.toISOString().split('T')[0];

            document.getElementById('weather-banner').textContent = 'Loading weather conditions...';

            const requestWeather = (latitude, longitude) => {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,weathercode,surface_pressure,visibility,windspeed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_hours,windspeed_10m_max,windgusts_10m_max,uv_index_max,rain_sum,showers_sum,snowfall_sum&current_weather=true&timezone=auto&start_date=${formattedDate}&end_date=${formattedDate}`;
                return fetch(url).then(r => r.json());
            };

            const getCoords = () => {
                return fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationInput)}&count=1&language=it&format=json`)
                    .then(r => r.json())
                    .then(geoData => {
                        if (geoData.results && geoData.results.length > 0) {
                            return { latitude: geoData.results[0].latitude, longitude: geoData.results[0].longitude };
                        }
                        throw new Error('Location not found');
                    });
            };

            const coordPromise = lat && lon ? Promise.resolve({ latitude: lat, longitude: lon }) : getCoords();

            coordPromise
                .then(coords => {
                    storedCoords = { lat: coords.latitude, lon: coords.longitude };
                    localStorage.setItem('lastLocation', locationInput);
                    localStorage.setItem('lastCoords', JSON.stringify(storedCoords));
                    return requestWeather(coords.latitude, coords.longitude);
                })
                .then(data => {
                    const currentWeather = data.current_weather;
                    const dailyData = data.daily;
                    const hourlyData = data.hourly;

                    document.getElementById('datetime').textContent = `${formattedDate}, ${currentWeather.time.split('T')[1]}`;
                    document.getElementById('temperature').textContent = `${currentWeather.temperature}°C`;
                    document.getElementById('wind-speed').textContent = `${currentWeather.windspeed} km/h`;
                    document.getElementById('precipitation').textContent = `${dailyData.precipitation_sum[0]} mm`;
                    
                    document.getElementById('humidity').textContent = `${hourlyData.relativehumidity_2m[0]}%`;
                    document.getElementById('uv-index').textContent = dailyData.uv_index_max[0].toFixed(1);
                    document.getElementById('sunrise').textContent = dailyData.sunrise[0].split('T')[1];
                    document.getElementById('sunset').textContent = dailyData.sunset[0].split('T')[1];
                    document.getElementById('visibility').textContent = `${(hourlyData.visibility[0] / 1000).toFixed(1)} km`;
                    document.getElementById('pressure').textContent = `${hourlyData.surface_pressure[0].toFixed(0)} hPa`;
                    
                    document.getElementById('precipitation-probability').textContent = `${hourlyData.precipitation_probability[0]}%`;
                    document.getElementById('precipitation-hours').textContent = `${dailyData.precipitation_hours[0]} hours`;
                    document.getElementById('rain-sum').textContent = `${dailyData.rain_sum[0]} mm`;
                    document.getElementById('showers-sum').textContent = `${dailyData.showers_sum[0]} mm`;
                    document.getElementById('snowfall-sum').textContent = `${dailyData.snowfall_sum[0]} cm`;
                    document.getElementById('windgusts').textContent = `${dailyData.windgusts_10m_max[0]} km/h`;

                    const hourlyContainer = document.getElementById('hourly-forecast');
                    const hourDetails = document.getElementById('hour-details');
                    hourlyContainer.innerHTML = '';
                    hourDetails.textContent = '';
                    const interval = 3;
                    for (let i = 0; i < hourlyData.time.length; i += interval) {
                        const card = document.createElement('div');
                        card.className = 'day-card rounded-xl px-3 py-2 bg-white/20 cursor-pointer snap-center';
                        card.innerHTML = `<span class="text-sm">${hourlyData.time[i].split('T')[1].slice(0,5)}</span><span>${hourlyData.temperature_2m[i]}°C</span>`;
                        card.addEventListener('click', () => {
                            document.querySelectorAll('#hourly-forecast .day-card').forEach(c => c.classList.remove('selected'));
                            card.classList.add('selected');
                            hourDetails.innerHTML = `Humidity: ${hourlyData.relativehumidity_2m[i]}% - Precip: ${hourlyData.precipitation_probability[i]}%`;
                        });
                        if (i === 0) {
                            card.classList.add('selected');
                            hourDetails.innerHTML = `Humidity: ${hourlyData.relativehumidity_2m[i]}% - Precip: ${hourlyData.precipitation_probability[i]}%`;
                        }
                        hourlyContainer.appendChild(card);
                    }

                    updateBanner(getWeatherCondition(currentWeather.weathercode));
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    alert('Unable to retrieve weather data. Check the connection or input parameters.');
                    document.getElementById('weather-banner').textContent =
                        'Unable to retrieve weather data.';
                });
        }

        function getWeatherCondition(weathercode) {
            const weatherConditions = {
                0: 'Sunny',
                1: 'Slightly Cloudy',
                2: 'Partly Cloudy',
                3: 'Cloudy',
                45: 'Foggy',
                48: 'Foggy',
                51: 'Drizzle',
                53: 'Drizzle',
                55: 'Drizzle',
                61: 'Rain',
                63: 'Rain',
                65: 'Rain',
                71: 'Snow',
                73: 'Snow',
                75: 'Snow',
                95: 'Thunderstorm',
                96: 'Thunderstorm',
                99: 'Thunderstorm'
            };
            return weatherConditions[weathercode] || 'Variable Conditions';
        }

        function getItalianWeatherCondition(englishCondition) {
            const conditions = {
                'Sunny': 'Soleggiato',
                'Slightly Cloudy': 'Leggermente Nuvoloso',
                'Partly Cloudy': 'Parzialmente Nuvoloso',
                'Cloudy': 'Nuvoloso',
                'Foggy': 'Nebbia',
                'Drizzle': 'Piovigine',
                'Rain': 'Pioggia',
                'Snow': 'Neve',
                'Thunderstorm': 'Temporale',
                'Windy': 'Ventoso',
                'Variable Conditions': 'Condizioni Variabili'
            };
            return conditions[englishCondition] || 'Condizioni Variabili';
        }

        function updateBanner(condition) {
            if (!condition) {
                condition = 'Variable Conditions'; // Default fallback
            }
            
            const banner = document.getElementById('weather-banner');
            const background = document.querySelector('.weather-background');
            banner.classList.remove('sunny', 'rainy', 'partly-cloudy', 'cloudy', 'snowy', 'foggy', 'thunderstorm', 'windy');
            background.classList.remove('sunny', 'rainy', 'cloudy', 'snowy', 'thunderstorm');
            
            let conditionClass = '';
            let conditionText = '';
            
            switch(condition.toLowerCase()) {
                case 'sunny':
                    conditionClass = 'sunny';
                    conditionText = 'Sunny';
                    break;
                case 'rain':
                case 'drizzle':
                    conditionClass = 'rainy';
                    conditionText = condition === 'rain' ? 'Rain' : 'Drizzle';
                    break;
                case 'foggy':
                case 'cloudy':
                case 'slightly cloudy':
                    conditionClass = 'cloudy';
                    conditionText = condition === 'foggy' ? 'Foggy' : (condition === 'cloudy' ? 'Cloudy' : 'Slightly Cloudy');
                    break;
                case 'snow':
                    conditionClass = 'snowy';
                    conditionText = 'Snow';
                    break;
                case 'thunderstorm':
                    conditionClass = 'thunderstorm';
                    conditionText = 'Thunderstorm';
                    break;
                case 'windy':
                    conditionClass = 'cloudy'; // Using cloudy animation for windy
                    conditionText = 'Windy';
                    break;
                default:
                    conditionClass = 'cloudy';
                    conditionText = 'Variable Conditions';
            }
            
            const lang = document.getElementById('lang-en').classList.contains('active') ? 'en' : 'it';
            banner.classList.add(conditionClass);
            background.classList.add(conditionClass);
            if (lang === 'en') {
                banner.textContent = `Current Weather Conditions: ${conditionText}`;
            } else {
                banner.textContent = `Condizioni Meteo Attuali: ${getItalianWeatherCondition(conditionText)}`;
            }
            updateWeatherIcon(conditionText);
        }

        function updateWeatherIcon(condition) {
            const iconSvg = document.getElementById('weather-icon');
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

            iconSvg.innerHTML = iconContent;
        }

        function toggleAdvancedInfo() {
            const advancedSection = document.querySelector('.advanced-weather-info');
            advancedSection.style.display = advancedSection.style.display === 'none' ? 'grid' : 'none';
            updateAdvancedButtonText();
        }

        function useCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    fetchWeather(pos.coords.latitude, pos.coords.longitude);
                }, () => {
                    alert('Unable to retrieve your location');
                });
            } else {
                alert('Geolocation is not supported by this browser.');
            }
        }
