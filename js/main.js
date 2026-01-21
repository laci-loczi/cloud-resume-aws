// api endpoints
const BASE_API_URL = "https://uh49oub8hh.execute-api.eu-north-1.amazonaws.com/default/ResumeCounter"; 
const STATUS_API_URL = "https://l7cncxdfwh.execute-api.eu-north-1.amazonaws.com/default/PortfolioStatusAPI";
const ARCH_API_URL = "https://6er0sghd22.execute-api.eu-north-1.amazonaws.com/default/PortfolioArchStats";
const WEATHER_API_URL = "https://kx2f67wdlu4tzvlpxl6mkny6wa0bcwnv.lambda-url.eu-north-1.on.aws/";
// welcome page logic
// language selection, triggers loading animation, goes to the main site
function startSession(event, lang, url) {
    event.preventDefault();
    sessionStorage.setItem('lang_pref', lang);

    const loaderText = document.querySelector('.loader-text');
    if (!loaderText) return;

    // loading text based on selected language
    if (lang === 'hu') {
        loaderText.innerText = "> KAPCSOLAT_LÉTESÍTÉSE...";
    } else {
        loaderText.innerText = "> ESTABLISHING_CONNECTION...";
    }

    // progress bar visual
    document.getElementById('main-container').classList.add('fading');
    const loader = document.getElementById('loader');
    loader.classList.add('active');

    setTimeout(() => {
        const progFill = document.getElementById('prog-fill');
        if (progFill) progFill.style.width = "100%";
    }, 100);

    // redirect after animation
    setTimeout(() => {
        window.location.href = url;
    }, 1200);
}

// particles logic
// background particle network effect init
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

// visitor logic
document.addEventListener("DOMContentLoaded", () => {
    const counterElement = document.getElementById('counter');
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

// monitoring logic
document.addEventListener("DOMContentLoaded", () => {
    if(document.getElementById('uptimeChart')) {
        loadStatusData();
    }
});

// last 24 logs and averages
function loadStatusData() {
    fetch(STATUS_API_URL)
        .then(res => res.json())
        .then(data => {
            renderChart(data);
        })
        .catch(err => console.error("Status load failed", err));
}

// multi-line chart using Chart.js and the api data
function renderChart(apiData) {
    const ctx = document.getElementById('uptimeChart').getContext('2d');
    
    // checking if data is available before render
    if (!apiData['Google'] || !apiData['Google'].data || apiData['Google'].data.length === 0) {
        console.log("Waiting for data...");
        return;
    }

    // formatting timestamps
    const labels = apiData['Google'].data.map(item => {
        const date = new Date(item.t * 1000);
        return date.getHours() + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes();
    });

    // creating chart with the api data 
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
                },
                {
                    label: `444 (Avg: ${apiData['444'] ? apiData['444'].average : 0}ms)`,
                    data: apiData['444'] ? apiData['444'].data.map(i => i.y) : [],
                    borderColor: '#ffff00',
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

// 3d flip logic
function toggleFlip() {
    const wrapper = document.getElementById('flip-wrapper');
    const btn = document.getElementById('btn-info');
    
    wrapper.classList.toggle('is-flipped');
    
    // info or 'x' icon
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

const citySelect = document.getElementById('city-select');
if (citySelect) {
    citySelect.addEventListener('change', (e) => updateWeatherTheme(e.target.value));
}

/* weather theme switching */
async function updateWeatherTheme(city) {
    try {
        const response = await fetch(`${WEATHER_API_URL}?city=${city}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        // tempature ui reset
        const tempDisplay = document.getElementById('temp-display');
        if (tempDisplay) {
            tempDisplay.innerText = `${Math.round(data.temp)}°C`;
            tempDisplay.classList.remove('frozen-temp', 'hot-temp');
        }

        const container = tsParticles.domItem(0);
        if (!container) return;

        const weather = data.weather;
        const temp = data.temp;

        // default colors
        const colors = {
            default: "#0f172a",
            rain: "#0b0e14",
            snow: "#6a90af",
            freezing: "#050a14",
            hot: "#1a0d0d"
        };

        // particles to default position
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
        container.options.particles.shadow.enable = false;
        
        // extra effects off, if they were on before
        if (container.options.particles.move.trail) container.options.particles.move.trail.enable = false;
        if (container.options.particles.wobble) container.options.particles.wobble.enable = false;

        // default bacgkorund
        document.body.style.backgroundColor = colors.default;

        // storm, rain
        if (weather === 'Rain' || weather === 'Drizzle' || weather === 'Thunderstorm') {
            document.body.style.backgroundColor = colors.rain;
            container.options.particles.number.value = 200;
            container.options.particles.shape.type = "line";
            container.options.particles.size.value = { min: 1, max: 2 };
            container.options.particles.move.speed = 25;
            container.options.particles.move.direction = "bottom";
            container.options.particles.move.straight = true;
            container.options.particles.links.enable = false;

            if (weather === 'Thunderstorm') {
                triggerLightningEffect(container);
            }
        } 
        // snowing
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
        // very cold
        else if (temp <= 0) {
            document.body.style.backgroundColor = colors.freezing;
            container.options.particles.color.value = "#e0f2fe";
            container.options.particles.links.color = "#e0f2fe";
            container.options.particles.move.speed = 0.2;
            container.options.particles.shadow.enable = true;
            container.options.particles.shadow.color = "#38bdf8";
            container.options.particles.shadow.blur = 15;
            if (tempDisplay) tempDisplay.classList.add('frozen-temp');
        }
        // very hot
        else if (temp >= 30) {
            document.body.style.backgroundColor = colors.hot;
            container.options.particles.color.value = "#ef4444";
            container.options.particles.links.color = "#f97316";
            container.options.particles.move.speed = 4;
            if (tempDisplay) tempDisplay.classList.add('hot-temp');
        }

        // updating
        await container.refresh();

    } catch (err) {
        console.error("Weather theme error:", err);
    }
}

// lightning if thunderstorm
function triggerLightningEffect(container) {
    const flash = () => {
        const canvas = container.canvas.element;
        if (!canvas) return;
        
        canvas.style.transition = "background-color 0.05s";
        canvas.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
        
        setTimeout(() => {
            canvas.style.backgroundColor = "transparent";
        }, 80);
        
        const currentCity = document.getElementById('city-select').value;
        setTimeout(() => {
            if (document.getElementById('city-select').value === currentCity) flash();
        }, Math.random() * 6000 + 3000);
    };
    flash();
}

// stockholm from start
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('city-select')) {
        updateWeatherTheme('Stockholm');
    }
});

