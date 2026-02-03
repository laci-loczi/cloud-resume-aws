// APIs
const BASE_API_URL = "https://uh49oub8hh.execute-api.eu-north-1.amazonaws.com/default/ResumeCounter"; 
const STATUS_API_URL = "https://l7cncxdfwh.execute-api.eu-north-1.amazonaws.com/default/PortfolioStatusAPI";
const WEATHER_API_URL = "https://kx2f67wdlu4tzvlpxl6mkny6wa0bcwnv.lambda-url.eu-north-1.on.aws/";

// welome logic
function startSession(event, lang, url) {
    event.preventDefault();
    sessionStorage.setItem('lang_pref', lang);

    const loaderText = document.querySelector('.loader-text');
    if (!loaderText) return;

    if (lang === 'hu') {
        loaderText.innerText = "> KAPCSOLAT_LÉTESÍTÉSE...";
    } else {
        loaderText.innerText = "> ESTABLISHING_CONNECTION...";
    }

    document.getElementById('main-container').classList.add('fading');
    const loader = document.getElementById('loader');
    loader.classList.add('active');

    setTimeout(() => {
        const progFill = document.getElementById('prog-fill');
        if (progFill) progFill.style.width = "100%";
    }, 100);

    setTimeout(() => {
        window.location.href = url;
    }, 1200);
}

// particles init logic
(async () => {
    await tsParticles.load("tsparticles", {
        particles: {
            color: { value: "#38bdf8" },
            links: { enable: true, color: "#38bdf8", distance: 150, opacity: 0.2, width: 1 },
            move: { enable: true, speed: 1 },
            number: { value: 60, density: { enable: true, area: 800 } },
            opacity: { value: 0.3 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } }
        },
        interactivity: {
            events: { onHover: { enable: true, mode: "grab" }, onClick: { enable: true, mode: "push" } },
            modes: { grab: { distance: 140, links: { opacity: 0.5 } } }
        }
    });
})();

// visitor counter logic
document.addEventListener("DOMContentLoaded", () => {
    const counterElement = document.getElementById('counter');
    if(!counterElement) return; 

    const hasVisited = sessionStorage.getItem('visited');
    let finalUrl = BASE_API_URL;

    if (hasVisited) {
        finalUrl = BASE_API_URL + "?mode=read";
    } else {
        sessionStorage.setItem('visited', 'true');
    }

    fetch(finalUrl)
        .then(res => res.json())
        .then(data => { counterElement.innerText = data; })
        .catch(err => { console.error("API Error:", err); counterElement.innerText = "-"; });
});

// modal logic
function toggleModal() {
    const modal = document.getElementById('archModal');
    if (modal) {
        modal.classList.toggle('active');
    }
}

document.addEventListener('click', function(e) {
    const modal = document.getElementById('archModal');
    if (modal && e.target === modal) {
        toggleModal();
    }
});

// chart logic
document.addEventListener("DOMContentLoaded", () => {
    if(document.getElementById('uptimeChart')) {
        loadStatusData();
    }
});

function loadStatusData() {
    fetch(STATUS_API_URL)
        .then(res => res.json())
        .then(data => {
            renderChart(data);
        })
        .catch(err => console.error("Status load failed", err));
}

function renderChart(apiData) {
    const ctx = document.getElementById('uptimeChart').getContext('2d');
    
    if (!apiData['Google'] || !apiData['Google'].data || apiData['Google'].data.length === 0) {
        return;
    }

    const labels = apiData['Google'].data.map(item => {
        const date = new Date(item.t * 1000);
        return date.getHours() + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes();
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `Google (Avg: ${apiData['Google'].average}ms)`,
                    data: apiData['Google'].data.map(i => i.y),
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    fill: true
                },
                {
                    label: `AWS (Avg: ${apiData['AWS'].average}ms)`,
                    data: apiData['AWS'].data.map(i => i.y),
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: `GitHub (Avg: ${apiData['GitHub'].average}ms)`,
                    data: apiData['GitHub'].data.map(i => i.y),
                    borderColor: '#a855f7',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#94a3b8' } },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: {
                    grid: { color: '#1e293b' },
                    ticks: { color: '#64748b' },
                    beginAtZero: true
                },
                x: { display: false }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
    });
}

function toggleFlip() {
    const wrapper = document.getElementById('flip-wrapper');
    const btn = document.getElementById('btn-info');
    
    wrapper.classList.toggle('is-flipped');
    
    if (wrapper.classList.contains('is-flipped')) {
        btn.innerHTML = '<i class="fas fa-times"></i>';
        btn.style.borderColor = '#ef4444';
        btn.style.color = '#ef4444';
    } else {
        btn.innerHTML = '<i class="fas fa-info"></i>';
        btn.style.borderColor = '#334155';
        btn.style.color = '#38bdf8';
    }
}

// weather logic
function getSimulationData(code) {
    switch(code) {
        case 'SIM_CLEAR': return { weather: 'Clear', temp: 22 };
        case 'SIM_RAIN':  return { weather: 'Rain', temp: 15 };
        case 'SIM_SNOW':  return { weather: 'Snow', temp: -2 };
        case 'SIM_STORM': return { weather: 'Thunderstorm', temp: 18 };
        case 'SIM_COLD':  return { weather: 'Clear', temp: -10 }; 
        case 'SIM_HOT':   return { weather: 'Clear', temp: 35 };  
        default:          return { weather: 'Clear', temp: 20 };
    }
}

async function updateWeatherTheme(selection) {
    try {
        let data;

        if (selection.startsWith('SIM_')) {
            data = getSimulationData(selection);
        } else {
            const response = await fetch(`${WEATHER_API_URL}?city=${selection}`);
            data = await response.json();
            if (data.error) throw new Error(data.error);
        }

        const tempDisplay = document.getElementById('temp-display');
        if (tempDisplay) {
            tempDisplay.innerText = `${Math.round(data.temp)}°C`;
            tempDisplay.classList.remove('frozen-temp', 'hot-temp');
        }

        const container = tsParticles.domItem(0);
        if (!container) return;

        const weather = data.weather;
        const temp = data.temp;

        const colors = {
            default: "#0f172a",
            rain: "#0b0e14",
            snow: "#4c7394",
            freezing: "#050a14",
            hot: "#1a0d0d"
        };

        container.options.particles.color.value = "#38bdf8";
        container.options.particles.links.enable = true;
        container.options.particles.links.color = "#38bdf8";
        container.options.particles.links.opacity = 0.2;
        container.options.particles.size.value = { min: 1, max: 3 };
        container.options.particles.number.value = 60;
        container.options.particles.move.speed = 1.5;
        container.options.particles.move.direction = "none";
        container.options.particles.move.straight = false;
        container.options.particles.shape.type = "circle";
        container.options.particles.shape.character = {}; 
        container.options.particles.rotate = { value: 0, animation: { enable: false } }; 

        if (container.options.particles.wobble) container.options.particles.wobble.enable = false;

        document.body.style.backgroundColor = colors.default;

        if (weather === 'Rain' || weather === 'Drizzle' || weather === 'Thunderstorm') {
            document.body.style.backgroundColor = colors.rain;
            container.options.particles.number.value = 80; 
            container.options.particles.shape.type = "char"; 
            container.options.particles.shape.character = {
                value: ["|", "💧"], 
                font: "Verdana", 
                style: "", 
                weight: "400"
            };
            container.options.particles.color.value = "#38bdf8";
            container.options.particles.size.value = { min: 4, max: 8 };
            container.options.particles.move.speed = { min: 10, max: 15 }; 
            container.options.particles.move.direction = "bottom";
            container.options.particles.move.straight = true;
            container.options.particles.links.enable = false;
        }
        else if (weather === 'Snow') {
            document.body.style.backgroundColor = colors.snow;
            container.options.particles.number.value = 150;
            container.options.particles.color.value = "#ffffff";
            container.options.particles.shape.type = "circle";
            container.options.particles.size.value = { min: 1, max: 5 };
            container.options.particles.move.speed = 1.2;
            container.options.particles.move.direction = "bottom";
            container.options.particles.links.enable = false;
            if (container.options.particles.wobble) container.options.particles.wobble.enable = true;
        }
        else if (temp <= 0) {
            document.body.style.backgroundColor = colors.freezing;
            container.options.particles.color.value = ["#caf0f8", "#00b4d8", "#ffffff"];
            container.options.particles.number.value = 100;
            container.options.particles.move.speed = 0.5;
            container.options.particles.links.enable = true;
            if (tempDisplay) tempDisplay.classList.add('frozen-temp');
        }
        else if (temp >= 30) {
            document.body.style.backgroundColor = colors.hot;
            container.options.particles.color.value = ["#fbbf24", "#ef4444"];         
            container.options.particles.move.direction = "top";
            container.options.particles.move.speed = 3; 
            container.options.particles.links.color = "#ef4444";
            if (tempDisplay) tempDisplay.classList.add('hot-temp');
        }
        
        await container.refresh();

    } catch (err) {
        console.error("Weather theme error:", err);
    }
}


// ui logic
document.addEventListener('DOMContentLoaded', () => {
    
    const infoBtn = document.getElementById('weather-info-btn');
    const tooltip = document.getElementById('weather-tooltip');
    const closeBtn = document.getElementById('tooltip-close');

    if (infoBtn && tooltip) {
        infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tooltip.classList.toggle('active');
        });
        if(closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tooltip.classList.remove('active');
            });
        }
        document.addEventListener('click', (e) => {
            if (!tooltip.contains(e.target) && e.target !== infoBtn) {
                tooltip.classList.remove('active');
            }
        });
    }

    const citySelect = document.getElementById('city-select');
    const customUi = document.getElementById('custom-select-ui');
    const customOptionsContainer = document.getElementById('custom-options');
    const currentSelectionSpan = customUi.querySelector('.current-selection');
    const wrapper = document.querySelector('.custom-select-wrapper');

    if (citySelect && customUi) {
        
        customOptionsContainer.innerHTML = ''; 
        Array.from(citySelect.options).forEach(option => {
            if (!option.value) return; 

            const div = document.createElement('div');
            div.className = 'custom-option';
            div.textContent = option.text;
            div.dataset.value = option.value;

            if (option.value === citySelect.value) {
                div.classList.add('selected');
                currentSelectionSpan.textContent = option.text;
            }

            div.addEventListener('click', () => {
                citySelect.value = option.value;
                citySelect.dispatchEvent(new Event('change'));
                wrapper.classList.remove('open');
            });

            customOptionsContainer.appendChild(div);
        });

        customUi.addEventListener('click', (e) => {
            e.stopPropagation();
            wrapper.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
        });

        citySelect.addEventListener('change', (e) => {
            const val = e.target.value;
            
            updateWeatherTheme(val);

            const selectedOption = citySelect.options[citySelect.selectedIndex];
            if(selectedOption) {
                 currentSelectionSpan.textContent = selectedOption.text;
                 
                 document.querySelectorAll('.custom-option').forEach(el => {
                    el.classList.remove('selected');
                    if (el.dataset.value === val) el.classList.add('selected');
                });
            }
        });

        updateWeatherTheme(citySelect.value);
        autoDetectLocation();
    }
});

// auto detect using ip logic
async function autoDetectLocation() {
    try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await response.json();
        const detectedCity = data.city;
        console.log(`Detected: ${detectedCity}`);

        const citySelect = document.getElementById('city-select');
        if (!citySelect) return;

        let exists = false;
        for (let i = 0; i < citySelect.options.length; i++) {
            if (citySelect.options[i].value === detectedCity) {
                exists = true;
                break;
            }
        }

        if (exists && citySelect.value !== detectedCity) {
            citySelect.value = detectedCity;
            citySelect.dispatchEvent(new Event('change'));
            console.log("Auto-switched to detected city.");
        }

    } catch (error) {
        console.warn("Auto-detect failed, staying on default.");
    }
}