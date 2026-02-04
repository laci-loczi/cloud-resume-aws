// APIs
const BASE_API_URL = "https://uh49oub8hh.execute-api.eu-north-1.amazonaws.com/default/ResumeCounter"; 
const STATUS_API_URL = "https://l7cncxdfwh.execute-api.eu-north-1.amazonaws.com/default/PortfolioStatusAPI";
const WEATHER_API_URL = "https://kx2f67wdlu4tzvlpxl6mkny6wa0bcwnv.lambda-url.eu-north-1.on.aws/";

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