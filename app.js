'use strict';
const KEY = 'onihome.logs.v1';
const KNOWN_CATS = ['株', 'ゲーム', '雑談', 'シャドバ'];
const SRC_LABEL = {
  'youtube-main': 'YouTube メイン',
  'youtube-sub': '天才おにや',
  'twitch': 'Twitch',
  'followboard': 'FollowBoard'
};
let entries = [];
let myData = {};

function loadMy() {
  try { myData = JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch (e) { myData = {}; }
}
function saveMy() { localStorage.setItem(KEY, JSON.stringify(myData)); }
function myOf(id) { return myData[id] || { status: '', memo: '' }; }

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function jstDate(iso) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' }).formatToParts(d);
  const g = t => (parts.find(p => p.type === t) || {}).value || '';
  return { key: g('year') + '/' + g('month') + '/' + g('day'), label: g('month') + '/' + g('day') + '（' + g('weekday') + '）' };
}
function jstTime(iso) {
  return new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}
function fmtChecked(iso) {
  if (!iso) return '不明';
  return new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}
function fmtDur(sec) {
  if (sec == null || isNaN(sec)) return '';
  sec = Math.floor(sec);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return (h > 0 ? h + ':' : '') + mm + ':' + String(s).padStart(2, '0');
}
function catMatches(e, fc) {
  if (!fc) return true;
  if (fc === 'その他') return !e.categories.some(c => KNOWN_CATS.includes(c));
  return e.categories.includes(fc);
}

function render() {
  const fc = document.getElementById('filterCategory').value;
  const fs = document.getElementById('filterStatus').value;
  const cnt = s => entries.filter(e => myOf(e.id).status === s).length;
  document.getElementById('summary').textContent =
    '全 ' + entries.length + ' 件 ／ 見た ' + cnt('見た') + ' 件 ／ あとで見る ' + cnt('あとで見る') + ' 件 ／ 途中 ' + cnt('途中') + ' 件';

  const items = entries
    .filter(e => catMatches(e, fc) && (!fs || (fs === '未設定' ? !myOf(e.id).status : myOf(e.id).status === fs)))
    .slice().sort((a, b) => (b.live - a.live) || String(b.publishedAt).localeCompare(String(a.publishedAt)));

  const root = document.getElementById('archive');
  if (!items.length) { root.innerHTML = '<p class="empty">該当する放送がありません。</p>'; return; }

  let html = '', curKey = '';
  for (const e of items) {
    const d = jstDate(e.publishedAt);
    const groupKey = e.live ? '__live__' : d.key;
    if (groupKey !== curKey) {
      curKey = groupKey;
      html += '<div class="dayhead">' + (e.live ? '配信中' : esc(d.label)) + '</div>';
    }
    const my = myOf(e.id);
    const dur = fmtDur(e.durationSec);
    html += '<div class="entry">'
      + (e.thumbnail ? '<a class="thumb" href="' + esc(e.url) + '" target="_blank" rel="noopener"><img src="' + esc(e.thumbnail) + '" alt="" loading="lazy"></a>' : '')
      + '<div class="einfo"><div class="etitle">'
      + (e.live ? '<span class="livebadge">放送中</span>' : '')
      + '<a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.title) + '</a></div>'
      + '<div class="emeta"><span class="src">' + esc(SRC_LABEL[e.source] || e.source) + '</span>'
      + e.categories.map(c => '<span class="tag">' + esc(c) + '</span>').join('')
      + esc(jstTime(e.publishedAt)) + (dur ? ' ・ ' + dur : '')
      + '</div>'
      + '<div class="estate"><select data-status="' + esc(e.id) + '" class="' + (my.status ? 'st-' + esc(my.status) : '') + '">'
      + '<option value="">未設定</option>'
      + ['見た', 'あとで見る', '途中'].map(s => '<option' + (my.status === s ? ' selected' : '') + '>' + s + '</option>').join('')
      + '</select><input type="text" data-memo="' + esc(e.id) + '" placeholder="メモ" value="' + esc(my.memo) + '"></div>'
      + '</div></div>';
  }
  root.innerHTML = html;

  root.querySelectorAll('[data-status]').forEach(sel => {
    sel.addEventListener('change', () => {
      const id = sel.getAttribute('data-status');
      myData[id] = Object.assign(myOf(id), { status: sel.value });
      if (!myData[id].status && !myData[id].memo) delete myData[id];
      saveMy(); render();
    });
  });
  root.querySelectorAll('[data-memo]').forEach(inp => {
    inp.addEventListener('change', () => {
      const id = inp.getAttribute('data-memo');
      myData[id] = Object.assign(myOf(id), { memo: inp.value.trim() });
      if (!myData[id].status && !myData[id].memo) delete myData[id];
      saveMy(); render();
    });
  });
}

async function init() {
  loadMy();
  try {
    const res = await fetch('broadcasts.json');
    const data = await res.json();
    entries = Array.isArray(data.entries) ? data.entries : [];
    const meta = data.meta || {};
    document.getElementById('lastChecked').textContent = '最終チェック日時：' + fmtChecked(meta.lastCheckedAt) + '（状態はこの時点のものです）';
    if (meta.xChecked === false) {
      const xn = document.getElementById('xNote');
      xn.hidden = false;
      xn.textContent = '※ ' + (meta.xNote || '直近のチェックでは X を確認できませんでした');
    }
    if (meta.scheduleNote) {
      const sn = document.getElementById('scheduleNote');
      sn.hidden = false;
      sn.textContent = meta.scheduleNote;
    }
  } catch (e) {
    document.getElementById('lastChecked').textContent = '最終チェック日時：読み込めませんでした';
    entries = [];
  }
  render();
}

document.getElementById('filterCategory').addEventListener('change', render);
document.getElementById('filterStatus').addEventListener('change', render);

document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), logs: myData }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'onihome-logs.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('importFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const src = data && typeof data === 'object' ? (data.logs || data) : null;
      if (!src || typeof src !== 'object' || Array.isArray(src)) throw new Error('bad format');
      const clean = {};
      for (const [id, v] of Object.entries(src)) {
        if (v && typeof v === 'object') {
          clean[String(id)] = { status: String(v.status || ''), memo: String(v.memo || '') };
        }
      }
      myData = clean;
      saveMy(); render();
      alert('インポートしました（' + Object.keys(myData).length + ' 件）');
    } catch (err) { alert('読み込めませんでした。JSONの形式を確認してください。'); }
    e.target.value = '';
  };
  reader.readAsText(file);
});

init();
