import { Map, NavigationControl, Popup, addProtocol } from 'https://unpkg.com/maplibre-gl@6/dist/maplibre-gl.mjs';
import { Protocol } from 'https://esm.sh/pmtiles@4.3.0';

const protocol = new Protocol();
addProtocol('pmtiles', protocol.tile);

const map = new Map({
    container: 'map',
    hash: true,
    style: './gsi_maki_style.json',
    center: [139.767125, 35.681236],
    zoom: 5,
});

map.addControl(new NavigationControl());
const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// クリック位置の前後数ピクセルを含めて地物を拾う
const queryFeatures = (point) => map.queryRenderedFeatures([
    [point.x - 3, point.y - 3],
    [point.x + 3, point.y + 3],
]);

const featureToHtml = (feature) => {
    const rows = Object.entries(feature.properties)
        .map(([key, value]) => `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(value)}</td></tr>`)
        .join('');
    return `
        <section class="feature-info">
            <h3>${escapeHtml(feature.layer.id)}</h3>
            <p>source-layer: ${escapeHtml(feature.sourceLayer ?? '-')} / type: ${escapeHtml(feature.layer.type)}</p>
            <table>${rows}</table>
        </section>`;
};

map.on('click', (e) => {
    const features = queryFeatures(e.point);
    if (features.length === 0) return;

    new Popup({ maxWidth: '360px' })
        .setLngLat(e.lngLat)
        .setHTML(`<div class="feature-popup">${features.map(featureToHtml).join('')}</div>`)
        .addTo(map);
});

map.on('mousemove', (e) => {
    map.getCanvas().style.cursor = queryFeatures(e.point).length > 0 ? 'pointer' : '';
});
