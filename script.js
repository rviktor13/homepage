document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Elemek kiválasztása --- (Változatlan)
    const clockContainer = document.getElementById('clock-container');
    // ... (a többi elem kiválasztása változatlan) ...
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const bgUrlInput = document.getElementById('bg-url-input');
    const bgSetButton = document.getElementById('bg-set-button');
    const weatherText = document.getElementById('weather-text');
    const cityInput = document.getElementById('city-input');
    const citySetButton = document.getElementById('city-set-button');
    const weatherIcon = document.getElementById('weather-icon');
    const wheel = document.querySelector('.wheel');
    const centerLabel = document.getElementById('center-label');
    const addLinkBtn = document.getElementById('add-link-btn');
    const modal = document.getElementById('add-link-modal');
    const modalLabelInput = document.getElementById('link-label-input');
    const modalUrlInput = document.getElementById('link-url-input');
    const saveLinkBtn = document.getElementById('save-link-btn');
    const cancelLinkBtn = document.getElementById('cancel-link-btn');
    const themeToggle = document.getElementById('theme-toggle');
    let wheelLinks = [];

    // --- 2. Óra, Háttérkép, Kereső ---
    
    // MÓDOSÍTOTT ÓRA FUNKCIÓ
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        if (clockContainer) {
            // MÓDOSÍTVA: innerHTML-t használunk, hogy a másodperc külön span-be kerüljön
            clockContainer.innerHTML = `<span>${hours}:${minutes}</span><span class="clock-seconds">:${seconds}</span>`;
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

    function performSearch() {
        const query = searchInput.value;
        if (query) window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => e.key === 'Enter' && performSearch());

    // --- 3. Időjárás (Változatlan) ---
    const wmoCodesHu = { 0: 'Tiszta ég', 1: 'Többnyire tiszta', 2: 'Részben felhős', 3: 'Borult', 45: 'Köd', 48: 'Deres köd', 51: 'Enyhe szitálás', 53: 'Mérsékelt szitálás', 55: 'Erős szitálás', 61: 'Enyhe eső', 63: 'Mérsékelt eső', 65: 'Erős eső', 71: 'Enyhe havazás', 73: 'Mérsékelt havazás', 75: 'Erős havazás', 80: 'Enyhe zápor', 81: 'Mérsékelt zápor', 82: 'Erős zápor', 95: 'Zivatar' };
    const wmoIconMap = { '0': 'fa-sun', '1': 'fa-cloud-sun', '2': 'fa-cloud', '3': 'fa-cloud', '45': 'fa-smog', '48': 'fa-smog', '51': 'fa-cloud-rain', '53': 'fa-cloud-rain', '55': 'fa-cloud-rain', '61': 'fa-cloud-showers-heavy', '63': 'fa-cloud-showers-heavy', '65': 'fa-cloud-showers-heavy', '71': 'fa-snowflake', '73': 'fa-snowflake', '75': 'fa-snowflake', '80': 'fa-cloud-showers-heavy', '81': 'fa-cloud-showers-heavy', '82': 'fa-cloud-showers-heavy', '95': 'fa-cloud-bolt' };
    
    async function fetchWeather(cityName) {
        weatherText.textContent = 'Adatok lekérése...';
        weatherIcon.className = 'fa-solid fa-spinner fa-spin';
        try {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=hu&format=json`;
            const geoResponse = await fetch(geoUrl);
            if (!geoResponse.ok) throw new Error('Geocoding hiba.');
            const geoData = await geoResponse.json();
            if (!geoData.results || geoData.results.length === 0) throw new Error('Település nem található.');
            const location = geoData.results[0];
            const { latitude: lat, longitude: lon, name: locationName } = location;
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`;
            const weatherResponse = await fetch(weatherUrl);
            if (!weatherResponse.ok) throw new Error('Weather hiba.');
            const weatherData = await weatherResponse.json();
            const temperature = Math.round(weatherData.current_weather.temperature);
            const weatherCode = weatherData.current_weather.weathercode;
            const description = wmoCodesHu[weatherCode] || 'Ismeretlen időjárás';
            weatherText.textContent = `${locationName}: ${temperature}°C, ${description}`;
            const iconClass = wmoIconMap[weatherCode.toString()] || 'fa-circle-question';
            weatherIcon.className = `fa-solid ${iconClass}`;
        } catch (error) {
            console.error('Időjárás hiba:', error);
            weatherText.textContent = error.message.includes('Település') ? error.message : 'Hiba a lekéréskor.';
            weatherIcon.className = 'fa-solid fa-triangle-exclamation';
        }
    }
    citySetButton.addEventListener('click', () => {
        const newCity = cityInput.value;
        if (newCity) {
            localStorage.setItem('userCity', newCity);
            fetchWeather(newCity);
        }
    });
    cityInput.addEventListener('keyup', (e) => e.key === 'Enter' && citySetButton.click());
    function loadWeatherOnStart() {
        const savedCity = localStorage.getItem('userCity');
        if (savedCity) {
            cityInput.value = savedCity;
            fetchWeather(savedCity);
        } else {
            weatherText.textContent = 'Állíts be egy települést!';
            weatherIcon.className = 'fa-solid fa-map-marker-alt';
        }
    }

    // --- 4. Fánk-kerék Kezelése (Változatlan) ---
    const defaultLinks = [
        { label: "Google", url: "https://google.com" },
        { label: "YouTube", url: "https://youtube.com" },
        { label: "Facebook", url: "https://facebook.com" },
        { label: "Reddit", url: "https://reddit.com" },
        { label: "GitHub", url: "https://github.com" },
        { label: "Wikipedia", url: "https://wikipedia.org" }
    ];
    function saveLinks() {
        localStorage.setItem('wheelLinks', JSON.stringify(wheelLinks));
        renderWheel();
    }
    function renderWheel() {
        const oldItems = wheel.querySelectorAll('.wheel-item');
        oldItems.forEach(item => item.remove());
        const numItems = wheelLinks.length;
        if (numItems === 0) return;
        const angle = 360 / numItems;
        wheelLinks.forEach((link, i) => {
            const a = document.createElement('a');
            a.className = 'wheel-item';
            a.href = link.url;
            a.target = '_blank';
            a.dataset.label = link.label;
            a.style.setProperty('--i', i);
            a.style.setProperty('--angle', `${angle}deg`);
            const img = document.createElement('img');
            try {
                const domain = new URL(link.url).hostname;
                img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            } catch (e) {
                img.src = '';
            }
            img.onerror = () => { img.src = 'https://via.placeholder.com/40/ccc/000?text=?'; };
            a.appendChild(img);
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-link-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = `"${link.label}" törlése`;
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm(`Biztosan törölni szeretnéd ezt a linket: "${link.label}"?`)) {
                    wheelLinks.splice(i, 1);
                    saveLinks();
                }
            });
            a.appendChild(removeBtn);
            a.addEventListener('mouseenter', () => {
                centerLabel.textContent = link.label;
            });
            a.addEventListener('mouseleave', () => {
                centerLabel.textContent = '';
            });
            wheel.appendChild(a);
        });
    }
    function loadLinks() {
        const savedLinks = localStorage.getItem('wheelLinks');
        if (savedLinks) {
            wheelLinks = JSON.parse(savedLinks);
        } else {
            wheelLinks = [...defaultLinks];
        }
        renderWheel();
    }
    
    // --- 5. Modal Eseménykezelők (Változatlan) ---
    addLinkBtn.addEventListener('click', () => {
        modalLabelInput.value = '';
        modalUrlInput.value = '';
        modal.style.display = 'flex';
        modalLabelInput.focus();
    });
    cancelLinkBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    saveLinkBtn.addEventListener('click', () => {
        let label = modalLabelInput.value.trim();
        let url = modalUrlInput.value.trim();
        if (!label || !url) {
            alert('Kérlek, töltsd ki mindkét mezőt!');
            return;
        }
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        wheelLinks.push({ label, url });
        saveLinks();
        modal.style.display = 'none';
    });

    // --- 6. Indítás (Változatlan) ---
    loadWeatherOnStart();
    loadLinks();

    // --- 7. ÚJ: Téma Kezelése ---
    
    // Eseményfigyelő a kapcsolóra
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            // Sötét mód bekapcsolása
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            // Világos mód (alapértelmezett)
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });

    // Téma betöltése oldal indulásakor
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.checked = true;
        }
        // Ha 'light' vagy null, nem csinálunk semmit, mert az az alapértelmezett
    }
    
    loadTheme(); // Meghívjuk az új funkciót is

});