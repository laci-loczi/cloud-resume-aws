// api endpoints
const BASE_API_URL = "https://uh49oub8hh.execute-api.eu-north-1.amazonaws.com/default/ResumeCounter"; 
const STATUS_API_URL = "https://l7cncxdfwh.execute-api.eu-north-1.amazonaws.com/default/PortfolioStatusAPI";
const ARCH_API_URL = "https://6er0sghd22.execute-api.eu-north-1.amazonaws.com/default/PortfolioArchStats";

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