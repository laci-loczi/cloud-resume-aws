document.addEventListener("DOMContentLoaded", () => {
    const BACKEND_URL = "https://k8s.loczidity.me/"; 
    const btn = document.getElementById('tunnelButton');
    const dot = btn ? btn.querySelector('.dot') : null;

    if (btn) {
        const socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 2000
        });
        socket.on('connect', () => {
            console.log("Tunnel Online");
            btn.classList.remove('offline');
            btn.classList.add('online');
            btn.href = BACKEND_URL; 
            btn.innerHTML = '<span class="dot">🟢</span> Tunnel Online';
        });

        function setOffline() {
            console.log("Tunnel Offline");
            btn.classList.remove('online');
            btn.classList.add('offline');
            btn.href = "#"; 
            btn.innerHTML = '<span class="dot">🔴</span> Tunnel Offline';
        }

        socket.on('disconnect', setOffline);
        socket.on('connect_error', setOffline);
    }
});