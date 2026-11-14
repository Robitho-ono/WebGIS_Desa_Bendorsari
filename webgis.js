const bendosariCoords = [-7.870064656405021, 112.43504149548616];
const map = L.map('map').setView(bendosariCoords, 13);

map.options.minZoom = 12;
map.options.maxZoom = 18;

const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

const satelitLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
});

const administrasiLayer = L.featureGroup();
const jalanLayer = L.featureGroup();
const sungaiLayer = L.featureGroup();
const rumahLayer = L.featureGroup();
const tdsLayer = L.featureGroup();
const tssLayer = L.featureGroup();
const codLayer = L.featureGroup();

const baseMaps = {
    "osm": osmLayer,
    "satelit": satelitLayer
};

const overlayMaps = {
    "administrasi": administrasiLayer,
    "jalan": jalanLayer,
    "sungai": sungaiLayer,
    "rumah": rumahLayer,
    "tds": tdsLayer,
    "tss": tssLayer,
    "cod": codLayer,
};

const activeLegends = new Set();
const waterQualityLayers = ['tds', 'tss', 'cod'];

const legendConfig = {
    "administrasi": {
        category: "INFRASTRUCTURE",
        items: [{ label: "Sub-village / Hamlet Boundary", color: "yellow" }]
    },
    "jalan": {
        category: "INFRASTRUCTURE",
        items: [{ label: "Road Network", color: "blue" }]
    },
    "sungai": {
        category: "INFRASTRUCTURE",
        items: [{ label: "River Drainage Network", color: "cyan" }]
    },
    "rumah": {
        category: "INFRASTRUCTURE",
        items: [{ label: "Residential Buildings", color: "#ff6b6b" }]
    },
    "tds": {
        category: "WATER QUALITY: TDS",
        items: [{ label: "TDS Sampling Site", color: "red" }]
    },
    "tss": {
        category: "WATER QUALITY: TSS",
        items: [
            { label: "Class I (≤ 50 mg/L - Pristine)", color: "green" },
            { label: "Class II (50 - 100 mg/L - Moderate)", color: "yellow" },
            { label: "Class III (100 - 400 mg/L - Polluted)", color: "orange" },
            { label: "Class IV (> 400 mg/L - Critical)", color: "red" }
        ]
    },
    "cod": {
        category: "WATER QUALITY: COD",
        items: [
            { label: "Class II (10 - 25 mg/L - Low Organic)", color: "yellow" },
            { label: "Class III (25 - 50 mg/L - Moderate Waste)", color: "orange" },
            { label: "Class IV (> 50 mg/L - Severe Livestock Impact)", color: "red" }
        ]
    }
};

function updateLegend() {
    const legendEl = document.getElementById('legend');
    if (!legendEl) return;

    if (activeLegends.size === 0) {
        legendEl.innerHTML = `
            <h4>MAP LEGEND</h4>
            <p style="color: #64748b; font-size: 11px; margin: 4px 0 0 0;">Check a layer to display its symbology.</p>
        `;
        return;
    }

    const grouped = {};
    activeLegends.forEach(layerKey => {
        const conf = legendConfig[layerKey];
        if (conf) {
            if (!grouped[conf.category]) {
                grouped[conf.category] = [];
            }
            grouped[conf.category].push(...conf.items);
        }
    });

    let html = '<h4>MAP LEGEND</h4>';
    for (const [subTitle, items] of Object.entries(grouped)) {
        html += `<div class="legend-subheading">${subTitle}</div>`;
        items.forEach(item => {
            html += `
                <div class="legend-item">
                    <span style="background-color: ${item.color};"></span>
                    <label>${item.label}</label>
                </div>
            `;
        });
    }

    legendEl.innerHTML = html;
}

function switchBasemap(type) {
    if (type === 'osm') {
        map.removeLayer(satelitLayer);
        osmLayer.addTo(map);
    } else if (type === 'satelit') {
        map.removeLayer(osmLayer);
        satelitLayer.addTo(map);
    }
}

function getLayerObject(name) {
    if (name === 'administrasi') return administrasiLayer;
    if (name === 'jalan') return jalanLayer;
    if (name === 'sungai') return sungaiLayer;
    if (name === 'rumah') return rumahLayer;
    if (name === 'tds') return tdsLayer;
    if (name === 'tss') return tssLayer;
    if (name === 'cod') return codLayer;
    return null;
}

function toggleLayer(layerName, isChecked) {
    const targetLayer = getLayerObject(layerName);
    if (!targetLayer) return;

    if (isChecked) {
        targetLayer.addTo(map);
        activeLegends.add(layerName);
    } else {
        map.removeLayer(targetLayer);
        activeLegends.delete(layerName);
    }

    updateLegend();
}

function switchLayer(layerName) {
    const waterLayers = {
        'tds': tdsLayer,
        'tss': tssLayer,
        'cod': codLayer
    };

    Object.keys(waterLayers).forEach(key => {
        map.removeLayer(waterLayers[key]);
        activeLegends.delete(key);
    });

    if (waterLayers[layerName]) {
        waterLayers[layerName].addTo(map);
        activeLegends.add(layerName);
    }

    updateLegend();
}

let semuaTerpilih = false;

function toggleAllLayers() {
    semuaTerpilih = !semuaTerpilih;
    
    // Perbaikan: gunakan nama array yang konsisten (daftarLayer)
    const daftarLayer = ['administrasi', 'jalan', 'sungai', 'rumah'];
    daftarLayer.forEach(nama => {
        toggleLayer(nama, semuaTerpilih);
        const inputEl = document.getElementById('chk-' + nama);
        if (inputEl) inputEl.checked = semuaTerpilih;
    });

    if (semuaTerpilih) {
        switchLayer('tds');
        const chkTds = document.getElementById('chk-tds');
        if (chkTds) chkTds.checked = true;
    } else {
        switchLayer('none');
        const radNone = document.querySelector('input[name="parameter"][value="none"]');
        if (radNone) radNone.checked = true;
    }
}

function zoomToDesa() {
    if (administrasiLayer.getLayers().length > 0) {
        map.fitBounds(administrasiLayer.getBounds());
    } else {
        map.flyTo(bendosariCoords, 14, { duration: 1.2 });
    }
}

updateLegend();
fetch('BatasDusun_.json')
    .then(res => res.json())
    .then(data => {
        L.geoJSON(data, { style: { color: "yellow", weight: 2 } }).addTo(administrasiLayer);
    }).catch(err => console.error("Error loading BatasDusun:", err));

fetch('Jalan_.json')
    .then(res => res.json())
    .then(data => {
        L.geoJSON(data, { style: { color: "blue", weight: 2 } }).addTo(jalanLayer);
    }).catch(err => console.error("Error loading Jalan:", err));

fetch('Sungai_line.json')
    .then(res => res.json())
    .then(data => {
        L.geoJSON(data, { style: { color: "cyan", weight: 2 } }).addTo(sungaiLayer);
    }).catch(err => console.error("Error loading Sungai:", err));

fetch('Rumah_.json')
    .then(res => res.json())
    .then(data => {
        L.geoJSON(data, {
            style: { color: "#ff6b6b", weight: 2, fillOpacity: 0.6 }
        }).addTo(rumahLayer);
    }).catch(err => console.error("Error loading Rumah:", err));

fetch('TDS_.json')
    .then(res => res.json())
    .then(data => {
        L.geoJSON(data, { style: { color: "red", weight: 2 } }).addTo(tdsLayer);
    }).catch(err => console.error("Error loading TDS:", err));

fetch('TSS_.json')
    .then(res => res.json())
    .then(data => {
        L.geoJSON(data, {
            style: function (feature) {
                let kelas = feature.properties.Kelas;
                let warna = "red";
                if (kelas === 1) warna = "green";
                else if (kelas === 2) warna = "yellow";
                else if (kelas === 3) warna = "orange";
                return { color: warna, weight: 2 };
            }
        }).addTo(tssLayer);
    }).catch(err => console.error("Error loading TSS:", err));

fetch('COD_.json')
    .then(res => res.json())
    .then(data => {
        L.geoJSON(data, {
            style: function (feature) {
                let kelas = feature.properties.Kelas;
                let warna = "red";
                if (kelas === 2) warna = "yellow";
                else if (kelas === 3) warna = "orange";
                return { color: warna, weight: 2 };
            }
        }).addTo(codLayer);
    }).catch(err => console.error("Error loading COD:", err));