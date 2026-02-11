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

        setWeatherClass(data.weather);

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

            container.options.particles.number.value = 50; 
            container.options.particles.shape.type = "char"; 
            container.options.particles.shape.character = {
                value: ["1" , "0"], 
                font: "Font Awesome 6 Free", 
                style: "", 
            };

            container.options.particles.color.value = "#38bdf8";
            container.options.particles.size.value = { min: 8, max: 16 };
            container.options.particles.move.speed = { min: 10, max: 15 }; 
            container.options.particles.move.direction = "bottom";
            container.options.particles.move.straight = true;
            container.options.particles.links.enable = false;

            container.options.particles.rotate = {
                value: { min: 0, max: 360 },
                animation: { enable: true, speed: 1, sync: false }
            };

            container.options.particles.opacity = {
                value: { min: 0.1, max: 0.8 },
                animation: { enable: true, speed: 1, sync: false, minimumValue: 0.1 }
            };
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
            container.options.particles.shape.type = "star";
            container.options.particles.shape.options = {
                star: {
                    sides: 8,
                    inset: 2 
                }
            };

            container.options.particles.number.value = 120;
            container.options.particles.size.value = { min: 1, max: 4 };
            container.options.particles.move.speed = 0.2;
            container.options.particles.move.direction = "left";
            container.options.particles.move.straight = true;
            container.options.particles.opacity = {
                value: { min: 0.1, max: 1 },
                animation: {
                    enable: true,
                    speed: 5,
                    sync: false, 
                    startValue: "random",
                    destroy: "none"
                }
            };

            container.options.particles.links.enable = false;
            if (tempDisplay) tempDisplay.classList.add('frozen-temp');
        }
        
        else if (temp >= 30) {
            document.body.style.backgroundColor = colors.hot;  

            container.options.particles.color.value = ["#fbbf24", "#ef4444", "#f97316"];         
            container.options.particles.number.value = 100;
            container.options.particles.size.value = { min: 2, max: 5 };          
            container.options.particles.move.direction = "top";
            container.options.particles.move.speed = 3; 
            container.options.particles.move.straight = false;
            
            container.options.particles.wobble = {
                enable: true,
                distance: 10,
                speed: 10
            };

            container.options.particles.opacity = {
                value: { min: 0.4, max: 0.8 },
                animation: {
                    enable: true,
                    speed: 1,
                    sync: false,
                    mode: "auto"
                }
            };
            
            container.options.particles.links.color = "#ef4444";
            container.options.particles.links.enable = false;
            if (tempDisplay) tempDisplay.classList.add('hot-temp');
        }
        
        await container.refresh();

    } catch (err) {
        console.error("Weather theme error:", err);
    }
}

//cards background
function setWeatherClass(weatherRaw) {
    const body = document.body;
    const w = weatherRaw.toLowerCase();

    //remove old ones
    body.classList.remove('weather-clear', 'weather-rain', 'weather-clouds', 'weather-snow', 'weather-thunderstorm');

    //set new ones
    if (w.includes('clear')) {
        body.classList.add('weather-clear');
    } else if (w.includes('rain') || w.includes('drizzle')) {
        body.classList.add('weather-rain');
    } else if (w.includes('snow')) {
        body.classList.add('weather-snow');
    } else if (w.includes('thunder')) {
        body.classList.add('weather-thunderstorm');
    } else {
        body.classList.add('weather-clouds');
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

const simWrapper = document.getElementById('sim-wrapper');
const simTrigger = document.getElementById('sim-trigger');

if (simTrigger) {
    simTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelector('.custom-select-wrapper.open')?.classList.remove('open');

        simWrapper.classList.toggle('open');
    });
}

function selectSimulation(simCode) {
    updateWeatherTheme(simCode);
    simWrapper.classList.remove('open');
}

document.addEventListener('click', (e) => {
    if (simWrapper && !simWrapper.contains(e.target)) {
        simWrapper.classList.remove('open');
    }
});