// ===== CropGuard AI — Application Logic =====

// Polyfill for roundRect (older browsers)
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
        if (!Array.isArray(radii)) radii = [radii, radii, radii, radii];
        const [tl, tr, br, bl] = radii.map(r => Math.min(r, w / 2, h / 2));
        this.moveTo(x + tl, y);
        this.arcTo(x + w, y, x + w, y + h, tr);
        this.arcTo(x + w, y + h, x, y + h, br);
        this.arcTo(x, y + h, x, y, bl);
        this.arcTo(x, y, x + w, y, tl);
        this.closePath();
        return this;
    };
}

document.addEventListener('DOMContentLoaded', () => {
    // Wrap each init independently so one failure doesn't block others
    const inits = [
        ['Navigation', initNavigation],
        ['VibrationChart', initVibrationChart],
        ['Detections', initDetections],
        ['ZoneMap', initZoneMap],
        ['ZoneHealth', initZoneHealth],
        ['AccuracyRing', initAccuracyRing],
        ['Alerts', initAlerts],
        ['Analytics', initAnalytics],
        ['Notifications', initNotifications],
        ['ToastSystem', initToastSystem],
        ['LiveUpdates', startLiveUpdates],
        ['LanguageToggle', initLanguageToggle],
        ['ProfilePanel', initProfilePanel],
        ['ExtraInteractions', initExtraInteractions],
        ['HomePageInteractions', initHomePageInteractions],
    ];

    inits.forEach(([name, fn]) => {
        try {
            fn();
        } catch (e) {
            console.error(`CropGuard init [${name}] error:`, e);
        }
    });
});

// ===== DATA =====
const PEST_TYPES = [
    { name: 'Aphid Colony', icon: '🐛', disease: 'Leaf Curl Virus', severity: 'high' },
    { name: 'Whitefly', icon: '🦟', disease: 'Yellowing Disease', severity: 'critical' },
    { name: 'Stem Borer', icon: '🪲', disease: 'Stem Rot', severity: 'critical' },
    { name: 'Thrips', icon: '🦗', disease: 'Spotted Wilt', severity: 'medium' },
    { name: 'Leaf Miner', icon: '🐜', disease: 'Leaf Blight', severity: 'medium' },
    { name: 'Mealybug', icon: '🐞', disease: 'Sooty Mold', severity: 'low' },
    { name: 'Spider Mite', icon: '🕷️', disease: 'Web Blight', severity: 'high' },
    { name: 'Fruit Fly', icon: '🪰', disease: 'Fruit Rot', severity: 'medium' },
];

const ZONES = [
    { id: '1', name: 'Zone 1', crop: 'Wheat', sensors: 3, health: 95, status: 'healthy' },
    { id: '2', name: 'Zone 2', crop: 'Wheat', sensors: 2, health: 88, status: 'healthy' },
    { id: '3', name: 'Zone 3', crop: 'Rice', sensors: 3, health: 72, status: 'warning' },
    { id: '4', name: 'Zone 4', crop: 'Rice', sensors: 2, health: 91, status: 'healthy' },
    { id: '5', name: 'Zone 5', crop: 'Cotton', sensors: 2, health: 45, status: 'critical' },
    { id: '6', name: 'Zone 6', crop: 'Cotton', sensors: 3, health: 83, status: 'healthy' },
    { id: '7', name: 'Zone 7', crop: 'Sugarcane', sensors: 2, health: 67, status: 'warning' },
    { id: '8', name: 'Zone 8', crop: 'Sugarcane', sensors: 2, health: 90, status: 'healthy' },
    { id: '9', name: 'Zone 9', crop: 'Maize', sensors: 2, health: 94, status: 'healthy' },
    { id: '10', name: 'Zone 10', crop: 'Maize', sensors: 1, health: 58, status: 'critical' },
    { id: '11', name: 'Zone 11', crop: 'Soybean', sensors: 2, health: 86, status: 'healthy' },
    { id: '12', name: 'Zone 12', crop: 'Soybean', sensors: 1, health: 79, status: 'warning' },
];

const ALERTS_DATA = [
    {
        id: 1,
        type: 'critical',
        title: 'Stem Borer Infestation Detected — Zone 5',
        description: 'Piezoelectric sensors in Zone 5 detected persistent high-frequency vibrations (2.4kHz–3.8kHz) consistent with Stem Borer larval activity. ML model classified with 96.8% confidence. Immediate intervention recommended.',
        zone: '5',
        time: '12 min ago',
        read: false,
        pest: 'Stem Borer',
        disease: 'Stem Rot',
    },
    {
        id: 2,
        type: 'critical',
        title: 'Whitefly Population Surge — Zone 10',
        description: 'Unusual vibration pattern detected across 3 sensors in Zone 10. Frequency analysis matches Whitefly wing-beat signature. Population density estimated at 85 per leaf. Risk of Yellowing Disease transmission is high.',
        zone: '10',
        time: '28 min ago',
        read: false,
        pest: 'Whitefly',
        disease: 'Yellowing Disease',
    },
    {
        id: 3,
        type: 'warning',
        title: 'Aphid Activity Increasing — Zone 3',
        description: 'Low-frequency vibration anomalies detected in Zone 3 sensors. Pattern matches early-stage Aphid colony formation. Current confidence: 82.1%. Monitoring recommended — may escalate in 24–48 hours.',
        zone: '3',
        time: '1 hour ago',
        read: false,
        pest: 'Aphid',
        disease: 'Leaf Curl Virus',
    },
    {
        id: 4,
        type: 'warning',
        title: 'Thrip Vibration Pattern — Zone 7',
        description: 'Intermittent micro-vibrations in Zone 7 match thrip feeding patterns. Confidence: 78.4%. No visible crop damage yet. Continue monitoring.',
        zone: '7',
        time: '2 hours ago',
        read: true,
        pest: 'Thrips',
        disease: 'Spotted Wilt',
    },
    {
        id: 5,
        type: 'info',
        title: 'Sensor Calibration Complete — Zone 1',
        description: 'All 3 piezoelectric sensors in Zone 1 have been recalibrated. Sensitivity improved by 12%. New baseline vibration thresholds applied.',
        zone: '1',
        time: '3 hours ago',
        read: true,
    },
    {
        id: 6,
        type: 'warning',
        title: 'Spider Mite Indicators — Zone 12',
        description: 'Sensors detecting characteristic low-amplitude high-frequency patterns associated with spider mite activity. Confidence rising — currently at 73.9%.',
        zone: '12',
        time: '4 hours ago',
        read: true,
        pest: 'Spider Mite',
        disease: 'Web Blight',
    },
    {
        id: 7,
        type: 'info',
        title: 'ML Model Updated to v2.4.1',
        description: 'The detection model has been updated with 2,400 new vibration samples. Accuracy improved from 93.1% to 94.7%. New species signatures added: Leaf Miner, Mealybug.',
        zone: null,
        time: '6 hours ago',
        read: true,
    },
    {
        id: 8,
        type: 'info',
        title: 'Weekly Report Generated',
        description: 'Farm health report for Week 12 is ready. Overall farm health score: 87%. 3 active threat zones identified. 17 species detections in the past 7 days.',
        zone: null,
        time: '1 day ago',
        read: true,
    },
];

// ===== NAVIGATION =====
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const heading = document.getElementById('page-heading');
    const subtitle = document.getElementById('page-subtitle');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    const pageInfo = {
        home: { title: 'Home', subtitle: 'Welcome to your smart farm system' },
        dashboard: { title: 'Dashboard', subtitle: 'Real-time farm monitoring overview' },
        zones: { title: 'Zone Map', subtitle: 'Farm layout and sensor distribution' },
        detection: { title: 'Detection', subtitle: 'ML-powered vibration classification' },
        alerts: { title: 'Alerts', subtitle: 'Notifications and threat management' },
        analytics: { title: 'Analytics', subtitle: 'Historical trends and insights' },
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(`page-${page}`).classList.add('active');

            heading.textContent = pageInfo[page].title;
            subtitle.textContent = pageInfo[page].subtitle;

            // Close mobile sidebar
            sidebar.classList.remove('open');

            // Trigger page-specific renders
            if (page === 'analytics') {
                setTimeout(() => renderAnalytics(), 100);
            }
            if (page === 'detection') {
                setTimeout(() => {
                    renderSpectrogram();
                    renderDetectionTable();
                    renderSpeciesChart();
                }, 100);
            }
            if (page === 'zones') {
                setTimeout(() => initZoneMap(), 100);
            }
        });
    });

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// ===== LIVE VIBRATION CHART =====
let vibrationData = [];
let vibrationAnimId;

function initVibrationChart() {
    const canvas = document.getElementById('vibration-canvas');
    if (!canvas) return;

    // Initialize data
    for (let i = 0; i < 200; i++) {
        vibrationData.push(generateVibrationPoint());
    }

    drawVibrationChart();
}

let vibrationStep = 0;

function generateVibrationPoint() {
    vibrationStep++;
    const zoneSelect = document.getElementById('vibration-zone-select');
    const zone = zoneSelect ? zoneSelect.value : 'all';

    let base, noise, spike;
    const s = vibrationStep;

    if (zone === 'all') {
        // Default generic mix
        base = Math.sin(s / 5) * 20;
        noise = (Math.random() - 0.5) * 60;
        spike = Math.random() > 0.97 ? (Math.random() - 0.5) * 120 : 0;
    } else if (zone === 'zone-a') {
        // High frequency (Aphids/Swarm) - Critical
        base = Math.sin(s / 1.5) * 40;
        noise = (Math.random() - 0.5) * 100;
        spike = Math.random() > 0.8 ? (Math.random() - 0.5) * 180 : 0;
    } else if (zone === 'zone-b') {
        // Stem Borer: Heavy continuous low frequency - Warning
        base = Math.sin(s / 15) * 80;
        noise = Math.sin(s / 3) * 30 + (Math.random() - 0.5) * 20;
        spike = 0;
    } else if (zone === 'zone-c') {
        // Healthy field: low amplitude wind - Healthy
        base = Math.sin(s / 10) * 10;
        noise = (Math.random() - 0.5) * 15;
        spike = Math.random() > 0.99 ? (Math.random() - 0.5) * 30 : 0;
    } else if (zone === 'zone-d') {
        // Locust Swarm: Crazy amplitude and massive spikes - Critical
        base = Math.sin(s / 2) * 60 * Math.sin(s / 20);
        noise = (Math.random() - 0.5) * 140;
        spike = Math.random() > 0.6 ? (Math.random() - 0.5) * 250 : 0;
    } else {
        base = Math.sin(s / 5) * 20;
        noise = (Math.random() - 0.5) * 60;
        spike = 0;
    }

    return base + noise + spike;
}

function drawVibrationChart() {
    const canvas = document.getElementById('vibration-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // Skip if canvas not visible
    if (w === 0 || h === 0) {
        vibrationAnimId = requestAnimationFrame(drawVibrationChart);
        return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const midY = h / 2;

    // Add new point
    vibrationData.push(generateVibrationPoint());
    if (vibrationData.length > 200) vibrationData.shift();

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    // Setup dynamic styling based on the zone selected
    const zoneSelect = document.getElementById('vibration-zone-select');
    const zone = zoneSelect ? zoneSelect.value : 'all';

    let colorRgb = '52, 211, 153'; // Default Green
    let colorHex = '#34d399';
    let colorGradientEnd = '#06b6d4'; // Cyan

    if (zone === 'zone-a' || zone === 'zone-d') {
        // Critical Zones
        colorRgb = '248, 113, 113';
        colorHex = '#f87171';
        colorGradientEnd = '#ef4444';
    } else if (zone === 'zone-b') {
        // Warning Zone
        colorRgb = '251, 191, 36';
        colorHex = '#fbbf24';
        colorGradientEnd = '#f59e0b';
    } else if (zone === 'zone-c') {
        // Healthy Zone
        colorRgb = '52, 211, 153';
        colorHex = '#34d399';
        colorGradientEnd = '#10b981';
    }

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, `rgba(${colorRgb}, 0.15)`);
    gradient.addColorStop(0.5, `rgba(${colorRgb}, 0.02)`);
    gradient.addColorStop(1, `rgba(${colorRgb}, 0.15)`);

    ctx.beginPath();
    ctx.moveTo(0, midY);
    for (let i = 0; i < vibrationData.length; i++) {
        const x = (i / (vibrationData.length - 1)) * w;
        const y = midY + vibrationData[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.lineTo(w, midY);
    ctx.lineTo(0, midY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Main line
    const lineGradient = ctx.createLinearGradient(0, 0, w, 0);
    lineGradient.addColorStop(0, `rgba(${colorRgb}, 0.3)`);
    lineGradient.addColorStop(0.5, colorHex);
    lineGradient.addColorStop(1, colorGradientEnd);

    ctx.beginPath();
    for (let i = 0; i < vibrationData.length; i++) {
        const x = (i / (vibrationData.length - 1)) * w;
        const y = midY + vibrationData[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glow effect on last point
    const lastX = w;
    const lastY = midY + vibrationData[vibrationData.length - 1];
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = colorHex;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lastX, lastY, 8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${colorRgb}, 0.3)`;
    ctx.fill();

    vibrationAnimId = requestAnimationFrame(drawVibrationChart);
}

// ===== RECENT DETECTIONS =====
function initDetections() {
    renderDetectionList();
    renderDetectionTable();
    renderSpectrogram();
    renderSpeciesChart();
}

function renderDetectionList() {
    const list = document.getElementById('detection-list');
    if (!list) return;

    const detections = [
        { pest: PEST_TYPES[2], confidence: '96.8', mins: 12, zone: ZONES[4] },
        { pest: PEST_TYPES[1], confidence: '91.3', mins: 28, zone: ZONES[9] },
        { pest: PEST_TYPES[0], confidence: '82.1', mins: 45, zone: ZONES[2] },
        { pest: PEST_TYPES[6], confidence: '88.7', mins: 67, zone: ZONES[11] },
        { pest: PEST_TYPES[3], confidence: '78.4', mins: 89, zone: ZONES[6] },
        { pest: PEST_TYPES[4], confidence: '85.2', mins: 105, zone: ZONES[8] },
    ];

    list.innerHTML = detections.map(d => {
        const conf = parseFloat(d.confidence);
        const confClass = conf > 90 ? 'high' : conf > 80 ? 'medium' : 'low';
        const iconClass = d.pest.severity === 'critical' ? 'critical' : d.pest.severity === 'high' ? 'warning' : 'info';
        return `
            <div class="detection-item">
                <div class="detection-item-icon ${iconClass}">${d.pest.icon}</div>
                <div class="detection-item-info">
                    <div class="detection-item-name">${d.pest.name}</div>
                    <div class="detection-item-meta">
                        <span>${d.zone.name}</span>
                        <span>•</span>
                        <span>${d.mins}m ago</span>
                    </div>
                </div>
                <span class="detection-item-confidence ${confClass}">${d.confidence}%</span>
            </div>
        `;
    }).join('');
}

let liveDetectionRows = [
    { pest: PEST_TYPES[2], confidence: '96.8', zone: ZONES[4], time: '12m ago', status: 'active' },
    { pest: PEST_TYPES[1], confidence: '91.3', zone: ZONES[9], time: '28m ago', status: 'active' },
    { pest: PEST_TYPES[0], confidence: '82.1', zone: ZONES[2], time: '1h ago', status: 'monitoring' },
    { pest: PEST_TYPES[6], confidence: '88.7', zone: ZONES[11], time: '1h ago', status: 'monitoring' },
    { pest: PEST_TYPES[3], confidence: '78.4', zone: ZONES[6], time: '2h ago', status: 'monitoring' },
    { pest: PEST_TYPES[4], confidence: '85.2', zone: ZONES[8], time: '3h ago', status: 'resolved' },
];

function renderDetectionTable() {
    const tbody = document.getElementById('detection-table-body');
    if (!tbody) return;

    tbody.innerHTML = liveDetectionRows.map((r, i) => `
        <tr style="animation: fade-in 0.5s ease-out; border-bottom: 1px solid rgba(255,255,255,0.05); background: ${i === 0 && r.time === 'Just now' ? 'rgba(255,255,255,0.03)' : 'transparent'}">
            <td style="color:var(--text-muted); font-family:monospace; font-size:0.85rem; padding: 12px 16px;">${r.time}</td>
            <td style="font-weight:500; padding: 12px 16px;">${r.zone.name}</td>
            <td style="padding: 12px 16px;">
                <span style="display:inline-flex;align-items:center;gap:6px;">
                    <span style="font-size:1.1rem;">${r.pest.icon}</span>
                    <span style="letter-spacing:0.5px;">${r.pest.name}</span>
                </span>
            </td>
            <td style="padding: 12px 16px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width: 50px; height: 6px; background: rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                        <div style="width: ${r.confidence}%; height: 100%; background: ${r.confidence > 90 ? '#f87171' : '#fbbf24'};"></div>
                    </div>
                    <span class="confidence-value" style="font-family:monospace;">${r.confidence}%</span>
                </div>
            </td>
            <td style="padding: 12px 16px;"><span class="severity-badge ${r.pest.severity}">${r.pest.severity.toUpperCase()}</span></td>
            <td style="padding: 12px 16px;">
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background: ${r.status === 'active' ? '#ef4444' : r.status === 'monitoring' ? '#f59e0b' : '#10b981'};"></span>
                    <span style="text-transform:capitalize; font-size:0.85rem; color:var(--text-muted);">${r.status}</span>
                </div>
            </td>
        </tr>
    `).join('');
}

// ===== SPECTROGRAM =====
function renderSpectrogram() {
    const canvas = document.getElementById('spectrogram-canvas');
    if (!canvas) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const cols = 120;
    const rows = 40;
    const cellW = w / cols;
    const cellH = h / rows;

    // Dark background
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for(let i=1; i<4; i++) {
         ctx.beginPath(); ctx.moveTo(0, i*(h/4)); ctx.lineTo(w, i*(h/4)); ctx.stroke();
    }

    // Static Heatmap Array
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const freq = y / rows;
            const time = (x / cols); 
            
            const intensity = Math.sin(freq * 12 + time * 8) * 0.3 +
                Math.sin(freq * 5 - time * 3) * 0.2 +
                Math.random() * 0.15;

            const band1 = Math.exp(-Math.pow(freq - 0.3, 2) / 0.01) * Math.sin(time * 15) * 0.5;
            const band2 = Math.exp(-Math.pow(freq - 0.6, 2) / 0.015) * Math.cos(time * 10) * 0.4;
            const band3 = Math.exp(-Math.pow(freq - 0.8, 2) / 0.008) * Math.sin(time * 20) * 0.5;

            const val = Math.max(0, Math.min(1, intensity + band1 + band2 + band3));
            
            if (val < 0.1) continue;

            let r, g, b;
            if (val < 0.3) {
                r = 0; g = val * 3 * 150; b = 100 + val * 3 * 155; // Dark cyan
            } else if (val < 0.6) {
                const t = (val - 0.3) * 3.33;
                r = t * 150; g = 150 + t * 100; b = 255 - t * 200; // Bright cyan to yellow
            } else {
                const t = (val - 0.6) * 2.5;
                r = 150 + t * 105; g = 250 - t * 100; b = 50 - t * 50; // Yellow to Red
            }

            ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${val})`;
            ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
        }
    }

    // Axis labels
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.font = '10px "JetBrains Mono"';
    ctx.textAlign = 'left';
    ctx.fillText('0 Hz', 6, h - 8);
    ctx.fillText('5 kHz', 6, 14);
    ctx.textAlign = 'right';
    ctx.fillText('Analysis Complete', w - 8, h - 8);
}

// ===== SPECIES CHART (Bar chart) =====
let speciesChartHoverIndex = -1;

function renderSpeciesChart() {
    const canvas = document.getElementById('species-canvas');
    if (!canvas) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const padding = { top: 30, right: 20, bottom: 60, left: 60 };

    const data = PEST_TYPES.map(pest => ({
        pestObj: pest,
        count: Math.floor(Math.random() * 50) + 10
    })).sort((a,b)=>b.count - a.count).slice(0,6);

    const maxVal = Math.max(...data.map(d => d.count));
    let hitboxes = [];

    function drawInteractive() {
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);
        hitboxes = [];

        const barWidth = (w - padding.left - padding.right) / data.length * 0.6;
        const gap = (w - padding.left - padding.right) / data.length * 0.4;
        const chartH = h - padding.top - padding.bottom;

        // Grid
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartH / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.stroke();

            ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
            ctx.font = '10px "JetBrains Mono"';
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(maxVal - (maxVal / 5) * i), padding.left - 8, y + 4);
        }

        // Bars
        const colors = ['#00f6ff', '#06b6d4', '#f87171', '#fbbf24', '#a78bfa', '#60a5fa'];

        data.forEach((d, i) => {
            const x = padding.left + i * (barWidth + gap) + gap / 2;
            const barH = (d.count / maxVal) * chartH;
            const y = padding.top + chartH - barH;

            // Store hitbox
            hitboxes.push({ x, y, width: barWidth, height: barH, data: d, color: colors[i] });

            const isHovered = speciesChartHoverIndex === i;

            const grad = ctx.createLinearGradient(0, y, 0, y + barH);
            grad.addColorStop(0, colors[i]);
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
            else ctx.fillRect(x, y, barWidth, barH);
            ctx.fill();

            // Labels
            ctx.fillStyle = isHovered ? '#fff' : 'rgba(255,255,255,0.6)';
            ctx.font = isHovered ? 'bold 11px sans-serif' : '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(d.count, x + barWidth / 2, y - 6);
            
            const labelText = d.pestObj.name.split(' ')[0];
            ctx.fillText(labelText, x + barWidth / 2, padding.top + chartH + 16);
            ctx.font = '16px sans-serif';
            ctx.fillText(d.pestObj.icon, x + barWidth / 2, padding.top + chartH + 34);
        });
        
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Click any bar to view species details', padding.left, padding.top - 12);

        ctx.restore();
    }

    drawInteractive();

    // Attach listeners ONCE
    if (!canvas.dataset.interactiveBound) {
        canvas.dataset.interactiveBound = "true";
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            let found = -1;
            for(let i=0; i<hitboxes.length; i++) {
                const b = hitboxes[i];
                if (mouseX >= b.x && mouseX <= b.x + b.width && mouseY >= b.y && mouseY <= b.y + b.height) {
                    found = i;
                    break;
                }
            }

            if (found !== speciesChartHoverIndex) {
                speciesChartHoverIndex = found;
                canvas.style.cursor = found !== -1 ? 'pointer' : 'default';
                drawInteractive();
            }
        });

        canvas.addEventListener('click', () => {
             if (speciesChartHoverIndex !== -1) {
                 const hit = hitboxes[speciesChartHoverIndex];
                 const pest = hit.data.pestObj;
                 
                 const panel = document.getElementById('species-details-panel');
                 const iconEl = document.getElementById('species-details-icon');
                 const nameEl = document.getElementById('species-details-name');
                 const disEl = document.getElementById('species-details-disease');
                 const sevEl = document.getElementById('species-details-severity');

                 if(panel && iconEl && nameEl) {
                     panel.style.display = 'flex';
                     iconEl.textContent = pest.icon;
                     nameEl.textContent = pest.name;
                     disEl.innerHTML = `Known Disease: <span style="color:#fff;">${pest.disease}</span>`;
                     sevEl.className = `severity-badge ${pest.severity}`;
                     sevEl.textContent = pest.severity.toUpperCase();
                     
                     panel.style.boxShadow = 'none';
                     panel.style.borderColor = 'rgba(255,255,255,0.1)';
                 }
             }
        });
    }
}

// ===== ZONE MAP =====
const ZONE_SHAPES = {
    '1': '100,50 300,70 280,210 80,180',
    '2': '300,70 500,50 520,190 280,210',
    '3': '500,50 700,80 680,220 520,190',
    '4': '700,80 900,60 920,200 680,220',
    '5': '80,180 280,210 260,380 40,350',
    '6': '280,210 520,190 540,360 260,380',
    '7': '520,190 680,220 700,390 540,360',
    '8': '680,220 920,200 940,370 700,390',
    '9': '40,350 260,380 240,580 20,550',
    '10': '260,380 540,360 560,600 240,580',
    '11': '540,360 700,390 720,610 560,600',
    '12': '700,390 940,370 960,570 720,610'
};

const getZoneColor = (status, opacity) => {
    if (status === 'critical') return `rgba(248, 113, 113, ${opacity})`;
    if (status === 'warning') return `rgba(251, 191, 36, ${opacity})`;
    return `rgba(52, 211, 153, ${opacity})`;
};
const getZoneStroke = (status) => {
    if (status === 'critical') return '#f87171';
    if (status === 'warning') return '#fbbf24';
    return '#34d399';
};

function initZoneMap() {
    const map = document.getElementById('farm-map');
    if (!map) return;

    map.style.display = 'block'; // Override default CSS grid
    
    // Create big SVG Map
    const bigMapPolys = ZONES.map(z => {
        const shape = ZONE_SHAPES[z.id];
        const fill = getZoneColor(z.status, 0.15);
        const stroke = getZoneStroke(z.status);
        
        const pts = shape.split(' ').map(p => p.split(',').map(Number));
        const cx = (pts[0][0] + pts[1][0] + pts[2][0] + pts[3][0]) / 4;
        const cy = (pts[0][1] + pts[1][1] + pts[2][1] + pts[3][1]) / 4;

        return `
           <g class="interactive-polygon" data-zone-id="${z.id}" style="cursor:pointer; transition:all 0.3s ease;">
               <polygon points="${shape}" fill="${fill}" stroke="${stroke}" stroke-width="2" />
               <text x="${cx}" y="${cy}" fill="#fff" font-size="24" font-family="monospace" text-anchor="middle" font-weight="bold" pointer-events="none">${z.id}</text>
               <text x="${cx}" y="${cy+24}" fill="${stroke}" font-size="12" font-family="sans-serif" text-anchor="middle" pointer-events="none">${z.status.toUpperCase()}</text>
           </g>
        `;
    }).join('');

    const bigFarmSVG = `
       <style>
          .interactive-polygon:hover polygon {
              fill: rgba(255,255,255,0.2) !important;
              stroke-width: 4px;
              filter: drop-shadow(0 0 8px rgba(255,255,255,0.5));
          }
       </style>
       <div style="width:100%; margin-bottom: 24px; position:relative;">
           <div style="padding:12px 16px; background:rgba(0,0,0,0.4); border-radius:12px 12px 0 0; font-weight:600; color:#fff; border:1px solid rgba(255,255,255,0.1); border-bottom:none; display:flex; justify-content:space-between;">
               <span>Live Geographic Farm Layout</span>
               <span style="color:var(--text-muted); font-size:0.85rem; font-weight:normal;">12 Active Sectors</span>
           </div>
           <svg viewBox="0 0 1000 650" width="100%" height="auto" style="background: radial-gradient(circle at center, #111a2e, #0a0e17); border-radius: 0 0 12px 12px; border:1px solid rgba(255,255,255,0.1);">
              <defs>
                 <pattern id="grid_big" width="60" height="60" patternUnits="userSpaceOnUse">
                     <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="1" />
                 </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid_big)" />
              <g id="farm-svg-group">${bigMapPolys}</g>
           </svg>
       </div>
    `;

    // Create conventional cards listing below map
    const cardsHtml = ZONES.map(zone => {
        const vibBars = Array.from({ length: 4 }, (_, i) =>
            `<div class="zone-vibration-bar" style="animation-delay:${i * 0.15}s"></div>`
        ).join('');

        return `
            <div class="farm-zone ${zone.status}" data-zone-id="${zone.id}">
                <div>
                    <div class="farm-zone-name">${zone.name}</div>
                    <div class="farm-zone-sensors">${zone.crop} • ${zone.sensors} sensors</div>
                </div>
                <div class="farm-zone-status">
                    <div class="farm-zone-status-dot"></div>
                    <span class="farm-zone-status-text">${zone.status}</span>
                </div>
                <div class="zone-vibration">${vibBars}</div>
            </div>
        `;
    }).join('');

    map.innerHTML = `
        ${bigFarmSVG}
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
            ${cardsHtml}
        </div>
    `;

    // Click handlers for Map Polygons AND Cards
    const triggerZoneSelect = (el) => {
        const zoneId = el.dataset.zoneId;
        // Reset visual selections
        map.querySelectorAll('.farm-zone, .interactive-polygon').forEach(z => z.classList.remove('selected'));
        // Highlight active elements
        map.querySelectorAll(`[data-zone-id="${zoneId}"]`).forEach(z => z.classList.add('selected'));
        showZoneDetails(zoneId);
    };

    map.querySelectorAll('.farm-zone, .interactive-polygon').forEach(el => {
        el.addEventListener('click', () => triggerZoneSelect(el));
    });
}

function showZoneDetails(zoneId) {
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return;

    const title = document.getElementById('zone-detail-title');
    const content = document.getElementById('zone-detail-content');

    title.textContent = `Zone Analytics: ${zone.name}`;

    const sensors = Array.from({ length: zone.sensors }, (_, i) => {
        const online = Math.random() > 0.05;
        return `
            <div class="zone-sensor-item">
                <span class="zone-sensor-id">PZS-${zone.id}-${String(i + 1).padStart(2, '0')}</span>
                <span class="zone-sensor-status ${online ? 'online' : 'offline'}">${online ? 'Online' : 'Offline'}</span>
            </div>
        `;
    }).join('');

    const threatPest = PEST_TYPES[Math.floor(Math.random() * PEST_TYPES.length)];
    const isCritical = zone.status === 'critical';
    const isWarning = zone.status === 'warning';
    const glowColor = getZoneStroke(zone.status);

    // Render localized sector highlight showing the absolute shape relative to the rest of the farm
    const detailMapPolys = ZONES.map(z => {
        const shape = ZONE_SHAPES[z.id];
        const isTarget = z.id === zoneId;
        const fill = isTarget ? getZoneColor(z.status, 0.45) : 'rgba(255,255,255,0.02)';
        const stroke = isTarget ? getZoneStroke(z.status) : 'rgba(255,255,255,0.1)';
        const strokeWidth = isTarget ? 3 : 1;

        let extraGraphics = '';
        if (isTarget) {
            const pts = shape.split(' ').map(p => p.split(',').map(Number));
            const cx = (pts[0][0] + pts[1][0] + pts[2][0] + pts[3][0]) / 4;
            const cy = (pts[0][1] + pts[1][1] + pts[2][1] + pts[3][1]) / 4;
            
            // Add pulse alarm if problem detected
            if (isCritical || isWarning) {
                extraGraphics += `
                    <circle cx="${cx}" cy="${cy}" r="30" fill="none" stroke="${stroke}" opacity="0.6" stroke-width="3">
                        <animate attributeName="r" values="10; 90" dur="2s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.8; 0" dur="2s" repeatCount="indefinite"/>
                    </circle>
                `;
            }

            // Scatter mock sensor dots inside the active polygon
            for(let i=0; i<zone.sensors; i++) {
                const px = cx + (Math.sin(i*10)*40);
                const py = cy + (Math.cos(i*10)*40);
                extraGraphics += `<circle cx="${px}" cy="${py}" r="6" fill="#fff" stroke="${stroke}" stroke-width="2"/>`;
            }
            
            extraGraphics += `<text x="${cx}" y="${cy}" fill="#fff" font-size="34" font-family="sans-serif" text-anchor="middle" font-weight="bold">${z.id}</text>`;
        }

        return `
           <g>
               <polygon points="${shape}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
               ${extraGraphics}
           </g>
        `;
    }).join('');

    const zoneMapSVG = `
        <div style="width: 100%; height: 220px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 20px; overflow: hidden; position: relative; background: #05080f; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
            <svg viewBox="0 0 1000 650" width="100%" height="100%">
                ${detailMapPolys}
            </svg>
            <div style="position: absolute; top: 12px; left: 16px; font-size: 11px; font-weight: bold; color: #fff; display: flex; align-items: center;">
                 <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${glowColor};margin-right:6px;box-shadow:0 0 8px ${glowColor}"></span>
                 SECTOR TOPOGRAPHY: ${zone.id}
            </div>
            <div style="position: absolute; bottom: 8px; right: 8px; font-size: 10px; color: ${glowColor}; font-family: monospace; background: rgba(0,0,0,0.6); padding: 3px 8px; border-radius: 4px; border: 1px solid ${glowColor}40">COORD: ${Math.random().toFixed(2)} N, ${Math.random().toFixed(2)} E</div>
        </div>
    `;

    let problemSection = '';
    if (isCritical || isWarning) {
        problemSection = `
            <div style="padding: 12px; background: rgba(248, 113, 113, 0.05); border: 1px solid rgba(248, 113, 113, 0.2); border-radius: 8px; margin-bottom: 16px;">
                <div style="font-size:0.85rem; font-weight: 600; color: #f87171; display:flex; align-items:center; margin-bottom: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    Detected Problem
                </div>
                <div style="font-size:0.8rem; color: #cbd5e1; margin-bottom: 4px;">Primary Threat: <span style="color: #fbbf24; font-weight:500;">${threatPest.name}</span> (${threatPest.disease})</div>
                <div style="font-size:0.75rem; color: #94a3b8;">Status: ${zone.status === 'critical' ? 'Immediate intervention required due to high insect detection frequency.' : 'Elevated vibration anomalies detected. Keep monitoring.'}</div>
            </div>
        `;
    } else {
        problemSection = `
            <div style="padding: 12px; background: rgba(52, 211, 153, 0.05); border: 1px solid rgba(52, 211, 153, 0.2); border-radius: 8px; margin-bottom: 16px;">
                <div style="font-size:0.85rem; font-weight: 600; color: #34d399; display:flex; align-items:center;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Zone is Healthy
                </div>
                <div style="font-size:0.75rem; color: #94a3b8; margin-top: 4px;">No significant threats detected. All sensor nodes reporting baseline patterns.</div>
            </div>
        `;
    }

    content.innerHTML = `
        ${zoneMapSVG}
        
        ${problemSection}

        <div class="zone-detail-stats" style="margin-bottom: 16px;">
            <div class="zone-detail-stat">
                <span class="zone-detail-stat-value" style="color: ${zone.health > 80 ? 'var(--accent-green)' : zone.health > 60 ? 'var(--accent-amber)' : 'var(--accent-red)'}">${zone.health}%</span>
                <span class="zone-detail-stat-label">Health Score</span>
            </div>
            <div class="zone-detail-stat">
                <span class="zone-detail-stat-value">${zone.sensors}</span>
                <span class="zone-detail-stat-label">Active Sensors</span>
            </div>
            <div class="zone-detail-stat">
                <span class="zone-detail-stat-value">${Math.floor(Math.random() * 8) + 1}</span>
                <span class="zone-detail-stat-label">Detections (24h)</span>
            </div>
            <div class="zone-detail-stat">
                <span class="zone-detail-stat-value">${(Math.random() * 3 + 0.5).toFixed(1)} kHz</span>
                <span class="zone-detail-stat-label">Avg Frequency</span>
            </div>
        </div>
        
        <div style="font-size:0.82rem;font-weight:600;margin-bottom:8px; color: #fff;">Sensor Array Status</div>
        <div class="zone-sensor-list">${sensors}</div>
    `;
}

// ===== ZONE HEALTH GRID =====
function initZoneHealth() {
    const grid = document.getElementById('zone-health-grid');
    if (!grid) return;

    const zoneGroups = [
        { name: 'North Field', health: 91, sensors: 10, status: 'healthy' },
        { name: 'East Block', health: 73, sensors: 4, status: 'warning' },
        { name: 'South Field', health: 45, sensors: 4, status: 'critical' },
        { name: 'West Block', health: 88, sensors: 5, status: 'healthy' },
        { name: 'Central Hub', health: 94, sensors: 6, status: 'healthy' },
        { name: 'River Edge', health: 67, sensors: 3, status: 'warning' },
    ];

    grid.innerHTML = zoneGroups.map(z => `
        <div class="zone-health-item ${z.status}">
            <div class="zone-health-name">${z.name}</div>
            <div class="zone-health-score">${z.health}%</div>
            <div class="zone-health-sensors">${z.sensors} sensors</div>
        </div>
    `).join('');
}

// ===== ACCURACY RING =====
function initAccuracyRing() {
    const canvas = document.getElementById('accuracy-ring');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 120 * dpr;
    canvas.height = 120 * dpr;
    ctx.scale(dpr, dpr);

    const cx = 60, cy = 60, r = 48, lineWidth = 8;
    const accuracy = 0.947;

    // Background ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Accuracy ring
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * accuracy);

    const grad = ctx.createLinearGradient(0, 0, 120, 120);
    grad.addColorStop(0, '#34d399');
    grad.addColorStop(1, '#06b6d4');

    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = grad;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
}

const REMEDIES = {
    'Stem Rot': {
        en: "Remove and destroy infected plants. Spray Neem oil and avoid excess watering to reduce fungal spread.",
        hi: "संक्रमित पौधों को हटाकर नष्ट करें। कवक के प्रसार को कम करने के लिए नीम के तेल का छिड़काव करें और अधिक पानी देने से बचें।"
    },
    'Yellowing Disease': {
        en: "Install yellow sticky traps. Use insecticidal soap or Neem extract spray to control the whitefly vectors.",
        hi: "पीले चिपचिपे जाल लगाएं। सफेद मक्खी वैक्टर को नियंत्रित करने के लिए कीटनाशक साबुन या नीम के अर्क के स्प्रे का उपयोग करें।"
    },
    'Leaf Curl Virus': {
        en: "Isolate infected plants. Introduce Ladybugs and spray garlic or neem oil solutions regularly.",
        hi: "संक्रमित पौधों को अलग करें। लेडीबग्स छोड़ें और लहसुन या नीम के तेल के घोल का नियमित रूप से छिड़काव करें।"
    },
    'Spotted Wilt': {
        en: "Plant resistant varieties if possible. Apply organic pesticides safely and clear surrounding weeds.",
        hi: "यदि संभव हो तो प्रतिरोधी किस्मों को बोएं। जैविक कीटनाशकों का सुरक्षित प्रयोग करें और आस-पास के खरपतवार साफ करें।"
    },
    'Web Blight': {
        en: "Increase local moisture since mites prefer dry conditions. Spray horticultural oils targeting under the leaves.",
        hi: "स्थानीय नमी बढ़ाएं क्योंकि माइट्स सूखी स्थिति पसंद करते हैं। पत्तियों के नीचे बागवानी तेलों का छिड़काव करें।"
    }
};

window.toggleRemedy = function (id, disease) {
    const remedyDiv = document.getElementById(`remedy-${id}`);
    if (!remedyDiv) return;

    if (remedyDiv.style.display === 'none' || !remedyDiv.style.display) {
        const lang = isHindi ? 'hi' : 'en';
        const remedyText = (REMEDIES[disease] && REMEDIES[disease][lang]) ?
            REMEDIES[disease][lang] :
            (isHindi ? "उपचार के लिए निकटतम कृषि विशेषज्ञ से संपर्क करें।" : "Contact nearest agricultural expert for treatment.");

        remedyDiv.innerHTML = `<strong>${isHindi ? "अनुशंसित उपाय:" : "Recommended Remedy:"}</strong><br/><span style="margin-top:4px; display:block;">${remedyText}</span>`;
        remedyDiv.style.display = 'block';
    } else {
        remedyDiv.style.display = 'none';
    }
}

// ===== ALERTS =====
function initAlerts() {
    renderAlerts('all');

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderAlerts(btn.dataset.filter);
        });
    });

    document.getElementById('mark-all-read')?.addEventListener('click', () => {
        ALERTS_DATA.forEach(a => a.read = true);
        renderAlerts(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
        updateAlertBadge();
        showToast('success', 'All Clear', 'All alerts marked as read');
    });
}

function renderAlerts(filter) {
    const list = document.getElementById('alerts-list');
    if (!list) return;

    let filtered = ALERTS_DATA;
    if (filter !== 'all') {
        filtered = ALERTS_DATA.filter(a => a.type === filter);
    }

    const icons = { critical: '🚨', warning: '⚠️', info: 'ℹ️' };

    list.innerHTML = filtered.map(a => `
        <div class="alert-item ${a.type} ${a.read ? '' : 'unread'}" data-alert-id="${a.id}">
            <div class="alert-icon">${icons[a.type]}</div>
            <div class="alert-content" style="flex:1;">
                <div class="alert-title">${a.title}</div>
                <div class="alert-description">${a.description}</div>
                <div class="alert-meta">
                    ${a.zone ? `<span class="alert-meta-item">📍 Zone ${a.zone}</span>` : ''}
                    ${a.pest ? `<span class="alert-meta-item">🐛 ${a.pest}</span>` : ''}
                    ${a.disease ? `<span class="alert-meta-item">🦠 ${a.disease}</span>` : ''}
                </div>
                ${a.disease ? `
                <div style="margin-top: 12px;">
                    <button class="pill-btn remedy-btn" onclick="toggleRemedy(${a.id}, '${a.disease.replace(/'/g, "\\'")}')" style="display:inline-flex; align-items:center; gap:6px; background:var(--accent-green-dim); color:var(--accent-green); border:1px solid rgba(52, 211, 153, 0.3);">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                        <span class="remedy-btn-text">Show Remedy</span>
                    </button>
                    <div id="remedy-${a.id}" style="display:none; margin-top:10px; padding:12px; background:var(--bg-elevated); border-left:3px solid var(--accent-green); border-radius:4px; font-size:0.85rem; color:var(--text-primary); transition: all var(--transition-base);">
                    </div>
                </div>` : ''}
            </div>
            <div class="alert-time">${a.time}</div>
        </div>
    `).join('');

    // Automatically apply hindi translation to newly rendered alerts if hindi mode is active
    if (isHindi) {
        translateDOM(document.getElementById('alerts-list'));
    }
}

function updateAlertBadge() {
    const badge = document.getElementById('alert-badge');
    const unread = ALERTS_DATA.filter(a => !a.read).length;
    if (badge) {
        badge.textContent = unread;
        badge.style.display = unread > 0 ? '' : 'none';
    }
}

// ===== ANALYTICS =====
let trendHoverIndex = null;
let currentTrendData = [];
let trendChartType = '7d';

function initAnalytics() {
    // Bind the time range buttons
    const rangeBtns = document.querySelectorAll('.analytics-trend-card .pill-btn');
    rangeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            rangeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            trendChartType = btn.dataset.range;
            generateTrendData();
            renderTrendChart();
        });
    });

    const canvas = document.getElementById('trend-canvas');
    if (canvas) {
        // Handle Hover Interactions
        canvas.addEventListener('mousemove', (e) => {
            if (currentTrendData.length === 0) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const w = canvas.clientWidth;
            const padding = { left: 50, right: 30 };
            const chartW = w - padding.left - padding.right;
            
            // Map X coordinate to data index
            let ratio = (x - padding.left) / chartW;
            ratio = Math.max(0, Math.min(1, ratio));
            const idx = Math.round(ratio * (currentTrendData.length - 1));
            
            if (trendHoverIndex !== idx) {
                trendHoverIndex = idx;
                renderTrendChart(); // Redraw with tooltip
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            trendHoverIndex = null;
            renderTrendChart();
        });
    }

    generateTrendData();
}

function generateTrendData() {
    let points = 7;
    let daysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    if (trendChartType === '30d') {
        points = 15;
        daysLabels = Array.from({length: 15}, (_, i) => `D-${30 - i*2}`);
    } else if (trendChartType === '90d') {
        points = 12;
        daysLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
    }

    currentTrendData = [];
    for(let i=0; i<points; i++) {
        // Generate realistic looking data based on the type
        const mult = trendChartType === '30d' ? 2 : trendChartType === '90d' ? 5 : 1;
        const d = Math.floor((15 + Math.random() * 25 + Math.sin(i)*10) * mult);
        const t = Math.floor((d * 0.15 + (Math.random() - 0.5) * 5) * mult);
        
        currentTrendData.push({
            label: daysLabels[i],
            detection: d,
            threat: Math.max(0, t),
        });
    }
}

function renderAnalytics() {
    if (currentTrendData.length === 0) generateTrendData();
    renderTrendChart();
    renderDistributionChart();
    renderHeatmap();
    renderSeverityBars();
}

function renderTrendChart() {
    const canvas = document.getElementById('trend-canvas');
    if (!canvas || currentTrendData.length === 0) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const padding = { top: 30, right: 30, bottom: 40, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    const maxVal = Math.max(...currentTrendData.map(d => d.detection)) * 1.2;

    // 1. Draw Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        if (i === 4) ctx.setLineDash([]); // solid bottom
        else ctx.setLineDash([4, 4]); // dashed grid
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        // Y-Axis labels
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), padding.left - 10, y + 4);
    }

    // X-Axis labels
    currentTrendData.forEach((d, i) => {
        const x = padding.left + (i / (currentTrendData.length - 1)) * chartW;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        
        // Show fewer labels if too many points
        if (currentTrendData.length > 10 && i % 2 !== 0 && i !== currentTrendData.length - 1) return;
        ctx.fillText(d.label, x, h - 15);
    });

    // 2. Helper to draw glowing bezier paths
    function drawGlowingPath(key, areaColor, lineColor, glowColor, zIndex) {
        ctx.beginPath();
        currentTrendData.forEach((d, i) => {
            const x = padding.left + (i / (currentTrendData.length - 1)) * chartW;
            const y = padding.top + (1 - d[key] / maxVal) * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else {
                const prevX = padding.left + ((i - 1) / (currentTrendData.length - 1)) * chartW;
                const prevY = padding.top + (1 - currentTrendData[i - 1][key] / maxVal) * chartH;
                const cpx = (prevX + x) / 2;
                ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
            }
        });

        // Fill area
        if (areaColor) {
            const lastX = padding.left + chartW;
            const lastY = padding.top + chartH;
            ctx.lineTo(lastX, lastY);
            ctx.lineTo(padding.left, lastY);
            ctx.closePath();
            
            const grad = ctx.createLinearGradient(0, padding.top, 0, lastY);
            grad.addColorStop(0, areaColor);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fill();
        }

        // Draw Line over it
        ctx.beginPath();
        currentTrendData.forEach((d, i) => {
            const x = padding.left + (i / (currentTrendData.length - 1)) * chartW;
            const y = padding.top + (1 - d[key] / maxVal) * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else {
                const prevX = padding.left + ((i - 1) / (currentTrendData.length - 1)) * chartW;
                const prevY = padding.top + (1 - currentTrendData[i - 1][key] / maxVal) * chartH;
                const cpx = (prevX + x) / 2;
                ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
            }
        });

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 3;
        
        // Add huge neon glow
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12;
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowBlur = 0;
    }

    // Draw the chart paths
    drawGlowingPath('detection', 'rgba(0, 246, 255, 0.4)', '#00f6ff', '#00f6ff'); // Cyan
    drawGlowingPath('threat', 'rgba(255, 42, 95, 0.4)', '#ff2a5f', '#ff2a5f'); // Neon Red

    // 3. Hover Interactions (Crosshair & Tooltip)
    if (trendHoverIndex !== null) {
        const hoverPoint = currentTrendData[trendHoverIndex];
        const hx = padding.left + (trendHoverIndex / (currentTrendData.length - 1)) * chartW;
        
        // Vertical dashed line
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(hx, padding.top);
        ctx.lineTo(hx, padding.top + chartH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        // Interactive dots
        function drawHoverDot(val, highlightColor) {
            const hy = padding.top + (1 - val / maxVal) * chartH;
            ctx.beginPath();
            ctx.arc(hx, hy, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#0a0a0f';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(hx, hy, 5, 0, Math.PI * 2);
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 2;
            ctx.shadowColor = highlightColor;
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        drawHoverDot(hoverPoint.detection, '#00f6ff');
        drawHoverDot(hoverPoint.threat, '#ff2a5f');

        // Draw Tooltip Box
        const tWidth = 140;
        const tHeight = 85;
        let tx = hx + 15;
        let ty = padding.top + 10;
        
        // Flip tooltip if too close to right edge
        if (tx + tWidth > w) {
            tx = hx - tWidth - 15;
        }

        ctx.fillStyle = 'rgba(10, 10, 15, 0.85)';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 15;
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(tx, ty, tWidth, tHeight, 8);
            ctx.fill();
            // Outer semi-transparent border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
        } else {
            ctx.fillRect(tx, ty, tWidth, tHeight);
        }
        ctx.shadowBlur = 0;

        // Tooltip Content
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Period: ${hoverPoint.label}`, tx + 12, ty + 24);
        
        // Divider
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(tx + 12, ty + 34, tWidth - 24, 1);

        // Stats
        ctx.fillStyle = '#00f6ff'; // Detection color
        ctx.beginPath();
        ctx.arc(tx + 18, ty + 50, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '11px sans-serif';
        ctx.fillText('Growth:', tx + 28, ty + 54);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(hoverPoint.detection, tx + 95, ty + 54);

        ctx.fillStyle = '#ff2a5f'; // Threat color
        ctx.beginPath();
        ctx.arc(tx + 18, ty + 68, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '11px sans-serif';
        ctx.fillText('Threats:', tx + 28, ty + 72);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(hoverPoint.threat, tx + 95, ty + 72);
    }

    // 4. Legend Top Right
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    
    ctx.shadowColor = '#00f6ff';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#00f6ff';
    ctx.fillRect(w - 200, 10, 10, 10);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Spectral Growth', w - 180, 20);

    ctx.shadowColor = '#ff2a5f';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ff2a5f';
    ctx.fillRect(w - 90, 10, 10, 10);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Threats', w - 70, 20);
}

function renderDistributionChart() {
    const canvas = document.getElementById('distribution-canvas');
    if (!canvas) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2 - 10;
    const r = Math.min(w, h) / 2 - 40;

    const data = [
        { name: 'Aphids', value: 32, color: '#34d399' },
        { name: 'Whitefly', value: 24, color: '#06b6d4' },
        { name: 'Stem Borer', value: 18, color: '#f87171' },
        { name: 'Thrips', value: 14, color: '#fbbf24' },
        { name: 'Others', value: 12, color: '#a78bfa' },
    ];

    const total = data.reduce((s, d) => s + d.value, 0);
    let start = -Math.PI / 2;

    data.forEach((d, i) => {
        const angle = (d.value / total) * Math.PI * 2;
        const end = start + angle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, end);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, start + 0.02);
        ctx.closePath();
        ctx.fillStyle = '#0a0e17';
        ctx.fill();

        const midAngle = start + angle / 2;
        const labelR = r + 20;
        const lx = cx + Math.cos(midAngle) * labelR;
        const ly = cy + Math.sin(midAngle) * labelR;
        ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
        ctx.font = '11px Inter';
        ctx.textAlign = Math.cos(midAngle) > 0 ? 'left' : 'right';
        ctx.fillText(`${d.name} (${Math.round(d.value / total * 100)}%)`, lx, ly);

        start = end;
    });

    // Center hole (donut)
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0e17';
    ctx.fill();

    ctx.fillStyle = '#f1f5f9';
    ctx.font = '700 22px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(total, cx, cy + 4);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.font = '10px Inter';
    ctx.fillText('Total', cx, cy + 18);
}

function renderHeatmap() {
    const container = document.getElementById('heatmap');
    if (!container) return;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    let html = '<div class="heatmap-header"><div class="heatmap-header-spacer"></div><div class="heatmap-cells">';
    hours.forEach(h => {
        if (h % 3 === 0) {
            html += `<div class="heatmap-header-label">${String(h).padStart(2, '0')}</div>`;
        } else {
            html += '<div class="heatmap-header-label"></div>';
        }
    });
    html += '</div></div>';

    days.forEach(day => {
        html += `<div class="heatmap-row"><div class="heatmap-label">${day}</div><div class="heatmap-cells">`;
        hours.forEach(h => {
            const dayFactor = (h >= 6 && h <= 18) ? 0.7 : 0.2;
            const intensity = Math.random() * dayFactor + Math.random() * 0.3;
            const clampedIntensity = Math.max(0, Math.min(1, intensity));

            let bg;
            if (clampedIntensity < 0.15) bg = 'rgba(52, 211, 153, 0.05)';
            else if (clampedIntensity < 0.3) bg = 'rgba(52, 211, 153, 0.15)';
            else if (clampedIntensity < 0.5) bg = 'rgba(52, 211, 153, 0.3)';
            else if (clampedIntensity < 0.7) bg = 'rgba(251, 191, 36, 0.4)';
            else if (clampedIntensity < 0.85) bg = 'rgba(251, 191, 36, 0.6)';
            else bg = 'rgba(248, 113, 113, 0.5)';

            html += `<div class="heatmap-cell" style="background:${bg}" title="${day} ${String(h).padStart(2, '0')}:00 — Activity: ${Math.round(clampedIntensity * 100)}%"></div>`;
        });
        html += '</div></div>';
    });

    container.innerHTML = html;
}

function renderSeverityBars() {
    const container = document.getElementById('severity-bars');
    if (!container) return;

    const data = [
        { label: 'Critical', count: 3, total: 20, class: 'critical' },
        { label: 'High', count: 7, total: 20, class: 'high' },
        { label: 'Medium', count: 12, total: 20, class: 'medium' },
        { label: 'Low', count: 18, total: 20, class: 'low' },
    ];

    container.innerHTML = data.map(d => `
        <div class="severity-bar-item">
            <div class="severity-bar-header">
                <span class="severity-bar-label">${d.label}</span>
                <span class="severity-bar-count">${d.count} detections</span>
            </div>
            <div class="severity-bar-track">
                <div class="severity-bar-fill ${d.class}" style="width:${(d.count / d.total) * 100}%"></div>
            </div>
        </div>
    `).join('');
}

// ===== NOTIFICATIONS =====
function initNotifications() {
    const btn = document.getElementById('notification-btn');
    const panel = document.getElementById('notification-panel');
    const overlay = document.getElementById('notification-overlay');
    const clearBtn = document.getElementById('clear-notifications');

    btn?.addEventListener('click', () => {
        panel.classList.toggle('open');
        overlay.classList.toggle('open');
    });

    overlay?.addEventListener('click', () => {
        panel.classList.remove('open');
        overlay.classList.remove('open');
    });

    clearBtn?.addEventListener('click', () => {
        document.getElementById('notification-list').innerHTML =
            '<p style="text-align:center;color:var(--text-muted);padding:40px 20px;font-size:0.85rem">No notifications</p>';
    });

    renderNotifications();
}

function renderNotifications() {
    const list = document.getElementById('notification-list');
    if (!list) return;

    const notifications = ALERTS_DATA.slice(0, 5);

    list.innerHTML = notifications.map(n => `
        <div class="notification-item">
            <div class="notification-item-title">${n.title.split('—')[0].trim()}</div>
            <div class="notification-item-text">${n.description.substring(0, 100)}...</div>
            <div class="notification-item-time">${n.time}</div>
        </div>
    `).join('');
}

// ===== TOAST SYSTEM =====
let toastQueue = [];

function initToastSystem() {
    setTimeout(() => {
        showToast('warning', 'Vibration Anomaly', 'Unusual pattern detected in Zone 3 — Sensor PZS-3-01');
    }, 3000);

    setTimeout(() => {
        showToast('critical', 'Pest Alert', 'Stem Borer activity confirmed in Zone 5. Confidence: 96.8%');
    }, 8000);
}

function showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { critical: '🚨', warning: '⚠️', info: 'ℹ️', success: '✅' };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.closest('.toast').remove()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('closing');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// ===== EDGE ML INFERENCE & LIVE UPDATES =====
// Translating the Python Random Forest logic into Edge-JS for seamless Hackathon demo without a backend
function predictPest(freq, amp, dur, rate) {
    // These thresholds match the generate_pest_data distributions in ml_model.py
    if (freq >= 300 && freq <= 600 && rate >= 150) {
        return { type: PEST_TYPES[0], confidence: (85 + Math.random() * 12).toFixed(1) }; // Aphid Colony
    } else if (freq >= 150 && freq <= 300 && amp >= 3.0) {
        // Locust Swarm isn't in default list, so let's match with a high severity pest or default
        return { type: { name: 'Locust Swarm', icon: '🦗', disease: 'Crop Devastation', severity: 'critical' }, confidence: (90 + Math.random() * 8).toFixed(1) };
    } else if (freq >= 80 && freq <= 150 && dur >= 80) {
        return { type: PEST_TYPES[2], confidence: (88 + Math.random() * 10).toFixed(1) }; // Stem Borer
    } else if (freq >= 200 && freq <= 600 && rate >= 50) {
        return { type: PEST_TYPES[1], confidence: (82 + Math.random() * 10).toFixed(1) }; // Whitefly
    } else {
        return { type: { name: 'Wind/Rain', icon: '🍃', disease: 'None', severity: 'info' }, confidence: (95 + Math.random() * 4).toFixed(1) };
    }
}

// Keep a global list to dynamically update the dashboard
let detectionsHistory = [];

function simulateSensorEvent() {
    // 1. Generate signal mirroring the real bio-acoustics
    const states = ['healthy', 'healthy', 'healthy', 'locust', 'borer', 'aphid', 'whitefly'];
    const chosen = states[Math.floor(Math.random() * states.length)];

    let freq, amp, dur, rate;
    if (chosen === 'healthy') {
        freq = 10 + Math.random() * 40;
        amp = 0.1 + Math.random() * 0.9;
        dur = 5 + Math.random() * 15;
        rate = 1 + Math.random() * 9;
    } else if (chosen === 'locust') {
        freq = 150 + Math.random() * 150;
        amp = 3.0 + Math.random() * 5.0;
        dur = 30 + Math.random() * 50;
        rate = 50 + Math.random() * 100;
    } else if (chosen === 'borer') {
        freq = 80 + Math.random() * 70;
        amp = 1.5 + Math.random() * 2.5;
        dur = 100 + Math.random() * 200;
        rate = 5 + Math.random() * 15;
    } else { // aphid / whitefly
        freq = 300 + Math.random() * 300;
        amp = 0.5 + Math.random() * 1.5;
        dur = 10 + Math.random() * 30;
        rate = 150 + Math.random() * 300;
    }

    // 2. Classify the signal using our Edge ML logic
    const prediction = predictPest(freq, amp, dur, rate);
    const zone = ZONES[Math.floor(Math.random() * ZONES.length)];

    // 3. Update the Vibration Classifier Visuals in Detection Page
    const classifierName = document.getElementById('result-name');
    const classifierConf = document.getElementById('result-confidence');
    if (classifierName && classifierConf) {
        classifierName.textContent = prediction.type.name;
        classifierConf.textContent = `Confidence: ${prediction.confidence}%`;

        // Change icon based on severity
        const iconDiv = document.querySelector('.result-icon');
        if (iconDiv) {
            iconDiv.className = `result-icon ${prediction.type.severity === 'info' ? 'info' : 'warning'}`;
        }
    }

    // 4. Trigger Alerts & Update Dashboard if it's a pest!
    if (prediction.type.name !== 'Wind/Rain') {
        // Show Toast
        const severityType = prediction.type.severity === 'critical' ? 'critical' : prediction.type.severity === 'high' ? 'warning' : 'info';
        showToast(severityType, `${prediction.type.name} Detected`, `${zone.name} — ${freq.toFixed(1)}Hz signal. Risk: ${prediction.type.disease}`);

        // Update Stats
        const detectionsToday = document.getElementById('detections-today');
        if (detectionsToday) detectionsToday.textContent = parseInt(detectionsToday.textContent) + 1;

        const activeThreats = document.getElementById('active-threats');
        if (activeThreats) activeThreats.textContent = parseInt(activeThreats.textContent) + 1;

        // Add to Live Detection Rows and Re-render Table!
        if (typeof liveDetectionRows !== 'undefined') {
            liveDetectionRows.unshift({
                pest: prediction.type,
                confidence: prediction.confidence,
                zone: zone,
                time: 'Just now',
                status: 'active'
            });
            if(liveDetectionRows.length > 8) liveDetectionRows.pop(); // Keep table concise
            renderDetectionTable();
        }
    }
}

function startLiveUpdates() {
    // Every 5 seconds, simulate a new sensor reading & classification!
    setInterval(simulateSensorEvent, 5000);

    // Randomly fluctuate farm health slightly
    setInterval(() => {
        const el = document.getElementById('farm-health');
        if (el) {
            const current = parseInt(el.textContent);
            const delta = Math.random() > 0.5 ? 1 : -1;
            const newVal = Math.max(70, Math.min(98, current + delta));
            el.textContent = newVal + '%';
        }
    }, 20000);
}

// ===== SEARCH =====
document.getElementById('search-input')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length < 2) return;

    const matchedZone = ZONES.find(z => z.name.toLowerCase().includes(query) || z.crop.toLowerCase().includes(query));
    const matchedPest = PEST_TYPES.find(p => p.name.toLowerCase().includes(query));

    if (matchedZone) {
        document.querySelector('[data-page="zones"]')?.click();
        setTimeout(() => {
            document.querySelector(`[data-zone-id="${matchedZone.id}"]`)?.click();
        }, 200);
    } else if (matchedPest) {
        document.querySelector('[data-page="detection"]')?.click();
    }
});

// Handle "View All" button on detections
document.getElementById('view-all-detections')?.addEventListener('click', () => {
    document.querySelector('[data-page="detection"]')?.click();
});

// ===== TRANSLATION LOGIC (English to Hindi) =====
let isHindi = false;
let originalTexts = new Map();

const hindiTranslations = {
    // Nav & Headers
    "Dashboard": "डैशबोर्ड",
    "Real-time farm monitoring overview": "रीयल-टाइम में खेत की निगरानी का अवलोकन",
    "Zone Map": "ज़ोन मैप",
    "Farm Zone Map": "फार्म ज़ोन मैप",
    "Detection": "निरीक्षण",
    "Alerts": "अलर्ट (चेतावनी)",
    "Analytics": "विश्लेषिकी",
    "System Online": "सिस्टम ऑनलाइन",
    "24 Sensors Active": "24 सेंसर सक्रिय",

    // Stats
    "Active Sensors": "सक्रिय सेंसर",
    "Detections Today": "आज की पहचान",
    "Active Threats": "सक्रिय खतरे",
    "Farm Health": "खेत का स्वास्थ्य",
    "+2 this week": "+2 इस सप्ताह",
    "+5 vs yesterday": "+5 कल की तुलना में",
    "Requires attention": "ध्यान देने की आवश्यकता है",
    "+3% this week": "+3% इस सप्ताह",

    // Cards & Sections
    "Live Vibration Feed": "लाइव कंपन फ़ीड",
    "Recent Detections": "हाल की पहचान",
    "View All →": "सभी देखें →",
    "Zone Health Overview": "ज़ोन स्वास्थ्य अवलोकन",
    "ML Model Status": "ML मॉडल की स्थिति",
    "Accuracy": "सटीकता",
    "Precision": "यथार्थता",
    "Recall": "रीकॉल",
    "F1 Score": "F1 स्कोर",
    "Latency": "विलंबता",

    // Map & Detection
    "Grid": "ग्रिड",
    "List": "सूची",
    "Select a Zone": "एक ज़ोन चुनें",
    "Click on a zone to see detailed sensor data, vibration patterns, and detection history.": "विस्तृत सेंसर डेटा, कंपन पैटर्न और पहचान इतिहास देखने के लिए एक ज़ोन पर क्लिक करें।",
    "Vibration Classifier": "कंपन क्लासिफायर",
    "Processing": "प्रसंस्करण",
    "Detected": "पहचाना गया",
    "Detection History": "पहचान का इतिहास",
    "Species Classification": "प्रजाति वर्गीकरण",

    // Filters & Tables
    "All Types": "सभी प्रकार",
    "Aphids": "एफिड्स",
    "Whitefly": "सफेद मक्खी",
    "Stem Borer": "तना छेदक",
    "Thrips": "थ्रिप्स",
    "Time": "समय",
    "Zone": "ज़ोन",
    "Pest Type": "कीट का प्रकार",
    "Confidence": "विश्वास",
    "Severity": "गंभीरता",
    "Status": "स्थिति",

    // Analytics & Notifications
    "Detection Trends": "पहचान रुझान",
    "Pest Distribution": "कीट वितरण",
    "Activity Heatmap": "गतिविधि हीटमैप",
    "Last 7 days by hour": "घंटे द्वारा पिछले 7 दिन",
    "Severity Breakdown": "गंभीरता का विवरण",
    "Notifications": "सूचनाएं",
    "Clear All": "सभी हटाएं",
    "Mark All Read": "सभी पठित चिह्नित करें",
    "All": "सभी",
    "Critical": "गंभीर",
    "Warning": "चेतावनी",
    "Info": "जानकारी",
    "All Clear": "सब साफ",
    "All alerts marked as read": "सभी अलर्ट पढ़े गए के रूप में चिह्नित किए गए",

    // Remedies & Advisory
    "Show Remedy": "उपाय देखें",
    "Farmer Advisory & Updates": "किसान सलाह और सरकारी योजनाएं",
    "32°C / Partly Cloudy": "32°C / आंशिक रूप से बादल",
    "Wind Speed: 12 km/h (East). Humidity: 65%.": "हवा की गति: 12 किमी/घंटा (पूर्व)। आर्द्रता: 65%।",
    "⚠️ Heavy rain expected in 48 hours. Postpone neem oil spraying.": "⚠️ 48 घंटों में भारी बारिश की आशंका। नीम तेल के छिड़काव को स्थगित करें।",
    "✅ Good weather for soil testing and sensor deployment.": "✅ मिट्टी परीक्षण और सेंसर लगाने के लिए अच्छा मौसम।",
    "PM-Kisan Samman Nidhi": "पीएम-किसान सम्मान निधि",
    "13th installment released. Deadline for e-KYC extended to 30th May.": "13वीं किस्त जारी। ई-केवाईसी की सीमा 30 मई तक बढ़ाई गई।",
    "Sub-Mission on Agricultural Mechanization": "कृषि यंत्रीकरण पर उप-मिशन (SMAM)",
    "Get up to 40% subsidy on buying new smart sensors and tractors.": "नए स्मार्ट सेंसर और ट्रैक्टर खरीदने पर 40% तक की सब्सिडी प्राप्त करें।",
    "Pradhan Mantri Krishi Sinchayee Yojana": "प्रधानमंत्री कृषि सिंचाई योजना",
    "Apply for micro-irrigation systems. Grant available for 5+ hectares.": "माइक्रो-सिंचाई प्रणालियों के लिए आवेदन करें। 5+ हेक्टेयर के लिए छूट उपलब्ध।",

    // Profile Section
    "Farmer Profile": "किसान प्रोफ़ाइल",
    "Farmer Kisan": "किसान प्रोफ़ाइल",
    "Farm Details": "खेत का विवरण",
    "Total Area:": "कुल क्षेत्रफल:",
    "12 Hectares": "12 हेक्टेयर",
    "Primary Crop:": "मुख्य फसल:",
    "Wheat, Cotton": "गेहूँ, कपास",
    "Soil Type:": "मिट्टी का प्रकार:",
    "Black Cotton": "काली कपास मिट्टी",
    "System Configuration": "सिस्टम कॉन्फ़िगरेशन",
    "Connected Sensors:": "जुड़े हुए सेंसर:",
    "24 Active": "24 सक्रिय",
    "Subscription Plan:": "सदस्यता योजना:",
    "Subsidy PM-Kisan": "पीएम-किसान सब्सिडी",
    "Last Calibration:": "अंतिम अंशांकन:",
    "2 Days Ago": "2 दिन पहले",
    "Support & Contacts": "सहायता और संपर्क",
    "Local KVK Agent:": "स्थानीय KVK एजेंट:",
    "KVK Contact:": "KVK संपर्क:",
    "1800-180-1551 (Toll Free)": "1800-180-1551 (टोल फ्री)",
    "Sign Out": "साइन आउट"
};

function initProfilePanel() {
    const avatar = document.getElementById('user-avatar');
    const panel = document.getElementById('profile-panel');
    const closeBtn = document.getElementById('close-profile');
    const overlay = document.getElementById('notification-overlay');

    if (!avatar || !panel || !overlay) return;

    avatar.addEventListener('click', () => {
        panel.classList.add('open');
        overlay.classList.add('open');
    });

    closeBtn?.addEventListener('click', () => {
        panel.classList.remove('open');
        overlay.classList.remove('open');
    });

    overlay.addEventListener('click', () => {
        panel.classList.remove('open');
        // Overlay removal handled by notification logic as well, but safe here
    });
}

function initLanguageToggle() {
    const btn = document.getElementById('language-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        isHindi = !isHindi;
        btn.querySelector('span').style.color = isHindi ? 'var(--accent-green)' : '';

        translateDOM(document.body);

        // Also translate placeholders
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            if (isHindi) {
                if (!originalTexts.has(searchInput)) originalTexts.set(searchInput, searchInput.placeholder);
                searchInput.placeholder = "ज़ोन, अलर्ट खोजें...";
            } else {
                searchInput.placeholder = originalTexts.get(searchInput) || "Search zones, alerts...";
            }
        }

        showToast('info', isHindi ? 'भाषा बदल गई' : 'Language Changed', isHindi ? 'एप्लिकेशन की भाषा हिंदी में कर दी गई है।' : 'Application language set to English.');
    });
}

function translateDOM(element) {
    // Process text nodes
    for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            const trimmed = node.nodeValue.trim();
            if (trimmed) {
                if (isHindi) {
                    if (hindiTranslations[trimmed]) {
                        // Save original
                        if (!originalTexts.has(node)) {
                            originalTexts.set(node, node.nodeValue);
                        }
                        // Keep leading/trailing spaces
                        const leading = node.nodeValue.match(/^\s*/)[0];
                        const trailing = node.nodeValue.match(/\s*$/)[0];
                        node.nodeValue = leading + hindiTranslations[trimmed] + trailing;
                    }
                } else {
                    // Revert to English
                    if (originalTexts.has(node)) {
                        node.nodeValue = originalTexts.get(node);
                    }
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Skip scripts and styling
            if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'CANVAS') {
                translateDOM(node);
            }
        }
    }
}

// ===== EXTRA INTERACTIONS =====
function initExtraInteractions() {
    // 1. Map View Toggles (Grid / List)
    const mapContainer = document.getElementById('farm-map');
    const viewBtns = document.querySelectorAll('.zone-map-card .card-actions .pill-btn');
    if (viewBtns.length > 0 && mapContainer) {
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (btn.dataset.view === 'list') {
                    const listHTML = ZONES.map(z => `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s;" onclick="showZoneDetails('${z.id}')" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                            <div style="display:flex; gap:12px; align-items:center;">
                                <div style="width:12px; height:12px; border-radius:50%; background:${z.status === 'critical'?'var(--accent-red)':z.status==='warning'?'var(--accent-amber)':'var(--accent-green)'}; box-shadow:0 0 8px ${z.status === 'critical'?'var(--accent-red)':z.status==='warning'?'var(--accent-amber)':'var(--accent-green)'}"></div>
                                <span style="font-weight: 500; font-size: 1.1rem;">${z.name}</span>
                            </div>
                            <div style="display:flex; gap:20px; align-items:center;">
                                <span style="color:var(--text-muted); font-size: 0.9rem;">${z.temp}°C • ${z.moisture}% Moisture</span>
                                <span class="status-badge ${z.status}" style="min-width: 80px; text-align: center;">${z.status}</span>
                            </div>
                        </div>
                    `).join('');
                    mapContainer.innerHTML = `<div style="max-height: 480px; overflow-y: auto; padding-right: 10px;">${listHTML}</div>`;
                } else {
                    mapContainer.innerHTML = '';
                    initZoneMap(); // re-init svg
                }
            });
        });
    }

    // 2. Detection History Filter
    const historySelect = document.getElementById('history-filter');
    if (historySelect) {
        historySelect.addEventListener('change', (e) => {
            showToast('info', 'Filter Applied', `History filtered for: ${e.target.options[e.target.selectedIndex].text}`);
        });
    }

    // 3. Search Inputs
    const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="Search"]');
    searchInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim() !== '') {
                showToast('info', 'Search Initiated', `Searching global database for "${e.target.value}"...`);
                e.target.value = '';
            }
        });
    });

    // 4. Logout / Session
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('warning', 'Session Ended', 'Logging out of CropGuard AI system...');
            setTimeout(() => window.location.href = 'login.html', 1500);
        });
    });

    // 5. Vibration Zone Select Options
    const vibSelect = document.getElementById('vibration-zone-select');
    if (vibSelect) {
        // Clear old hardcoded options
        vibSelect.innerHTML = '<option value="all">Global Scan</option>';
        ZONES.forEach(z => {
            const opt = document.createElement('option');
            opt.value = z.id;
            opt.textContent = z.name;
            vibSelect.appendChild(opt);
        });
        
        vibSelect.addEventListener('change', (e) => {
            showToast('info', 'Sensor Target Updated', `Live telemetry feed switched to track: ${e.target.options[e.target.selectedIndex].text}`);
        });
    }
}

// ===== HOME PAGE INTERACTIONS =====
function initHomePageInteractions() {

    // ── 1. Farmer name pill → open profile panel ──────────────────────────
    const farmerPill = document.querySelector('.hero-info-pill:first-child');
    if (farmerPill) {
        farmerPill.style.cursor = 'pointer';
        farmerPill.title = 'View Farmer Profile';
        farmerPill.addEventListener('click', () => {
            const panel   = document.getElementById('profile-panel');
            const overlay = document.getElementById('notification-overlay');
            if (panel && overlay) {
                panel.classList.add('open');
                overlay.classList.add('open');
            }
        });
    }

    // ── 2. Crop pill (Wheat & Cotton) → go to Dashboard ──────────────────
    const cropPill = document.querySelector('.hero-info-pills .hero-info-pill:nth-child(2)');
    if (cropPill) {
        cropPill.style.cursor = 'pointer';
        cropPill.title = 'View Dashboard';
        cropPill.addEventListener('click', () => {
            document.getElementById('nav-dashboard')?.click();
        });
    }

    // ── 3. Sensors pill → go to Zone Map ─────────────────────────────────
    const sensorPill = document.querySelector('.hero-info-pills .hero-info-pill:nth-child(3)');
    if (sensorPill) {
        sensorPill.style.cursor = 'pointer';
        sensorPill.title = 'View Zone Map';
        sensorPill.addEventListener('click', () => {
            document.getElementById('nav-zones')?.click();
        });
    }

    // ── 4. Weather Advisory card ──────────────────────────────────────────
    const weatherCard = document.getElementById('home-feat-weather');
    if (weatherCard) {
        weatherCard.style.cursor = 'pointer';
        weatherCard.addEventListener('click', () => openWeatherModal());
    }

    // ── 5. Govt. Schemes card ─────────────────────────────────────────────
    const schemesCard = document.getElementById('home-feat-schemes');
    if (schemesCard) {
        schemesCard.style.cursor = 'pointer';
        schemesCard.addEventListener('click', () => openSchemesModal());
    }

    // inject modal styles once
    injectHomeModalStyles();
}

// ── Weather Modal ──────────────────────────────────────────────────────────
function openWeatherModal() {
    closeExistingModal();
    const modal = document.createElement('div');
    modal.id = 'home-modal-overlay';
    modal.innerHTML = `
        <div class="home-modal" id="home-modal-box" role="dialog" aria-modal="true">
            <div class="home-modal-header">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.5rem;">🌤️</span>
                    <div>
                        <h3 style="margin:0;font-size:1.05rem;font-weight:700;">Weather Advisory</h3>
                        <p style="margin:0;font-size:0.75rem;color:var(--text-muted);">Punjab, India — Today</p>
                    </div>
                </div>
                <button class="home-modal-close" id="home-modal-close-btn">✕</button>
            </div>
            <div class="home-modal-body">

                <!-- Current weather row -->
                <div class="hm-weather-hero">
                    <div class="hm-temp">32°C</div>
                    <div class="hm-weather-details">
                        <div class="hm-badge" style="background:rgba(251,191,36,0.15);color:#fbbf24;">☁️ Partly Cloudy</div>
                        <div style="margin-top:8px;font-size:0.85rem;color:var(--text-secondary);">
                            💧 Humidity: <b style="color:#fff;">65%</b> &nbsp;·&nbsp;
                            💨 Wind: <b style="color:#fff;">12 km/h (E)</b>
                        </div>
                        <div style="margin-top:4px;font-size:0.85rem;color:var(--text-secondary);">
                            🌅 Sunrise: <b style="color:#fff;">6:04 AM</b> &nbsp;·&nbsp;
                            🌇 Sunset: <b style="color:#fff;">6:48 PM</b>
                        </div>
                    </div>
                </div>

                <!-- 5-day forecast -->
                <div class="hm-section-label">5-Day Forecast</div>
                <div class="hm-forecast-row">
                    <div class="hm-day-card"><div>Today</div><div class="hm-day-icon">🌤️</div><div>32°C</div></div>
                    <div class="hm-day-card"><div>Wed</div><div class="hm-day-icon">⛅</div><div>29°C</div></div>
                    <div class="hm-day-card"><div>Thu</div><div class="hm-day-icon">🌧️</div><div>25°C</div></div>
                    <div class="hm-day-card hm-alert-day"><div>Fri</div><div class="hm-day-icon">⛈️</div><div>22°C</div></div>
                    <div class="hm-day-card"><div>Sat</div><div class="hm-day-icon">🌤️</div><div>30°C</div></div>
                </div>

                <!-- Farm advisories -->
                <div class="hm-section-label">Crop Advisories</div>
                <div class="hm-advisory-list">
                    <div class="hm-advisory warning">
                        <span class="hm-adv-icon">⚠️</span>
                        <div>
                            <b>Heavy rain expected in 48 hours</b>
                            <p>Postpone neem oil spraying. Heavy rain will wash off pesticides before they take effect.</p>
                        </div>
                    </div>
                    <div class="hm-advisory success">
                        <span class="hm-adv-icon">✅</span>
                        <div>
                            <b>Good for soil testing &amp; sensor deployment</b>
                            <p>Today's dry, mild conditions are ideal for field work and sensor recalibration.</p>
                        </div>
                    </div>
                    <div class="hm-advisory info">
                        <span class="hm-adv-icon">💧</span>
                        <div>
                            <b>Irrigation recommended</b>
                            <p>Low soil moisture (62%). Irrigate Wheat fields in Zone 1 &amp; 2 before Thursday's rain.</p>
                        </div>
                    </div>
                    <div class="hm-advisory info">
                        <span class="hm-adv-icon">🌡️</span>
                        <div>
                            <b>High temperature alert for Cotton</b>
                            <p>Temperature above 30°C increases Whitefly breeding. Increase monitoring frequency in Zone 5.</p>
                        </div>
                    </div>
                </div>

            </div>
            <div class="home-modal-footer">
                <button class="primary-btn" onclick="document.getElementById('nav-dashboard')?.click(); closeExistingModal();" style="flex:1;justify-content:center;">
                    View Full Dashboard
                </button>
                <button class="pill-btn" onclick="closeExistingModal()" style="padding:10px 20px;">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('open'));
    modal.addEventListener('click', (e) => { if (e.target === modal) closeExistingModal(); });
    document.getElementById('home-modal-close-btn')?.addEventListener('click', closeExistingModal);
}

// ── Govt. Schemes Modal ────────────────────────────────────────────────────
function openSchemesModal() {
    closeExistingModal();
    const schemes = [
        {
            icon: '🏛️', color: '#60a5fa',
            name: 'PM-Kisan Samman Nidhi',
            status: 'Active',
            statusColor: '#34d399',
            desc: '13th installment released. Deadline for e-KYC extended to 30th May 2026.',
            amount: '₹6,000 / year',
            action: 'Check Status'
        },
        {
            icon: '🚜', color: '#a78bfa',
            name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
            status: 'Apply Now',
            statusColor: '#fbbf24',
            desc: 'Get up to 40% subsidy on buying new smart sensors, drones and tractors.',
            amount: 'Up to 40% subsidy',
            action: 'Apply'
        },
        {
            icon: '💧', color: '#06b6d4',
            name: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)',
            status: 'Apply Now',
            statusColor: '#fbbf24',
            desc: 'Apply for micro-irrigation systems. Grant available for farms 5+ hectares.',
            amount: 'Grant per hectare',
            action: 'Apply'
        },
        {
            icon: '🌾', color: '#34d399',
            name: 'Fasal Bima Yojana (PMFBY)',
            status: 'Enroll by May 31',
            statusColor: '#f87171',
            desc: 'Crop insurance at 2% premium for Kharif and 1.5% for Rabi crops. Protects against pest damage.',
            amount: 'Market rate coverage',
            action: 'Enroll'
        },
        {
            icon: '🔬', color: '#fbbf24',
            name: 'Soil Health Card Scheme',
            status: 'Free',
            statusColor: '#34d399',
            desc: 'Free soil analysis every 2 years. Nutrient deficiency report + fertilizer recommendations.',
            amount: 'Free of cost',
            action: 'Request Card'
        },
    ];

    const schemeHtml = schemes.map(s => `
        <div class="hm-scheme-card">
            <div class="hm-scheme-icon" style="color:${s.color};background:${s.color}22;">${s.icon}</div>
            <div class="hm-scheme-info">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                    <h4 style="margin:0;font-size:0.9rem;font-weight:700;color:#fff;">${s.name}</h4>
                    <span style="font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:8px;white-space:nowrap;background:${s.statusColor}22;color:${s.statusColor};">${s.status}</span>
                </div>
                <p style="margin:4px 0 6px;font-size:0.8rem;color:var(--text-secondary);line-height:1.5;">${s.desc}</p>
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-size:0.78rem;font-weight:600;color:${s.color};">💰 ${s.amount}</span>
                    <button onclick="showToast('success','${s.action} Initiated','You will be redirected to the official government portal.'); closeExistingModal();" style="font-size:0.72rem;padding:4px 12px;border-radius:6px;background:${s.color}22;border:1px solid ${s.color}44;color:${s.color};cursor:pointer;font-weight:600;">${s.action} →</button>
                </div>
            </div>
        </div>
    `).join('');

    const modal = document.createElement('div');
    modal.id = 'home-modal-overlay';
    modal.innerHTML = `
        <div class="home-modal" id="home-modal-box" role="dialog" aria-modal="true">
            <div class="home-modal-header">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.5rem;">🏛️</span>
                    <div>
                        <h3 style="margin:0;font-size:1.05rem;font-weight:700;">Government Schemes</h3>
                        <p style="margin:0;font-size:0.75rem;color:var(--text-muted);">Active benefits for Lalan Singh · Punjab</p>
                    </div>
                </div>
                <button class="home-modal-close" id="home-modal-close-btn">✕</button>
            </div>
            <div class="home-modal-body">
                <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:10px;margin-bottom:16px;">
                    <span>📞</span>
                    <span style="font-size:0.82rem;color:var(--text-secondary);">KVK Helpline: <b style="color:#fff;">1800-180-1551</b> (Toll Free) · Agent: Ramesh Singh</span>
                </div>
                <div class="hm-scheme-list">${schemeHtml}</div>
            </div>
            <div class="home-modal-footer">
                <button class="primary-btn" onclick="showToast('info','KVK Portal Opening','Redirecting to official Farmer Portal...'); closeExistingModal();" style="flex:1;justify-content:center;">
                    🌐 Open Farmer Portal
                </button>
                <button class="pill-btn" onclick="closeExistingModal()" style="padding:10px 20px;">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('open'));
    modal.addEventListener('click', (e) => { if (e.target === modal) closeExistingModal(); });
    document.getElementById('home-modal-close-btn')?.addEventListener('click', closeExistingModal);
}

function closeExistingModal() {
    const existing = document.getElementById('home-modal-overlay');
    if (existing) {
        existing.classList.remove('open');
        setTimeout(() => existing.remove(), 300);
    }
}

// ── Modal CSS injected once ────────────────────────────────────────────────
function injectHomeModalStyles() {
    if (document.getElementById('home-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'home-modal-styles';
    style.textContent = `
        #home-modal-overlay {
            position: fixed; inset: 0; z-index: 9999;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(6px);
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
            opacity: 0; transition: opacity 0.25s ease;
        }
        #home-modal-overlay.open { opacity: 1; }
        .home-modal {
            background: #111827;
            border: 1px solid rgba(148,163,184,0.12);
            border-radius: 20px;
            width: 100%; max-width: 560px;
            max-height: 85vh;
            display: flex; flex-direction: column;
            box-shadow: 0 24px 60px rgba(0,0,0,0.5);
            transform: translateY(20px);
            transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
            overflow: hidden;
        }
        #home-modal-overlay.open .home-modal { transform: translateY(0); }
        .home-modal-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 20px 22px 16px;
            border-bottom: 1px solid rgba(148,163,184,0.08);
            flex-shrink: 0;
        }
        .home-modal-close {
            background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
            color: var(--text-secondary); border-radius: 8px;
            width: 32px; height: 32px; cursor: pointer; font-size: 0.85rem;
            transition: all 0.15s; display:flex;align-items:center;justify-content:center;
        }
        .home-modal-close:hover { background: rgba(248,113,113,0.15); color: #f87171; border-color:#f87171; }
        .home-modal-body {
            padding: 20px 22px;
            overflow-y: auto;
            flex: 1;
        }
        .home-modal-footer {
            display: flex; gap: 10px; align-items: center;
            padding: 16px 22px; border-top: 1px solid rgba(148,163,184,0.08);
            flex-shrink: 0;
        }
        /* Weather styles */
        .hm-weather-hero {
            display: flex; align-items: center; gap: 20px;
            background: linear-gradient(135deg,rgba(251,191,36,0.08),rgba(6,182,212,0.06));
            border: 1px solid rgba(251,191,36,0.15);
            border-radius: 14px; padding: 18px 20px; margin-bottom: 18px;
        }
        .hm-temp { font-size: 3rem; font-weight: 900; color: #fff; line-height: 1; }
        .hm-badge {
            display: inline-flex; align-items: center; gap: 5px;
            font-size: 0.8rem; font-weight: 600;
            padding: 4px 12px; border-radius: 20px;
        }
        .hm-section-label {
            font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.08em; color: var(--text-muted);
            margin: 0 0 10px;
        }
        .hm-forecast-row {
            display: flex; gap: 8px; margin-bottom: 18px; overflow-x: auto;
        }
        .hm-day-card {
            flex: 1; min-width: 64px;
            text-align: center; padding: 10px 8px;
            background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
            border-radius: 10px;
            font-size: 0.78rem; color: var(--text-secondary);
            display: flex; flex-direction: column; align-items: center; gap: 5px;
        }
        .hm-alert-day { border-color: rgba(248,113,113,0.3) !important; background: rgba(248,113,113,0.06) !important; }
        .hm-day-icon { font-size: 1.3rem; }
        .hm-advisory-list { display: flex; flex-direction: column; gap: 10px; }
        .hm-advisory {
            display: flex; gap: 12px; align-items: flex-start;
            padding: 12px 14px; border-radius: 10px;
        }
        .hm-advisory.warning { background: rgba(251,191,36,0.07); border: 1px solid rgba(251,191,36,0.18); }
        .hm-advisory.success { background: rgba(52,211,153,0.07); border: 1px solid rgba(52,211,153,0.18); }
        .hm-advisory.info    { background: rgba(6,182,212,0.07);  border: 1px solid rgba(6,182,212,0.18); }
        .hm-advisory b  { font-size: 0.85rem; color: #fff; display: block; margin-bottom: 3px; }
        .hm-advisory p  { font-size: 0.78rem; color: var(--text-secondary); margin: 0; line-height: 1.5; }
        .hm-adv-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
        /* Schemes styles */
        .hm-scheme-list { display: flex; flex-direction: column; gap: 12px; }
        .hm-scheme-card {
            display: flex; gap: 14px; align-items: flex-start;
            padding: 14px 16px;
            background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
            border-radius: 12px;
            transition: all 0.2s;
        }
        .hm-scheme-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); }
        .hm-scheme-icon {
            width: 40px; height: 40px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.2rem; flex-shrink: 0;
        }
        .hm-scheme-info { flex: 1; }
    `;
    document.head.appendChild(style);
}