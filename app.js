// ===== CropGuard AI — Application Logic =====

// Polyfill for roundRect (older browsers)
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
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
    { id: 'A1', name: 'Zone A1', crop: 'Wheat', sensors: 3, health: 95, status: 'healthy' },
    { id: 'A2', name: 'Zone A2', crop: 'Wheat', sensors: 2, health: 88, status: 'healthy' },
    { id: 'A3', name: 'Zone A3', crop: 'Rice', sensors: 3, health: 72, status: 'warning' },
    { id: 'A4', name: 'Zone A4', crop: 'Rice', sensors: 2, health: 91, status: 'healthy' },
    { id: 'B1', name: 'Zone B1', crop: 'Cotton', sensors: 2, health: 45, status: 'critical' },
    { id: 'B2', name: 'Zone B2', crop: 'Cotton', sensors: 3, health: 83, status: 'healthy' },
    { id: 'B3', name: 'Zone B3', crop: 'Sugarcane', sensors: 2, health: 67, status: 'warning' },
    { id: 'B4', name: 'Zone B4', crop: 'Sugarcane', sensors: 2, health: 90, status: 'healthy' },
    { id: 'C1', name: 'Zone C1', crop: 'Maize', sensors: 2, health: 94, status: 'healthy' },
    { id: 'C2', name: 'Zone C2', crop: 'Maize', sensors: 1, health: 58, status: 'critical' },
    { id: 'C3', name: 'Zone C3', crop: 'Soybean', sensors: 2, health: 86, status: 'healthy' },
    { id: 'C4', name: 'Zone C4', crop: 'Soybean', sensors: 1, health: 79, status: 'warning' },
];

const ALERTS_DATA = [
    {
        id: 1,
        type: 'critical',
        title: 'Stem Borer Infestation Detected — Zone B1',
        description: 'Piezoelectric sensors in Zone B1 detected persistent high-frequency vibrations (2.4kHz–3.8kHz) consistent with Stem Borer larval activity. ML model classified with 96.8% confidence. Immediate intervention recommended.',
        zone: 'B1',
        time: '12 min ago',
        read: false,
        pest: 'Stem Borer',
        disease: 'Stem Rot',
    },
    {
        id: 2,
        type: 'critical',
        title: 'Whitefly Population Surge — Zone C2',
        description: 'Unusual vibration pattern detected across 3 sensors in Zone C2. Frequency analysis matches Whitefly wing-beat signature. Population density estimated at 85 per leaf. Risk of Yellowing Disease transmission is high.',
        zone: 'C2',
        time: '28 min ago',
        read: false,
        pest: 'Whitefly',
        disease: 'Yellowing Disease',
    },
    {
        id: 3,
        type: 'warning',
        title: 'Aphid Activity Increasing — Zone A3',
        description: 'Low-frequency vibration anomalies detected in Zone A3 sensors. Pattern matches early-stage Aphid colony formation. Current confidence: 82.1%. Monitoring recommended — may escalate in 24–48 hours.',
        zone: 'A3',
        time: '1 hour ago',
        read: false,
        pest: 'Aphid',
        disease: 'Leaf Curl Virus',
    },
    {
        id: 4,
        type: 'warning',
        title: 'Thrip Vibration Pattern — Zone B3',
        description: 'Intermittent micro-vibrations in Zone B3 match thrip feeding patterns. Confidence: 78.4%. No visible crop damage yet. Continue monitoring.',
        zone: 'B3',
        time: '2 hours ago',
        read: true,
        pest: 'Thrips',
        disease: 'Spotted Wilt',
    },
    {
        id: 5,
        type: 'info',
        title: 'Sensor Calibration Complete — Zone A1',
        description: 'All 3 piezoelectric sensors in Zone A1 have been recalibrated. Sensitivity improved by 12%. New baseline vibration thresholds applied.',
        zone: 'A1',
        time: '3 hours ago',
        read: true,
    },
    {
        id: 6,
        type: 'warning',
        title: 'Spider Mite Indicators — Zone C4',
        description: 'Sensors detecting characteristic low-amplitude high-frequency patterns associated with spider mite activity. Confidence rising — currently at 73.9%.',
        zone: 'C4',
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

function renderDetectionTable() {
    const tbody = document.getElementById('detection-table-body');
    if (!tbody) return;

    const rows = [
        { pest: PEST_TYPES[2], confidence: '96.8', zone: ZONES[4], time: '12m ago', status: 'active' },
        { pest: PEST_TYPES[1], confidence: '91.3', zone: ZONES[9], time: '28m ago', status: 'active' },
        { pest: PEST_TYPES[0], confidence: '82.1', zone: ZONES[2], time: '1h ago', status: 'monitoring' },
        { pest: PEST_TYPES[6], confidence: '88.7', zone: ZONES[11], time: '1h ago', status: 'monitoring' },
        { pest: PEST_TYPES[3], confidence: '78.4', zone: ZONES[6], time: '2h ago', status: 'monitoring' },
        { pest: PEST_TYPES[4], confidence: '85.2', zone: ZONES[8], time: '3h ago', status: 'resolved' },
        { pest: PEST_TYPES[5], confidence: '74.1', zone: ZONES[1], time: '4h ago', status: 'resolved' },
        { pest: PEST_TYPES[7], confidence: '92.6', zone: ZONES[3], time: '5h ago', status: 'resolved' },
        { pest: PEST_TYPES[0], confidence: '89.4', zone: ZONES[7], time: '6h ago', status: 'resolved' },
        { pest: PEST_TYPES[2], confidence: '95.1', zone: ZONES[4], time: '8h ago', status: 'resolved' },
        { pest: PEST_TYPES[1], confidence: '87.3', zone: ZONES[10], time: '10h ago', status: 'resolved' },
        { pest: PEST_TYPES[3], confidence: '76.9', zone: ZONES[5], time: '12h ago', status: 'resolved' },
    ];

    tbody.innerHTML = rows.map(r => `
        <tr>
            <td>${r.time}</td>
            <td>${r.zone.name}</td>
            <td>
                <span style="display:flex;align-items:center;gap:8px">
                    <span>${r.pest.icon}</span>
                    <span>${r.pest.name}</span>
                </span>
            </td>
            <td><span class="confidence-value">${r.confidence}%</span></td>
            <td><span class="severity-badge ${r.pest.severity}">${r.pest.severity}</span></td>
            <td><span class="status-badge ${r.status}">${r.status}</span></td>
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

    // Dark background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, w, h);

    // Generate spectrogram-like visual
    const cols = 120;
    const rows = 40;
    const cellW = w / cols;
    const cellH = h / rows;

    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const freq = y / rows;
            const time = x / cols;
            const intensity = Math.sin(freq * 12 + time * 8) * 0.3 +
                             Math.sin(freq * 5 - time * 3) * 0.2 +
                             Math.random() * 0.15;

            const band1 = Math.exp(-Math.pow(freq - 0.3, 2) / 0.01) * Math.sin(time * 15) * 0.5;
            const band2 = Math.exp(-Math.pow(freq - 0.6, 2) / 0.015) * Math.cos(time * 10) * 0.4;
            const band3 = Math.exp(-Math.pow(freq - 0.8, 2) / 0.008) * Math.sin(time * 20) * 0.3;

            const val = Math.max(0, Math.min(1, intensity + band1 + band2 + band3));

            let r, g, b;
            if (val < 0.25) {
                r = 0; g = val * 4 * 100; b = 80 + val * 4 * 120;
            } else if (val < 0.5) {
                const t = (val - 0.25) * 4;
                r = 0; g = 100 + t * 111; b = 200 - t * 120;
            } else if (val < 0.75) {
                const t = (val - 0.5) * 4;
                r = t * 251; g = 211; b = 80 - t * 80;
            } else {
                const t = (val - 0.75) * 4;
                r = 248; g = 211 - t * 100; b = 0;
            }

            ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${0.3 + val * 0.7})`;
            ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
        }
    }

    // Axis labels
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.font = '10px "JetBrains Mono"';
    ctx.fillText('0 Hz', 4, h - 4);
    ctx.fillText('5 kHz', 4, 12);
    ctx.fillText('Time →', w - 50, h - 4);
}

// ===== SPECIES CHART (Bar chart) =====
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
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 20, bottom: 50, left: 60 };

    const data = [
        { name: 'Aphid', count: 42 },
        { name: 'Whitefly', count: 35 },
        { name: 'Borer', count: 28 },
        { name: 'Thrips', count: 22 },
        { name: 'Miner', count: 18 },
        { name: 'Mealybug', count: 12 },
        { name: 'Mite', count: 15 },
        { name: 'Fruit Fly', count: 8 },
    ];

    const maxVal = Math.max(...data.map(d => d.count));
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
    const colors = [
        '#34d399', '#06b6d4', '#f87171', '#fbbf24',
        '#a78bfa', '#60a5fa', '#fb923c', '#e879f9'
    ];

    data.forEach((d, i) => {
        const x = padding.left + i * (barWidth + gap) + gap / 2;
        const barH = (d.count / maxVal) * chartH;
        const y = padding.top + chartH - barH;

        // Bar gradient
        const grad = ctx.createLinearGradient(0, y, 0, y + barH);
        grad.addColorStop(0, colors[i]);
        grad.addColorStop(1, colors[i] + '44');

        ctx.fillStyle = grad;
        ctx.beginPath();
        // Use roundRect with fallback
        if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
        } else {
            ctx.rect(x, y, barWidth, barH);
        }
        ctx.fill();

        // Label
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(d.name, x + barWidth / 2, h - padding.bottom + 16);

        // Value on top
        ctx.fillStyle = 'rgba(241, 245, 249, 0.8)';
        ctx.font = '11px "JetBrains Mono"';
        ctx.fillText(d.count, x + barWidth / 2, y - 6);
    });
}

// ===== ZONE MAP =====
function initZoneMap() {
    const map = document.getElementById('farm-map');
    if (!map) return;

    map.innerHTML = ZONES.map(zone => {
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

    // Click handlers
    map.querySelectorAll('.farm-zone').forEach(el => {
        el.addEventListener('click', () => {
            map.querySelectorAll('.farm-zone').forEach(z => z.classList.remove('selected'));
            el.classList.add('selected');
            showZoneDetails(el.dataset.zoneId);
        });
    });
}

function showZoneDetails(zoneId) {
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return;

    const title = document.getElementById('zone-detail-title');
    const content = document.getElementById('zone-detail-content');

    title.textContent = zone.name;

    const sensors = Array.from({ length: zone.sensors }, (_, i) => {
        const online = Math.random() > 0.1;
        return `
            <div class="zone-sensor-item">
                <span class="zone-sensor-id">PZS-${zone.id}-${String(i + 1).padStart(2, '0')}</span>
                <span class="zone-sensor-status ${online ? 'online' : 'offline'}">${online ? 'Online' : 'Offline'}</span>
            </div>
        `;
    }).join('');

    const threatPest = PEST_TYPES[Math.floor(Math.random() * PEST_TYPES.length)];

    content.innerHTML = `
        <div class="zone-detail-stats">
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
        <div style="margin-bottom:14px">
            <div style="font-size:0.82rem;font-weight:600;margin-bottom:8px">Crop: ${zone.crop}</div>
            <div style="font-size:0.78rem;color:var(--text-secondary)">Primary Threat: <span style="color:var(--accent-amber)">${threatPest.name}</span> → ${threatPest.disease}</div>
        </div>
        <div style="font-size:0.82rem;font-weight:600;margin-bottom:8px">Sensor Array</div>
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

window.toggleRemedy = function(id, disease) {
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
function initAnalytics() {
    // Render on first view
}

function renderAnalytics() {
    renderTrendChart();
    renderDistributionChart();
    renderHeatmap();
    renderSeverityBars();
}

function renderTrendChart() {
    const canvas = document.getElementById('trend-canvas');
    if (!canvas) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const detections = [12, 18, 8, 22, 15, 9, 17];
    const threats = [2, 4, 1, 5, 3, 1, 3];
    const maxVal = Math.max(...detections) + 5;

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

    // Day labels
    days.forEach((d, i) => {
        const x = padding.left + (i / (days.length - 1)) * chartW;
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(d, x, h - 10);
    });

    function drawLine(data, color, fillColor) {
        ctx.beginPath();
        data.forEach((val, i) => {
            const x = padding.left + (i / (data.length - 1)) * chartW;
            const y = padding.top + (1 - val / maxVal) * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else {
                const prevX = padding.left + ((i - 1) / (data.length - 1)) * chartW;
                const prevY = padding.top + (1 - data[i - 1] / maxVal) * chartH;
                const cpx = (prevX + x) / 2;
                ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
            }
        });

        if (fillColor) {
            const lastX = padding.left + chartW;
            const lastY = padding.top + chartH;
            ctx.lineTo(lastX, lastY);
            ctx.lineTo(padding.left, lastY);
            ctx.closePath();
            const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
            grad.addColorStop(0, fillColor);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fill();
        }

        ctx.beginPath();
        data.forEach((val, i) => {
            const x = padding.left + (i / (data.length - 1)) * chartW;
            const y = padding.top + (1 - val / maxVal) * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else {
                const prevX = padding.left + ((i - 1) / (data.length - 1)) * chartW;
                const prevY = padding.top + (1 - data[i - 1] / maxVal) * chartH;
                const cpx = (prevX + x) / 2;
                ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
            }
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        data.forEach((val, i) => {
            const x = padding.left + (i / (data.length - 1)) * chartW;
            const y = padding.top + (1 - val / maxVal) * chartH;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });
    }

    drawLine(detections, '#34d399', 'rgba(52, 211, 153, 0.1)');
    drawLine(threats, '#f87171', 'rgba(248, 113, 113, 0.08)');

    // Legend
    ctx.fillStyle = '#34d399';
    ctx.fillRect(w - 190, 8, 12, 3);
    ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
    ctx.font = '11px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('Detections', w - 172, 14);

    ctx.fillStyle = '#f87171';
    ctx.fillRect(w - 90, 8, 12, 3);
    ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
    ctx.fillText('Threats', w - 72, 14);
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
        showToast('warning', 'Vibration Anomaly', 'Unusual pattern detected in Zone A3 — Sensor PZS-A3-01');
    }, 3000);

    setTimeout(() => {
        showToast('critical', 'Pest Alert', 'Stem Borer activity confirmed in Zone B1. Confidence: 96.8%');
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
