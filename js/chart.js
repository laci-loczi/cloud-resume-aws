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
    const canvas = document.getElementById('uptimeChart');
    if (!canvas) return; 
    
    const ctx = canvas.getContext('2d');

    if (!apiData['Google'] || !apiData['Google'].data) return;

    const labels = apiData['Google'].data.map(item => {
        const date = new Date(item.t * 1000);
        return date.getHours() + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes();
    });

    const chartColors = {
        'Google': { border: '#38bdf8', start: 'rgba(56, 189, 248, 0.4)', end: 'rgba(56, 189, 248, 0)' },
        'AWS':    { border: '#f59e0b', start: 'rgba(245, 158, 11, 0.4)', end: 'rgba(245, 158, 11, 0)' },
        'GitHub': { border: '#a855f7', start: 'rgba(168, 85, 247, 0.4)', end: 'rgba(168, 85, 247, 0)' },
        'BME':    { border: '#22c55e', start: 'rgba(34, 197, 94, 0.4)',  end: 'rgba(34, 197, 94, 0)' },
        'NASA':   { border: '#ef4444', start: 'rgba(239, 68, 68, 0.4)',  end: 'rgba(239, 68, 68, 0)' },
        'IBM':    { border: '#01012b', start: 'rgba(1, 1, 43, 0.4)',     end: 'rgba(1, 1, 43, 0)' }
    };

    let datasets = [];

    Object.keys(chartColors).forEach(key => {
        if (apiData[key]) {
            const conf = chartColors[key];
            const avg = Math.round(apiData[key].average);

            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, conf.start);
            gradient.addColorStop(1, conf.end);

            datasets.push({
                label: `${key} (Avg: ${avg}ms)`,
                data: apiData[key].data.map(i => i.y),
                borderColor: conf.border,
                backgroundColor: gradient,
                borderWidth: 2,
                tension: 0.4, 
                pointRadius: 0, 
                pointHoverRadius: 6,
                fill: true,
                _sortValue: avg 
            });
        }
    });
    datasets.sort((a, b) => a._sortValue - b._sortValue);
    if (window.myChartInstance) {
        window.myChartInstance.destroy();
    }

    window.myChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        usePointStyle: true,
                        boxWidth: 12,
                        font: { family: "'Inter', sans-serif", size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#f8fafc',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 10,
                    
                    itemSort: function(a, b) {
                        return a.raw - b.raw; 
                    },

                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label.indexOf(' (') !== -1) {
                                label = label.substring(0, label.indexOf(' ('));
                            }
                            return ` ${label}: ${context.parsed.y} ms`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: '#1e293b', drawBorder: false },
                    ticks: { color: '#64748b', font: { size: 10 } },
                    beginAtZero: true
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 6 }
                }
            }
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