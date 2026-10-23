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

// vt_code → 日本語カテゴリ名の対応表（categories.csv）
const categories = {};
fetch('./categories.csv')
    .then((res) => res.text())
    .then((text) => {
        text.replace(/^﻿/, '').split(/\r?\n/).slice(1).forEach((line) => {
            const [code, category] = line.split(',');
            if (code && category) categories[code.trim()] = category.trim();
        });
    })
    .catch((err) => console.error('categories.csv の読み込みに失敗しました', err));

const formatValue = (feature, key, value) => {
    if (feature.layer.id === 'anno-maki-icons' && key === 'vt_code') {
        const category = categories[String(value)];
        if (category) return `${value}(${category})`;
    }
    return value;
};

// 描画されている maki アイコンの ID（"maki:marker" → "marker"）
// queryRenderedFeatures の結果には評価済みの icon-image が含まれないため、
// スタイルの match 式 ["match", <vt_code>, code, image, ..., fallback] から引く
const makiIconId = (feature) => {
    const expr = map.getLayoutProperty('anno-maki-icons', 'icon-image');
    if (!Array.isArray(expr) || expr[0] !== 'match') return null;
    const code = Number(feature.properties.vt_code);
    let name = expr[expr.length - 1];
    for (let i = 2; i < expr.length - 1; i += 2) {
        const labels = Array.isArray(expr[i]) ? expr[i] : [expr[i]];
        if (labels.includes(code)) {
            name = expr[i + 1];
            break;
        }
    }
    return typeof name === 'string' && name.startsWith('maki:') ? name.slice('maki:'.length) : null;
};

const featureToHtml = (feature) => {
    const entries = Object.entries(feature.properties);
    const iconId = feature.layer.id === 'anno-maki-icons' ? makiIconId(feature) : null;
    if (iconId) entries.unshift(['maki', iconId]);
    const rows = entries
        .map(([key, value]) => `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(formatValue(feature, key, value))}</td></tr>`)
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
