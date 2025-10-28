document.addEventListener('DOMContentLoaded', () => {

    const clockContainer = document.getElementById('clock-container'); // ÚJ AZ ÓRÁHOZ
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const bgUrlInput = document.getElementById('bg-url-input');
    const bgSetButton = document.getElementById('bg-set-button');
    const weatherText = document.getElementById('weather-text');

    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        if (clockContainer) { // Ellenőrizzük, hogy létezik-e az elem
            clockContainer.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }
    updateClock();
    setInterval(updateClock, 1000);



    const savedBg = localStorage.getItem('backgroundImageUrl');
    if (savedBg) {
        document.body.style.backgroundImage = `url(${savedBg})`;
        bgUrlInput.value = savedBg;
    }
    bgSetButton.addEventListener('click', () => {
        const newBgUrl = bgUrlInput.value;
        if (newBgUrl) {
            document.body.style.backgroundImage = `url(${newBgUrl})`;
            localStorage.setItem('backgroundImageUrl', newBgUrl);
        }
    });


    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    function performSearch() {
        const query = searchInput.value;
        if (query) {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            window.open(searchUrl, '_blank');
        }
    }

    const wmoCodesHu = {
        0: 'Tiszta ég', 1: 'Többnyire tiszta', 2: 'Részben felhős',
        3: 'Borult', 45: 'Köd', 48: 'Deres köd', 51: 'Enyhe szitálás',
        53: 'Mérsékelt szitálás', 55: 'Erős szitálás', 61: 'Enyhe eső',

        63: 'Mérsékelt eső', 65: 'Erős eső', 71: 'Enyhe havazás',
        73: 'Mérsékelt havazás', 75: 'Erős havazás', 80: 'Enyhe zápor',
        81: 'Mérsékelt zápor', 82: 'Erős zápor', 95: 'Zivatar'
    };

    function getWeather() {
        weatherText.textContent = 'Időjárás töltése...';

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    const weatherPromise = fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`);
                    const geoPromise = fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=hu`);
                    const [weatherResponse, geoResponse] = await Promise.all([weatherPromise, geoPromise]);

                    if (!weatherResponse.ok || !geoResponse.ok) {
                        throw new Error('Hiba az adatok lekérésekor.');
                    }

                    const weatherData = await weatherResponse.json();
                    const geoData = await geoResponse.json();
                    const temperature = Math.round(weatherData.current_weather.temperature);
                    const weatherCode = weatherData.current_weather.weathercode;
                    const description = wmoCodesHu[weatherCode] || 'Ismeretlen időjárás';
                    const locationName = geoData.results?.[0]?.city || geoData.results?.[0]?.town || geoData.results?.[0]?.name || 'Ismeretlen helyszín';

                    weatherText.textContent = `${locationName}: ${temperature}°C, ${description}`;

                } catch (error) {
                    weatherText.textContent = 'Nem sikerült lekérni az időjárást.';
                    console.error('Időjárás hiba:', error);
                }
            }, () => {
                weatherText.textContent = 'Helymeghatározás letiltva.';
            });
        } else {
            weatherText.textContent = 'Böngésző nem támogatja a helymeghatározást.';
        }
    }
    
    getWeather();
});