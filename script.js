document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Elemek kiválasztása ---
    const clockContainer = document.getElementById('clock-container');
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
    const bgFileInput = document.getElementById('bg-file-input');
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsContent = document.getElementById('settings-content');
    
    // Teendőlista elemei
    const todoList = document.getElementById('todo-list');
    const todoInput = document.getElementById('todo-input');

    // Naptár elemek
    const calendarUrlInput = document.getElementById('calendar-url-input');
    const calendarSetButton = document.getElementById('calendar-set-button');
    const calendarIframe = document.getElementById('calendar-iframe');
    const calendarHelpToggle = document.getElementById('calendar-help-toggle');
    const calendarHelpText = document.getElementById('calendar-help-text');
    const calendarWidget = document.getElementById('calendar-widget'); // A naptár widget konténere

    let wheelLinks = [];
    let todoItems = [];


    // --- 2. Óra, Háttérkép, Kereső ---

    // Digitális óra frissítése
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        if (clockContainer) {
            clockContainer.innerHTML = `<span>${hours}:${minutes}</span><span class="clock-seconds">:${seconds}</span>`;
        }
    }

    // Óra indítása és frissítése
    updateClock();
    setInterval(updateClock, 1000);

    // Mentett háttérkép betöltése (URL vagy Data URL)
    const savedBg = localStorage.getItem('backgroundImageUrl');
    if (savedBg) {
        document.body.style.backgroundImage = `url(${savedBg})`;
        if (savedBg.startsWith('http')) {
            bgUrlInput.value = savedBg;
        }
    }

    // Háttérkép beállítása URL-ből
    bgSetButton.addEventListener('click', () => {
        const newBgUrl = bgUrlInput.value;
        if (newBgUrl) {
            document.body.style.backgroundImage = `url(${newBgUrl})`;
            localStorage.setItem('backgroundImageUrl', newBgUrl);
        }
    });

    // Háttérkép beállítása fájlból
    bgFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                document.body.style.backgroundImage = `url(${dataUrl})`;
                try {
                    localStorage.setItem('backgroundImageUrl', dataUrl);
                } catch (error) {
                    if (error.name === 'QuotaExceededError') {
                        alert('A kép túl nagy, hogy elmentsük. A háttér frissítés után el fog tűnni, de ebben a munkamenetben használhatod.');
                    } else {
                        console.error('Hiba a háttér mentésekor:', error);
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    });

    // Kereső
    function performSearch() {
        const query = searchInput.value;
        if (query) window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => e.key === 'Enter' && performSearch());

    // --- 3. Időjárás ---
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

    // --- 4. Fánk-kerék Kezelése ---
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
            
            // --- Favicon / Betűs Ikon Logika ---

            // 1. Hozz létre egy div-et a betűnek (ez az alapértelmezett, látható)
            const letterIcon = document.createElement('div');
            letterIcon.className = 'wheel-item-letter';
            const firstLetter = link.label ? link.label[0].toUpperCase() : '?';
            letterIcon.textContent = firstLetter;
            a.appendChild(letterIcon);

            // 2. Hozz létre egy képet (alapból rejtett a CSS miatt)
            const img = document.createElement('img');
            
            // 3. Eseménykezelő, MIUTÁN betöltődött
            img.onload = () => {
                if (img.naturalWidth > 16) { 
                    img.style.opacity = '1';
                    letterIcon.style.opacity = '0';
                }
            };
            
            // 4. Eseménykezelő, HA TÉNYLEG hiba van (pl. 404)
            img.onerror = () => {
                // Nem csinálunk semmit
            };

            // 5. Indítsd el a kép betöltését
            try {
                const domain = new URL(link.url).hostname;
                img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            } catch (e) {
                // Invalid URL
            }
            
            a.appendChild(img);

            // --- Logika vége ---

            // Törlés gomb létrehozása
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

            // Hover eseménykezelők
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
    
    // --- 5. Modal Eseménykezelők ---
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

    // --- 6. Téma Kezelése ---
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });

    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.checked = true;
        }
    }
    
    // --- 7. Beállítások Menü Kezelése ---
    settingsToggle.addEventListener('click', () => {
        settingsContent.classList.toggle('open');
    });

    // --- 8. Teendőlista (To-Do) Kezelése ---
    function renderTodos() {
        if (!todoList) return;
        todoList.innerHTML = '';
        if (todoItems.length === 0) {
            todoList.innerHTML = '<p class="empty-todo">Nincsenek teendőid. Adj hozzá egyet!</p>';
        }
        todoItems.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'todo-item';
            if (item.checked) {
                itemEl.classList.add('checked');
            }
            const checkbox = document.createElement('div');
            checkbox.className = 'checkbox';
            checkbox.innerHTML = '<i class="fa-solid fa-check"></i>';
            const text = document.createElement('span');
            text.textContent = item.text;
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-todo';
            deleteBtn.innerHTML = '&times;';
            const toggleHandler = () => {
                toggleTodo(index);
            };
            text.addEventListener('click', toggleHandler);
            checkbox.addEventListener('click', toggleHandler);
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTodo(index);
            });
            itemEl.appendChild(checkbox);
            itemEl.appendChild(text);
            itemEl.appendChild(deleteBtn);
            todoList.appendChild(itemEl);
        });
    }
    function addTodo(text) {
        if (text.trim() === '') return;
        todoItems.push({ text: text, checked: false });
        saveTodos();
    }
    function toggleTodo(index) {
        if (todoItems[index]) {
            todoItems[index].checked = !todoItems[index].checked;
            saveTodos();
        }
    }
    function deleteTodo(index) {
        if (todoItems[index]) {
            todoItems.splice(index, 1);
            saveTodos();
        }
    }
    function saveTodos() {
        localStorage.setItem('userTodos', JSON.stringify(todoItems));
        renderTodos();
    }
    function loadTodos() {
        if (!todoList) return;
        const savedTodos = localStorage.getItem('userTodos');
        if (savedTodos) {
            todoItems = JSON.parse(savedTodos);
        }
        renderTodos();
    }
    if (todoInput) {
        todoInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                addTodo(todoInput.value);
                todoInput.value = '';
            }
        });
    }
    const style = document.createElement('style');
    style.innerHTML = `
        .empty-todo {
            padding: 20px 10px;
            text-align: center;
            opacity: 0.5;
            user-select: none;
        }
    `;
    document.head.appendChild(style);
    
    // --- 9. Naptár Kezelése ---
    if (calendarHelpToggle) {
        calendarHelpToggle.addEventListener('click', () => {
            calendarHelpText.classList.toggle('open');
        });
    }

    if (calendarSetButton) {
        calendarSetButton.addEventListener('click', () => {
            const url = calendarUrlInput.value;
            // Ha a felhasználó érvényes linket ír be
            if (url && (url.includes('embed?src=') || url.includes('embed&src='))) { // Elfogadja mindkét Google formátumot
                calendarIframe.src = url;
                localStorage.setItem('calendarUrl', url);
                calendarWidget.classList.add('calendar-loaded');
            } else if (url.trim() === '') { // Ha a felhasználó kitörli a linket és ment
                calendarIframe.src = 'about:blank';
                localStorage.removeItem('calendarUrl');
                calendarWidget.classList.remove('calendar-loaded');
            } else { // Ha írt be valamit, de rosszat
                alert("Hibás link! Biztos, hogy a 'src=' linket másoltad ki a beágyazási kódból?");
            }
        });
    }

    function loadCalendar() {
        const savedUrl = localStorage.getItem('calendarUrl');
        if (savedUrl && calendarIframe) {
            calendarIframe.src = savedUrl;
            calendarUrlInput.value = savedUrl;
            calendarWidget.classList.add('calendar-loaded');
        } else if (calendarWidget) {
            calendarWidget.classList.remove('calendar-loaded');
        }
    }

    // --- 10. Indítás ---
    loadWeatherOnStart();
    loadLinks();
    loadTheme();
    loadTodos();
    loadCalendar(); // Naptár betöltése

});