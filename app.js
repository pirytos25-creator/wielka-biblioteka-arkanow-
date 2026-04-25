// ==============================================================
// APP.JS — Logika aplikacji
// ==============================================================

// ============================================================================
// AUDIO CONTROLS
// ============================================================================
let isMuted = false;
let isAudioMuted = false; // alias dla kompatybilności
let savedVolume = parseFloat(localStorage.getItem('arcana_vol') || '0.5');

function toggleAudio() {
  const audio = document.getElementById('bg-ambient');
  const icon = document.getElementById('audio-icon');
  const slider = document.getElementById('audio-vol-slider');
  const label = document.getElementById('audio-vol-label');
  if(isMuted) {
    audio.volume = savedVolume;
    icon.className = 'fa-solid fa-volume-high';
    slider.value = Math.round(savedVolume * 100);
    label.textContent = Math.round(savedVolume * 100) + '%';
    isMuted = false; isAudioMuted = false;
  } else {
    savedVolume = audio.volume > 0 ? audio.volume : savedVolume;
    audio.volume = 0.0;
    icon.className = 'fa-solid fa-volume-xmark';
    slider.value = 0;
    label.textContent = 'OFF';
    isMuted = true; isAudioMuted = true;
  }
}

function setAudioVolume(val) {
  const audio = document.getElementById('bg-ambient');
  const icon = document.getElementById('audio-icon');
  const label = document.getElementById('audio-vol-label');
  const vol = val / 100;
  audio.volume = vol;
  savedVolume = vol > 0 ? vol : savedVolume;
  localStorage.setItem('arcana_vol', savedVolume.toString());
  label.textContent = val == 0 ? 'OFF' : val + '%';
  if (val == 0) {
    icon.className = 'fa-solid fa-volume-xmark';
    isMuted = true; isAudioMuted = true;
  } else {
    icon.className = val < 30 ? 'fa-solid fa-volume-low' : 'fa-solid fa-volume-high';
    isMuted = false; isAudioMuted = false;
  }
}

// ============================================================================
// INTRO KINOWE & SLAJD POWITALNY
// ============================================================================
function openLibraryGates() {
  const left = document.getElementById('gate-left');
  const right = document.getElementById('gate-right');
  const content = document.getElementById('gate-content');
  const overlay = document.getElementById('cinematic-gates');
  const slide = document.getElementById('intro-slide');
  const ambient = document.getElementById('bg-ambient');
  const audioCtrl = document.getElementById('audio-ctrl');

  left.classList.add('open');
  right.classList.add('open');
  content.classList.add('fade');

  // MROCZNY AMBIENT - głośność z localStorage (domyślnie 50%)
  ambient.volume = savedVolume;
  ambient.play().catch(e => console.log("Audio zablokowane - wciśnij przycisk głośnika."));

  setTimeout(() => { audioCtrl.classList.add('show'); }, 1500);

  // Zmysłowy Głos Powitalny
  if(window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance("Witaj w Bibliotece Magii. Czekałam na ciebie od bardzo dawna.");
    u.lang = 'pl-PL'; u.pitch = 0.65; u.rate = 0.8; 
    const voices = window.speechSynthesis.getVoices();
    const plVoice = voices.find(v => v.lang === 'pl-PL' && (v.name.includes('Paulina') || v.name.includes('Zosia') || v.name.includes('Female')));
    if(plVoice) u.voice = plVoice;
    setTimeout(() => { window.speechSynthesis.speak(u); }, 500);
  }

  setTimeout(() => {
    overlay.remove();
    slide.style.visibility = 'visible';
    slide.style.opacity = '1';

    // ── Uruchom wideo powitalnego po pojawieniu się slajdu ──
    const introVideo = document.getElementById('intro-video');
    if (introVideo) {
      introVideo.muted = false;
      introVideo.volume = Math.min(savedVolume * 1.4, 1.0);
      introVideo.play().catch(() => {
        // Autoplay z dźwiękiem zablokowany - fallback na muted loop
        introVideo.muted = true;
        introVideo.play().catch(() => {});
      });
    }
  }, 2500);
}

function enterMainHall() {
  const slide = document.getElementById('intro-slide');
  const mainApp = document.getElementById('main-app');

  // Zatrzymaj wideo kiedy wchodzimy do głównej sali
  const introVideo = document.getElementById('intro-video');
  if (introVideo) { introVideo.pause(); introVideo.currentTime = 0; }

  slide.style.opacity = '0';
  setTimeout(() => {
    slide.style.visibility = 'hidden';
    mainApp.style.visibility = 'visible';
    mainApp.style.opacity = '1';
    document.body.classList.remove('body-locked');
    setTimeout(() => { showYumiTip('init'); }, 1000);
  }, 1000);
}

// ============================================================================
// DANE (Wklej tutaj resztę ze swoich 248 słówek!)
// ============================================================================

document.getElementById('nav-count-dict').textContent = ALL_WORDS.length;

// ============================================================================
// DANE KSIĘGI ARKANÓW 
// ============================================================================

// ============================================================================
// SYSTEM WYMOWY (ROMAJI -> KANA)
// ============================================================================
const romajiMap = {'masu':'ます','desu':'です','mashita':'ました','masen':'ません','ka':'か','ki':'き','ku':'く','ke':'け','ko':'こ','ga':'が','gi':'ぎ','gu':'ぐ','ge':'げ','go':'ご','sa':'さ','shi':'し','su':'す','se':'せ','so':'そ','za':'ざ','ji':'じ','zu':'ず','ze':'ぜ','zo':'ぞ','ta':'た','chi':'ち','tsu':'つ','te':'て','to':'と','da':'だ','de':'で','do':'ど','na':'な','ni':'に','nu':'ぬ','ne':'ね','no':'の','ha':'は','hi':'ひ','fu':'ふ','he':'へ','ho':'ほ','ba':'ば','bi':'び','bu':'ぶ','be':'べ','bo':'ぼ','pa':'ぱ','pi':'ぴ','pu':'ぷ','pe':'ぺ','po':'ぽ','ma':'ま','mi':'み','mu':'む','me':'め','mo':'も','ya':'や','yu':'ゆ','yo':'よ','ra':'ら','ri':'り','ru':'る','re':'れ','ro':'ろ','wa':'わ','wo':'を','n':'ん','a':'あ','i':'い','u':'う','e':'え','o':'お'};
function toKana(romaji) {
  let result = romaji.toLowerCase().replace(/[^a-z]/g, '');
  let keys = Object.keys(romajiMap).sort((a,b) => b.length - a.length);
  for(let k of keys) result = result.split(k).join(romajiMap[k]);
  return result;
}
function speakText(t, lang='ja-JP'){
  if(!window.speechSynthesis || !t) return;
  window.speechSynthesis.cancel();
  
  let voices = speechSynthesis.getVoices();
  if(!voices.length) {
    speechSynthesis.onvoiceschanged = () => {
      speakText(t, lang);
      speechSynthesis.onvoiceschanged = null;
    };
    setTimeout(() => speakText(t, lang), 250);
    return;
  }
  
  const kanaText = toKana(t);
  let chosenVoice = null;
  let textToSpeak = kanaText;
  let chosenLang = lang;
  
  // 🇯🇵 Najpierw szukamy WSZYSTKICH japońskich głosów
  const jpVoices = voices.filter(v => v.lang.startsWith('ja'));
  
  if(jpVoices.length) {
    // Preferowane kobiece japońskie głosy (znane z Windows/Mac/Chrome)
    const jpFemaleNames = [
      'haruka', 'nanami', 'ayumi', 'kyoko', 'sayaka', 'mizuki',
      'otoya', 'female', 'woman', 'google 日本語'
    ];
    // Wykluczone męskie japońskie
    const jpMaleNames = ['ichiro', 'hattori', 'male', 'man'];
    
    // 1. Spróbuj znaleźć preferowany kobiecy
    let preferred = jpVoices.find(v => {
      const name = v.name.toLowerCase();
      return jpFemaleNames.some(k => name.includes(k));
    });
    
    // 2. Jeśli brak - znajdź pierwszy nie-męski
    if(!preferred) {
      preferred = jpVoices.find(v => {
        const name = v.name.toLowerCase();
        return !jpMaleNames.some(k => name.includes(k));
      });
    }
    
    // 3. Fallback - jakikolwiek japoński
    chosenVoice = preferred || jpVoices[0];
    chosenLang = chosenVoice.lang;
  } else {
    // Brak japońskiego - fallback na kobiecy głos w innym języku z romaji
    const femaleKeywords = ['female','woman','zira','hazel','susan','samantha','victoria','kate','karen','allison','paulina','zosia','alice','anna','julia','tessa','fiona','moira','google polski','google english'];
    const femaleVoice = voices.find(v => femaleKeywords.some(k => v.name.toLowerCase().includes(k)));
    chosenVoice = femaleVoice || voices[0];
    textToSpeak = t.toLowerCase();
    chosenLang = chosenVoice.lang || 'en-US';
  }
  
  const u = new SpeechSynthesisUtterance(textToSpeak);
  u.voice = chosenVoice;
  u.lang = chosenLang;
  u.rate = 0.85;
  u.pitch = 1.1;
  u.volume = (typeof savedVolume !== 'undefined' ? savedVolume : 1.0);
  speechSynthesis.speak(u);
}

// 🇯🇵 Pre-warming głosów - prosi browser o załadowanie listy głosów wcześniej
if(typeof window !== 'undefined' && window.speechSynthesis) {
  // To chwyta zdarzenie kiedy lista głosów się załaduje (Chrome ładuje async)
  window.speechSynthesis.onvoiceschanged = () => {
    // Loguj dla debugowania - można usunąć
    const jpVoices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('ja'));
    if(jpVoices.length) {
      console.log('🇯🇵 Dostępne japońskie głosy:', jpVoices.map(v => v.name + ' (' + v.lang + ')').join(', '));
    } else {
      console.log('⚠️ Brak japońskich głosów. Zainstaluj japoński pakiet językowy w systemie.');
    }
  };
  // Wymuszenie załadowania
  speechSynthesis.getVoices();
}

// ============================================================================
// NAV, LEKSYKON, YUMI
// ============================================================================
let activeCat='all'; let slots=[]; let favs = new Set(JSON.parse(localStorage.getItem('arcana_favs')||'[]'));
function saveFavs(){ localStorage.setItem('arcana_favs', JSON.stringify([...favs])); }
function catInfo(id){ return CATS.find(c => c.id === id) || CATS[0]; }

function showPage(p){
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(x => x.classList.remove('active'));
  document.getElementById('page-' + p).classList.add('active');
  const tabOrder = ['slownik','mapa','gramatyka','dojo','kiai','zdania','zwoje','sceny','chat','gildia'];
  document.querySelectorAll('.nav-tab').forEach((t,i) => { if(tabOrder[i] === p) t.classList.add('active'); });
  
  if(p === 'gildia') initGuild();
  if(p === 'zdania') renderWordBank();
  if(p === 'gramatyka') initBook();
  if(p === 'mapa') renderWorldMap();
  if(p === 'zwoje') renderScrollsGrid();
  if(p === 'kiai') initKiai();
  if(p === 'sceny') initScenes();
  
  showYumiTip(p);
}

const filtRow = document.getElementById('filt-row');
CATS.forEach(c => {
  const b = document.createElement('button'); b.className = 'fb' + (c.id === 'all' ? ' active' : ''); b.textContent = c.label;
  b.onclick = () => { activeCat = c.id; document.querySelectorAll('.fb').forEach(x => x.classList.remove('active')); b.classList.add('active'); renderGrid(); };
  filtRow.appendChild(b);
});

// ============================================================================
// LEKSYKON — wersja zoptymalizowana (debounce + delegation + fragment)
// ============================================================================

// --- Cache referencji DOM (zamiast setek getElementById w hot path) ---
let _lexDom = null;
function lexDom(){
  if (_lexDom && document.body.contains(_lexDom.grid)) return _lexDom;
  _lexDom = {
    search: document.getElementById('search'),
    grid:   document.getElementById('grid-container'),
    stats:  document.getElementById('stats-line'),
    favCt:  document.getElementById('fav-count'),
  };
  return _lexDom;
}

// --- Escape dla bezpiecznego wstrzykiwania do onclick/innerHTML ---
function escAttr(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escHtml(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function switchTab(btn, tab){
  if (typeof event !== 'undefined' && event) event.stopPropagation();
  const body = btn.closest('.card-body');
  if (!body) return;
  body.querySelectorAll('.c-tab').forEach(t => t.classList.remove('active'));
  body.querySelectorAll('.c-tc').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const target = body.querySelector('[data-tab="' + tab + '"]');
  if (target) target.classList.add('active');
}

function makeCard(d){
  const ci = catInfo(d.cat);
  const card = document.createElement('div');
  card.className = 'card';
  // data-romaji pozwala identyfikować kartę w delegowanym handlerze
  card.dataset.romaji = d.r;
  const isFav = favs.has(d.r);

  // Uwaga: wszystkie wartości z d.* przechodzą przez escHtml/escAttr
  const r   = escHtml(d.r);
  const pl  = escHtml(d.pl);
  const en  = escHtml(d.en);
  const e   = escHtml(d.e);
  const ex  = escHtml(d.ex || '');
  const expl= escHtml(d.expl || '');
  const ety = escHtml(d.ety || 'Pradawny rdzeń japoński.');
  const fun = escHtml(d.fun || 'Sekrety tej runy czekają na odkrycie.');

  card.innerHTML = `
    <div class="card-h">
      <div class="card-em" style="background:${ci.color}15;border-color:${ci.color}55">${e}</div>
      <div class="card-info">
        <div class="card-r">${r}</div>
        <div class="card-pl">${pl} <span style="color:var(--parchment3);font-size:11px">(${en})</span></div>
      </div>
      <div class="card-acts">
        <button class="icon-btn" data-act="speak-r" type="button">🔊</button>
        <button class="icon-btn ${isFav?'faved':''}" data-act="fav" type="button">⭐</button>
      </div>
    </div>
    <div class="card-body">
      <div class="c-tabs">
        <div class="c-tab active" data-act="tab" data-tab-target="info">📚 Info</div>
        <div class="c-tab"        data-act="tab" data-tab-target="ex">💬 Użycie</div>
        <div class="c-tab"        data-act="tab" data-tab-target="fun">✨ Sekret</div>
      </div>
      <div class="c-tc active" data-tab="info">
        <div class="info-lbl">Etymologia</div><div class="info-val">${ety}</div>
      </div>
      <div class="c-tc" data-tab="ex">
        <div class="ex-box"><div class="ex-jp">${ex}</div><div class="ex-pl">${expl}</div></div>
        <button class="btn" style="margin-top:8px; font-weight:700; width:100%; justify-content:center;" data-act="speak-ex" type="button">🔊 Wymów zdanie</button>
      </div>
      <div class="c-tc" data-tab="fun">
        <div class="fun-box">💡 ${fun}</div>
      </div>
    </div>`;
  // UWAGA: bez addEventListener per karta — obsługuje je globalny delegation handler
  return card;
}

// --- Delegated click handler — JEDEN listener na #grid-container zamiast setek ---
let _lexDelegationBound = false;
function bindLexiconDelegation(){
  if (_lexDelegationBound) return;
  const grid = lexDom().grid;
  if (!grid) return;
  _lexDelegationBound = true;

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const romaji = card.dataset.romaji;
    const actEl = e.target.closest('[data-act]');

    if (actEl) {
      const act = actEl.dataset.act;
      e.stopPropagation();

      if (act === 'speak-r') {
        speakText(romaji);
      } else if (act === 'fav') {
        toggleFav(romaji, actEl);
      } else if (act === 'tab') {
        switchTab(actEl, actEl.dataset.tabTarget);
      } else if (act === 'speak-ex') {
        const wordObj = ALL_WORDS.find(w => w.r === romaji);
        if (wordObj && wordObj.ex) speakText(wordObj.ex);
      }
      return;
    }
    // Klik w "pustą" część karty = toggle open
    card.classList.toggle('open');
  });
}

// --- renderGrid: DocumentFragment = jedno dotknięcie DOM ---
function renderGrid(){
  const dom = lexDom();
  if (!dom.grid) return;

  const q = (dom.search?.value || '').toLowerCase().trim();
  const filtered = ALL_WORDS.filter(d => {
    if(d.cat === 'extra' && activeCat !== 'extra' && activeCat !== 'all') return false;
    const mc = activeCat === 'all' || d.cat === activeCat;
    const mq = !q || d.pl.toLowerCase().includes(q) || d.r.toLowerCase().includes(q);
    return mc && mq;
  });

  if (dom.stats) dom.stats.textContent = `Zwoje w zasięgu wzroku: ${filtered.length}`;

  // Stawiamy WSZYSTKO w pamięci, dopiero potem jedno podmienienie contentu
  const frag = document.createDocumentFragment();

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:40px; text-align:center; color:var(--parchment3); font-style:italic;';
    empty.textContent = 'Brak glifów spełniających to zaklęcie...';
    frag.appendChild(empty);
  } else {
    // Grupowanie zachowujące oryginalną kolejność kategorii
    const groupsInOrder = [];
    const groupMap = Object.create(null);
    for (const d of filtered) {
      const catLabel = catInfo(d.cat).label;
      if (!groupMap[catLabel]) { groupMap[catLabel] = []; groupsInOrder.push(catLabel); }
      groupMap[catLabel].push(d);
    }
    for (const catName of groupsInOrder) {
      const header = document.createElement('h3');
      header.className = 'lexicon-category-title';
      header.textContent = `✦ ${catName}`;
      frag.appendChild(header);

      const grid = document.createElement('div');
      grid.className = 'grid';
      const innerFrag = document.createDocumentFragment();
      for (const d of groupMap[catName]) innerFrag.appendChild(makeCard(d));
      grid.appendChild(innerFrag);
      frag.appendChild(grid);
    }
  }

  // Jeden raz czyścimy i wstawiamy
  dom.grid.replaceChildren(frag);

  // Upewnij się że delegation jest podpięta (pierwsze wywołanie)
  bindLexiconDelegation();
}

// --- Debounced wersja dla onInput (wywoływana z <input oninput>) ---
let _renderGridTimer = null;
function renderGridDebounced(){
  clearTimeout(_renderGridTimer);
  _renderGridTimer = setTimeout(renderGrid, 180);
}

function toggleFav(r, btn){
  const wasFav = favs.has(r);
  if(wasFav){
    favs.delete(r);
    if (btn) btn.classList.remove('faved');
  } else {
    favs.add(r);
    if (btn) btn.classList.add('faved');
    if (typeof srsInitCard === 'function') srsInitCard(r);
  }
  saveFavs();
  const favCt = lexDom().favCt;
  if (favCt) favCt.textContent = favs.size;
}

// YUMI
let yumiSeen = {};
function showYumiTip(page){
  const tip = YUMI_TIPS[page] || YUMI_TIPS.init; if(yumiSeen[page]) return; yumiSeen[page] = true;
  const yumi = document.getElementById('yumi'); document.getElementById('yumi-text').innerHTML = tip; yumi.style.display = 'flex'; yumi.classList.remove('mini');
}
function hideYumi(){ document.getElementById('yumi').classList.add('mini'); }
function toggleYumi(){
  const yumi = document.getElementById('yumi');
  if(yumi.classList.contains('mini')){
    const activeNav = document.querySelector('.nav-tab.active'); const pages = ['slownik','mapa','gramatyka','dojo','kiai','zdania','zwoje','sceny','chat','gildia'];
    const tabs = document.querySelectorAll('.nav-tab'); let current = 'init'; tabs.forEach((t,i) => { if(t === activeNav) current = pages[i]; });
    document.getElementById('yumi-text').innerHTML = YUMI_TIPS[current] || YUMI_TIPS.init; yumi.classList.remove('mini');
  } else { hideYumi(); }
}

// ============================================================================
// KSIĘGA ARKANÓW CLAUDE 3D Z MAGIC FLIP — ENHANCED
// ============================================================================
let currentChapter = 'toc';

// PAGE NUMBERS per chapter
const CHAPTER_PAGE_NUMS = { toc: 'i', particles: '1', tenses: '7', other: '14' };
// SEALS per chapter
const CHAPTER_SEALS = { toc: '魔', particles: '語', tenses: '時', other: '法' };

function getPageHTML(chapterKey) {
  let html = '';
  if (chapterKey === 'toc') {
    html = `
      <div class="g-toc-title">✦ Prawa Magii ✦</div>
      <div style="text-align:center; color:#5a3820; margin-bottom:40px; font-style:italic; font-weight:600;">Wybierz zwój do studiowania.</div>
      <button class="toc-btn" onclick="turnBookPage('particles')">
        <span class="toc-number">I.</span>Złote Partykuły
        <span class="toc-dots"></span><span class="toc-pg">1</span>
      </button>
      <button class="toc-btn" onclick="turnBookPage('tenses')">
        <span class="toc-number">II.</span>Władza nad Czasem
        <span class="toc-dots"></span><span class="toc-pg">7</span>
      </button>
      <button class="toc-btn" onclick="turnBookPage('other')">
        <span class="toc-number">III.</span>Inne Prawa Magii
        <span class="toc-dots"></span><span class="toc-pg">14</span>
      </button>
    `;
  } else {
    const data = BOOK_CHAPTERS[chapterKey];
    html = `<div class="b-chapter">${data.title}</div>`;
    data.entries.forEach((e, idx) => {
      html += `
        <div class="a-entry" style="animation-delay:${idx * 0.08}s">
          <div class="a-rune" onclick="glowRune(this)" title="Kliknij, aby rozświetlić">${e.r}</div>
          <div class="a-content">
            <div class="a-title">${e.t} <span>[${e.r_r}]</span></div>
            <div class="a-desc">${e.d}</div>
            <div class="a-ex" style="position:relative;">
              <b>${e.ex}</b><br><span>${e.expl}</span>
              <button class="a-ex-tts" onclick="readEntryAloud(this, '${e.ex.replace(/'/g,'&apos;')}')" title="Czytaj po japońsku">🔊</button>
            </div>
            <div class="a-akemi"><b>🔮 Akemi radzi:</b> ${e.akemi}</div>
          </div>
        </div>`;
    });
    html += `<div class="b-nav"><button class="btn-book" onclick="turnBookPage('${data.prev}')">← Wstecz</button><button class="btn-book" onclick="turnBookPage('${data.next}')">Dalej →</button></div>`;
  }
  return html;
}

function glowRune(el) {
  el.classList.remove('glowing');
  void el.offsetWidth;
  el.classList.add('glowing');
  // Play a soft magical tone
  playRuneChime();
  setTimeout(() => el.classList.remove('glowing'), 800);
}

function playRuneChime() {
  if (isAudioMuted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 880;
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.15, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.6);
  } catch(e) {}
}

// TTS - czytanie japońskich przykładów
let ttsCurrentBtn = null;
function readEntryAloud(btn, text) {
  if (!window.speechSynthesis) { showToast('Twoja przeglądarka nie wspiera TTS.'); return; }
  if (ttsCurrentBtn) {
    ttsCurrentBtn.classList.remove('playing');
    window.speechSynthesis.cancel();
    if (ttsCurrentBtn === btn) { ttsCurrentBtn = null; return; }
  }
  ttsCurrentBtn = btn;
  btn.classList.add('playing');
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP'; u.rate = 0.85; u.pitch = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const jpVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja');
  if (jpVoice) u.voice = jpVoice;
  u.onend = () => { btn.classList.remove('playing'); if (ttsCurrentBtn === btn) ttsCurrentBtn = null; };
  u.onerror = () => { btn.classList.remove('playing'); if (ttsCurrentBtn === btn) ttsCurrentBtn = null; };
  window.speechSynthesis.speak(u);
}

function triggerParticleBurst(theme) {
    const pContainer = document.getElementById('book-particles');
    pContainer.classList.remove('is-bursting');
    void pContainer.offsetWidth; 
    pContainer.classList.add('is-bursting');
    pContainer.innerHTML = '';
    let count = theme === 'fire' ? 30 : (theme === 'nature' ? 25 : 15); 
    for(let i=0; i<count; i++) {
        let p = document.createElement('div'); 
        p.className = 'g-particle';
        p.style.setProperty('--rx', (Math.random() - 0.5) * 2);
        p.style.setProperty('--ry', (Math.random() - 0.5) * 2);
        pContainer.appendChild(p);
    }
}

// Dźwięk przewracania strony
function playPageTurnSound() {
  if (isAudioMuted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    // Noise burst (paper rustle)
    const bufLen = ctx.sampleRate * 0.25;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i/bufLen);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const flt = ctx.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = 2500; flt.Q.value = 0.5;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.12, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    src.connect(flt); flt.connect(g); g.connect(ctx.destination);
    src.start(now); src.stop(now + 0.5);
    // Low thud
    const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 60;
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.25, now); g2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(g2); g2.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.4);
  } catch(e) {}
}

function updateChapterTabs(targetChapter) {
  document.querySelectorAll('.chapter-tab').forEach(t => t.classList.remove('active-tab'));
  const tabMap = { toc: 'tab-toc', particles: 'tab-particles', tenses: 'tab-tenses', other: 'tab-other' };
  const tabEl = document.getElementById(tabMap[targetChapter]);
  if (tabEl) tabEl.classList.add('active-tab');
}

function updatePageNumber(chapterKey) {
  const pn = document.getElementById('page-number-right');
  if (pn) pn.textContent = CHAPTER_PAGE_NUMS[chapterKey] || '?';
}

function triggerChapterSeal(chapterKey) {
  // Dodaj overlay z pieczęcią
  const rightPage = document.getElementById('g-content-container');
  let seal = rightPage.querySelector('.chapter-seal-overlay');
  if (!seal) {
    seal = document.createElement('div');
    seal.className = 'chapter-seal-overlay';
    seal.innerHTML = `<div class="chapter-seal-glyph">${CHAPTER_SEALS[chapterKey] || '✦'}</div>`;
    rightPage.appendChild(seal);
  } else {
    seal.querySelector('.chapter-seal-glyph').textContent = CHAPTER_SEALS[chapterKey] || '✦';
  }
  seal.classList.remove('stamping');
  void seal.offsetWidth;
  seal.classList.add('stamping');
  setTimeout(() => seal.classList.remove('stamping'), 1200);
}

// Ambient particles dopasowane do motywu
let _currentAmbientTheme = null;
function updateAmbientParticles(theme) {
  const container = document.getElementById('grimoire-ambient');
  if (!container) return;
  // Szybkie wyjście: ten sam motyw = nic nie rób
  if (_currentAmbientTheme === theme && container.children.length > 0) return;
  _currentAmbientTheme = theme;
  container.innerHTML = '';

  const configs = {
    gold: { color: '#d4af37', count: 18, shape: 'circle', size: [3,7], glow: 'rgba(212,175,55,0.7)' },
    fire: { color: '#ff6b35', count: 22, shape: 'circle', size: [4,10], glow: 'rgba(239,68,68,0.7)', colors: ['#ef4444','#f97316','#fbbf24','#ff6b35'] },
    nature: { color: '#10b981', count: 20, shape: 'leaf', size: [6,12], glow: 'rgba(16,185,129,0.6)', colors: ['#10b981','#34d399','#6ee7b7','#a7f3d0'] },
  };
  const cfg = configs[theme] || configs.gold;
  
  for (let i = 0; i < cfg.count; i++) {
    const p = document.createElement('div');
    p.className = 'amb-particle';
    const sz = cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]);
    const col = cfg.colors ? cfg.colors[Math.floor(Math.random() * cfg.colors.length)] : cfg.color;
    const drift = ((Math.random() - 0.5) * 120).toFixed(0) + 'px';
    p.style.cssText = `
      width:${sz}px; height:${sz}px; background:${col};
      left:${Math.random()*100}%; bottom:${Math.random()*30}%;
      border-radius:${cfg.shape === 'leaf' ? '0 50% 0 50%' : '50%'};
      box-shadow: 0 0 ${sz*1.5}px ${cfg.glow};
      animation-duration:${4 + Math.random()*6}s;
      animation-delay:${Math.random()*5}s;
      --drift:${drift};
      transform: rotate(${Math.random()*360}deg);
    `;
    container.appendChild(p);
  }
}

// ===== STABILNY FLIP Z LOCKIEM =====
let isPageTurning = false;

// Wersja BEZ animation-delay dla flip pages (żeby zawartość była widoczna podczas obrotu)
function getPageHTMLStatic(chapterKey) {
  let html = '';
  if (chapterKey === 'toc') {
    html = `
      <div class="g-toc-title">✦ Prawa Magii ✦</div>
      <div style="text-align:center; color:#5a3820; margin-bottom:30px; font-style:italic; font-weight:600;">Wybierz zwój do studiowania.</div>
      <button class="toc-btn" style="opacity:1"><span class="toc-number">I.</span>Złote Partykuły<span class="toc-dots"></span><span class="toc-pg">1</span></button>
      <button class="toc-btn" style="opacity:1"><span class="toc-number">II.</span>Władza nad Czasem<span class="toc-dots"></span><span class="toc-pg">7</span></button>
      <button class="toc-btn" style="opacity:1"><span class="toc-number">III.</span>Inne Prawa Magii<span class="toc-dots"></span><span class="toc-pg">14</span></button>
    `;
  } else {
    const data = BOOK_CHAPTERS[chapterKey];
    html = `<div class="b-chapter">${data.title}</div>`;
    data.entries.forEach(e => {
      html += `
        <div class="a-entry" style="opacity:1;transform:none;animation:none;">
          <div class="a-rune">${e.r}</div>
          <div class="a-content">
            <div class="a-title">${e.t} <span>[${e.r_r}]</span></div>
            <div class="a-desc">${e.d}</div>
            <div class="a-ex"><b>${e.ex}</b><br><span>${e.expl}</span></div>
            <div class="a-akemi"><b>🔮 Akemi radzi:</b> ${e.akemi}</div>
          </div>
        </div>`;
    });
  }
  return html;
}

// Tracking aktywnych timeoutów animacji strony (żeby móc je anulować przy zamknięciu księgi)
let _pageTurnTimers = [];
function clearPageTurnTimers(){
  for (const t of _pageTurnTimers) clearTimeout(t);
  _pageTurnTimers = [];
}

function turnBookPage(targetChapter) {
  // LOCK: blokuj jeśli animacja trwa LUB ta sama strona
  if (targetChapter === currentChapter || isPageTurning) return;
  isPageTurning = true;

  const flipEl   = document.getElementById('g-flip-page');
  const basePage = document.getElementById('g-content-area');
  const book     = document.getElementById('grimoire-book');
  const front    = document.getElementById('g-front');
  const back     = document.getElementById('g-back');
  const watermark = document.getElementById('book-watermark');

  // Zapamiętaj "od" i "do" przed jakąkolwiek zmianą stanu
  const fromChapter = currentChapter;
  const toChapter   = targetChapter;
  const theme = toChapter === 'toc' ? 'gold' : BOOK_CHAPTERS[toChapter].theme;

  // --- Wypełnij flip pages statyczną (nieanimowaną) wersją ---
  front.innerHTML = getPageHTMLStatic(fromChapter) + '<div class="g-inner-border"></div>';
  back.innerHTML  = getPageHTMLStatic(toChapter)   + '<div class="g-inner-border"></div>';

  // Upewnij się że flip nie ma starej klasy turn
  flipEl.classList.remove('turn');
  flipEl.style.display = 'block';

  // --- WAŻNE: wyzeruj inline transform z tiltu ---
  // Bez tego animacja rotateY flipa łączy się z rotateX/rotateY z tiltu = jittering.
  book.style.transform = '';

  // --- Natychmiastowe update wizualne (przed animacją) ---
  book.className = 'grimoire-book theme-' + theme + ' tilt-ready';
  watermark.textContent = (toChapter !== 'toc' && BOOK_CHAPTERS[toChapter]) ? BOOK_CHAPTERS[toChapter].seal : '✧';
  updateChapterTabs(toChapter);
  updatePageNumber(toChapter);
  updateAmbientParticles(theme);
  document.querySelectorAll('.toc-btn').forEach(b => b.classList.remove('active-chap'));
  const activeBtn = document.getElementById('btn-chap-' + toChapter);
  if (activeBtn) activeBtn.classList.add('active-chap');
  playPageTurnSound();

  // --- Animacja ---
  // Dodaj klasę "turning" do księgi (wizualny lock + CSS cursor:wait na tabs)
  book.classList.add('book-turning');

  // Daj przeglądarce jeden frame żeby wyrenderowała flip bez klasy turn
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {        // drugi rAF = gwarancja że reflow jest gotowy
      flipEl.classList.add('turn');

      _pageTurnTimers.push(setTimeout(() => {
        triggerParticleBurst(theme);
        triggerChapterSeal(toChapter);
      }, 500));

      _pageTurnTimers.push(setTimeout(() => {
        // --- CLEANUP po animacji ---
        // Wstaw docelową treść z animacjami wejścia
        basePage.innerHTML = getPageHTML(toChapter);
        const cc = document.getElementById('g-content-container');
        if (cc) cc.scrollTo(0, 0);

        // Schowaj flip i wyczyść klasy
        flipEl.classList.remove('turn');
        flipEl.style.display = 'none';
        front.innerHTML = '';
        back.innerHTML  = '';

        // Zdejmij lock
        book.classList.remove('book-turning');

        // Aktualizuj stan DOPIERO po zakończeniu wszystkiego
        currentChapter = toChapter;
        isPageTurning  = false;
      }, 1350));  // nieco dłużej niż animacja CSS (1200ms) dla pewności
    });
  });
}

function initBook() {
  const basePage = document.getElementById('g-content-area');
  if (basePage.innerHTML === '') {
    basePage.innerHTML = getPageHTML('toc');
    currentChapter = 'toc';
  }
  generateCoverSparkles();
  // UWAGA: initBookTilt jest teraz wywoływane dopiero w openGrimoireBook,
  // żeby listener nie wisiał na zamkniętej księdze i nie przeliczał się bez potrzeby.
  updateAmbientParticles('gold');
}

function generateCoverSparkles() {
  const container = document.getElementById('cover-sparkles');
  if (!container || container.children.length > 0) return;
  for (let i = 0; i < 20; i++) {
    const s = document.createElement('div');
    s.className = 'book-sparkle';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = (Math.random() * 4) + 's';
    s.style.animationDuration = (3 + Math.random() * 3) + 's';
    container.appendChild(s);
  }
}

// ===== 3D HOVER TILT (z guardem na animację + możliwością odpięcia) =====
let _tiltState = null;  // { move, leave, raf }

function initBookTilt() {
  // Idempotentne — jeśli już zbindowane, nie duplikuj
  if (_tiltState) return;

  const wrapper = document.getElementById('grimoire-wrapper');
  const book = document.getElementById('grimoire-book');
  if (!wrapper || !book) return;

  let raf = null;

  const onMove = (e) => {
    // Guardy: księga zamknięta LUB animacja przewracania = pomijamy
    if (!grimoireOpened || isPageTurning) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const rect = wrapper.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotX = -dy * 4;
      const rotY = dx * 5;
      book.style.transform = `perspective(3000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
  };

  const onLeave = () => {
    cancelAnimationFrame(raf);
    // Smooth reset (transition z CSS się zajmie)
    book.style.transform = 'perspective(3000px) rotateX(0deg) rotateY(0deg)';
  };

  wrapper.addEventListener('mousemove', onMove, { passive: true });
  wrapper.addEventListener('mouseleave', onLeave, { passive: true });

  _tiltState = { wrapper, book, onMove, onLeave, getRaf: () => raf };
}

// Używane przy closeGrimoireBook — czyści listenery i resetuje state
function teardownBookTilt() {
  if (!_tiltState) return;
  const { wrapper, book, onMove, onLeave, getRaf } = _tiltState;
  cancelAnimationFrame(getRaf());
  wrapper.removeEventListener('mousemove', onMove);
  wrapper.removeEventListener('mouseleave', onLeave);
  if (book) book.style.transform = '';
  _tiltState = null;
}

let grimoireOpened = false;
function openGrimoireBook() {
  if (grimoireOpened) return;
  grimoireOpened = true;
  const cover = document.getElementById('book-front-cover');
  cover.classList.add('opening');
  playBookOpenSound();
  // Show close button & chapter tabs after animation
  setTimeout(() => {
    cover.style.display = 'none';
    const closeBtn = document.getElementById('book-close-btn');
    const tabs = document.getElementById('book-chapter-tabs');
    if (closeBtn) closeBtn.classList.add('visible');
    if (tabs) tabs.classList.add('visible');
    updateChapterTabs('toc');
    updatePageNumber('toc');
    // Podłączamy tilt dopiero TERAZ — po animacji otwarcia
    initBookTilt();
  }, 2100);
}

function closeGrimoireBook() {
  if (!grimoireOpened) return;
  grimoireOpened = false;

  // Odepnij tilt (usuwa wyciek + duchowy transform po zamknięciu)
  teardownBookTilt();
  // Anuluj pending animacje przewracania strony (gdyby zamknął w trakcie)
  clearPageTurnTimers();
  isPageTurning = false;
  // Ukryj flip, gdyby był odkryty
  const flipEl = document.getElementById('g-flip-page');
  if (flipEl) { flipEl.classList.remove('turn'); flipEl.style.display = 'none'; }

  const cover = document.getElementById('book-front-cover');
  cover.style.display = '';
  // Reset cover animation
  cover.classList.remove('opening');
  cover.classList.add('closing');
  setTimeout(() => { cover.classList.remove('closing'); }, 100);

  const closeBtn = document.getElementById('book-close-btn');
  const tabs = document.getElementById('book-chapter-tabs');
  if (closeBtn) closeBtn.classList.remove('visible');
  if (tabs) tabs.classList.remove('visible');

  // Reset to gold theme and toc
  const book = document.getElementById('grimoire-book');
  book.className = 'grimoire-book theme-gold';
  book.style.transform = '';
  currentChapter = 'toc';
  // Force-reset ambient diff żeby po ponownym otwarciu partikle się odświeżyły
  _currentAmbientTheme = null;
  updateAmbientParticles('gold');
  // Regenerate sparkles
  const sparkles = document.getElementById('cover-sparkles');
  if (sparkles) sparkles.innerHTML = '';
  generateCoverSparkles();
}

function playBookOpenSound() {
  if (isAudioMuted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 80;
    osc.frequency.exponentialRampToValueAtTime(40, now + 1.8);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.2, now + 0.3);
    g.gain.exponentialRampToValueAtTime(0.001, now + 2);
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass'; flt.frequency.value = 400;
    osc.connect(flt); flt.connect(g); g.connect(ctx.destination);
    osc.start(now); osc.stop(now + 2);
  } catch(e) {}
}

// ============================================================================
// GRA (DOJO MAGINI) - 2 TRYBY + NAGRODY
// ============================================================================
let dojoScore = 0;
let dojoCombo = 0;
let dojoMode = 'words'; // 'words' | 'grammar' | 'forge' | 'echo'
let dojoHardcore = false;
let dojoLives = 3;
let forgeCurrentAnswer = null;
let forgeHintUsed = false;
let echoCurrentItem = null;
let echoReplayCount = 3;
let dojoCurrentWord = null;
let dojoCurrentQ = null;
let dojoCorrectInRow = 0;
let dojoRewardsShown = []; // indeksy już pokazanych nagród
let dojoTotalCorrect = 0;

// ============================================================================
// NAGRODY - ciekawostki o Japonii + rekomendacje anime isekai/fantasy
// ============================================================================

// ============================================================================
// PYTANIA GRAMATYCZNE - tryb grammar
// ============================================================================

function startDojo(mode) {
  dojoMode = mode || 'words';
  document.getElementById('dojo-overlay').style.display = 'none';
  document.getElementById('dojo-reward-overlay').style.display = 'none';
  document.getElementById('gameover-overlay').classList.remove('show');
  dojoScore = 0;
  dojoCombo = 0;
  dojoCorrectInRow = 0;
  dojoTotalCorrect = 0;
  dojoRewardsShown = [];
  dojoLives = 3;
  
  const modeLabels = {
    'words': '📚 Słówka',
    'grammar': '✦ Gramatyka',
    'forge': '🔨 Kuźnia',
    'echo': '👂 Echo Wyroczni'
  };
  document.getElementById('dojo-mode-label').textContent = modeLabels[dojoMode] + (dojoHardcore ? ' 💀' : '');
  
  // Pokaz/ukryj hardcore lives
  const livesBar = document.getElementById('hardcore-lives');
  if(dojoHardcore) {
    livesBar.style.display = 'flex';
    renderLives();
  } else {
    livesBar.style.display = 'none';
  }
  
  // Pokaz/ukryj UI specyficzne dla trybu
  updateDojoModeUI();
  
  updateDojoStats();
  nextDojoQuestion();
}

function updateDojoModeUI() {
  const forgeWrap = document.getElementById('forge-input-wrap');
  const echoWrap = document.getElementById('echo-speaker-wrap');
  const answersBox = document.getElementById('dojo-answers');
  const qBox = document.getElementById('dojo-question-box');
  
  forgeWrap.style.display = dojoMode === 'forge' ? 'flex' : 'none';
  echoWrap.style.display = dojoMode === 'echo' ? 'block' : 'none';
  answersBox.style.display = (dojoMode === 'words' || dojoMode === 'grammar') ? 'grid' : 'none';
  qBox.style.display = (dojoMode === 'echo') ? 'none' : 'block';
}

function endDojo() {
  document.getElementById('dojo-reward-overlay').style.display = 'none';
  document.getElementById('gameover-overlay').classList.remove('show');
  const overlay = document.getElementById('dojo-overlay');
  overlay.style.display = 'flex';
  overlay.querySelector('h2').textContent = 'Koniec Próby';
  overlay.querySelector('p').innerHTML = `Wynik: <b style="color:#f5d97a">${dojoScore}</b> pkt · Poprawnych: <b style="color:#6ee7b7">${dojoTotalCorrect}</b>`;
}

function continueDojo() {
  document.getElementById('dojo-reward-overlay').style.display = 'none';
  nextDojoQuestion();
}

function restartDojo() {
  document.getElementById('gameover-overlay').classList.remove('show');
  startDojo(dojoMode);
}

function updateDojoStats() {
  document.getElementById('dojo-score').textContent = dojoScore;
  document.getElementById('dojo-combo').textContent = 'x' + dojoCombo;
  let manaPercent = Math.min((dojoCombo / 10) * 100, 100);
  document.getElementById('dojo-mana').style.width = manaPercent + '%';
  if(dojoCombo > 0 && dojoCombo % 5 === 0 && window.speechSynthesis && !isAudioMuted) {
    let u = new SpeechSynthesisUtterance("Sugoi!"); u.lang = 'ja-JP'; u.rate = 1.2;
    u.volume = savedVolume; window.speechSynthesis.speak(u);
  }
}

function showReward() {
  let available = DOJO_REWARDS.map((r, i) => i).filter(i => !dojoRewardsShown.includes(i));
  if (available.length === 0) { dojoRewardsShown = []; available = DOJO_REWARDS.map((r, i) => i); }
  const idx = available[Math.floor(Math.random() * available.length)];
  dojoRewardsShown.push(idx);
  const reward = DOJO_REWARDS[idx];
  
  const current = parseInt(localStorage.getItem('arcana_dojo_completions') || '0');
  localStorage.setItem('arcana_dojo_completions', (current + 1).toString());
  
  document.getElementById('reward-title').innerHTML = reward.title;
  let bonusLabel = '';
  if(dojoHardcore) bonusLabel = '<div style="color:var(--crimson-l); font-family:Cinzel,serif; font-size:12px; letter-spacing:2px; margin-bottom:8px;">💀 BONUS HARDCORE · ' + dojoScore + ' pkt</div>';
  document.getElementById('reward-content').innerHTML = bonusLabel + `
    <div class="reward-label">${reward.type === 'anime' ? '🎬 Nagroda: rekomendacja' : '📜 Nagroda: sekretna wiedza'}</div>
    <div class="reward-text">${reward.text}</div>
  `;
  document.getElementById('dojo-reward-overlay').style.display = 'flex';
  dojoCorrectInRow = 0;
}

function nextDojoQuestion() {
  updateDojoModeUI();
  if (dojoMode === 'words') nextWordQuestion();
  else if (dojoMode === 'grammar') nextGrammarQuestion();
  else if (dojoMode === 'forge') nextForgeQuestion();
  else if (dojoMode === 'echo') nextEchoQuestion();
}

function nextWordQuestion() {
  const qBox = document.getElementById('dojo-pl');
  const answersBox = document.getElementById('dojo-answers');
  const hint = document.getElementById('dojo-hint');
  answersBox.innerHTML = '';
  qBox.style.color = '#fff';
  hint.textContent = 'Wybierz poprawne tłumaczenie (romaji):';
  
  dojoCurrentWord = GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
  qBox.innerHTML = `${dojoCurrentWord.e} ${dojoCurrentWord.pl}`;
  
  let wrongAnswers = [];
  while(wrongAnswers.length < 3) {
    let w = GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
    if(w.r !== dojoCurrentWord.r && !wrongAnswers.includes(w)) wrongAnswers.push(w);
  }
  let allOptions = [dojoCurrentWord, ...wrongAnswers];
  allOptions.sort(() => Math.random() - 0.5);
  
  allOptions.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'dojo-btn';
    btn.textContent = opt.r;
    btn.onclick = () => checkWordAnswer(opt, btn);
    answersBox.appendChild(btn);
  });
}

function nextGrammarQuestion() {
  const qBox = document.getElementById('dojo-pl');
  const answersBox = document.getElementById('dojo-answers');
  const hint = document.getElementById('dojo-hint');
  answersBox.innerHTML = '';
  qBox.style.color = '#fff';
  qBox.style.fontSize = '24px';
  hint.textContent = 'Wybierz poprawną odpowiedź:';
  
  dojoCurrentQ = GRAMMAR_QUESTIONS[Math.floor(Math.random() * GRAMMAR_QUESTIONS.length)];
  qBox.innerHTML = dojoCurrentQ.q;
  
  dojoCurrentQ.opts.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'dojo-btn';
    btn.style.fontSize = '17px';
    btn.style.padding = '20px';
    btn.textContent = opt;
    btn.onclick = () => checkGrammarAnswer(idx, btn);
    answersBox.appendChild(btn);
  });
}

function checkWordAnswer(selectedWord, btn) {
  const allBtns = document.querySelectorAll('.dojo-btn');
  allBtns.forEach(b => b.style.pointerEvents = 'none');
  
  if(selectedWord.r === dojoCurrentWord.r) {
    btn.classList.add('correct');
    dojoScore += 10 + (dojoCombo * 2);
    dojoCombo++;
    dojoCorrectInRow++;
    dojoTotalCorrect++;
    speakText(selectedWord.r);
    updateDojoStats();
    setTimeout(() => {
      if (dojoCorrectInRow >= 5) showReward();
      else nextDojoQuestion();
    }, 1000);
  } else {
    btn.classList.add('wrong');
    dojoCombo = 0;
    dojoCorrectInRow = 0;
    document.getElementById('dojo-pl').style.color = '#f87171';
    allBtns.forEach(b => { if(b.textContent === dojoCurrentWord.r) b.classList.add('correct'); });
    updateDojoStats();
    if(dojoHardcore && loseLife()) return;
    setTimeout(() => nextDojoQuestion(), 2000);
  }
}

function checkGrammarAnswer(selectedIdx, btn) {
  const allBtns = document.querySelectorAll('.dojo-btn');
  allBtns.forEach(b => b.style.pointerEvents = 'none');
  
  const hint = document.getElementById('dojo-hint');
  
  if(selectedIdx === dojoCurrentQ.correct) {
    btn.classList.add('correct');
    dojoScore += 15 + (dojoCombo * 3);
    dojoCombo++;
    dojoCorrectInRow++;
    dojoTotalCorrect++;
    hint.innerHTML = `<b style="color:#6ee7b7">✓ Poprawnie!</b> ${dojoCurrentQ.expl}`;
    updateDojoStats();
    setTimeout(() => {
      if (dojoCorrectInRow >= 5) showReward();
      else nextDojoQuestion();
    }, 2000);
  } else {
    btn.classList.add('wrong');
    dojoCombo = 0;
    dojoCorrectInRow = 0;
    allBtns.forEach((b, i) => { if(i === dojoCurrentQ.correct) b.classList.add('correct'); });
    hint.innerHTML = `<b style="color:#f87171">✗ Niestety...</b> ${dojoCurrentQ.expl}`;
    updateDojoStats();
    if(dojoHardcore && loseLife()) return;
    setTimeout(() => nextDojoQuestion(), 3000);
  }
}

// ============================================================================
// 💀 HARDCORE MODE
// ============================================================================
function toggleHardcore() {
  dojoHardcore = !dojoHardcore;
  const toggle = document.getElementById('hardcore-toggle');
  const check = document.getElementById('hardcore-check');
  toggle.classList.toggle('active', dojoHardcore);
  check.textContent = dojoHardcore ? '✓' : '';
}

function renderLives() {
  const bar = document.getElementById('hardcore-lives');
  if(!bar) return;
  const hearts = bar.querySelectorAll('.hardcore-life');
  hearts.forEach((h, i) => {
    const lifeNum = i + 1;
    if(lifeNum > dojoLives) {
      h.classList.add('lost');
      h.textContent = '🖤';
    } else {
      h.classList.remove('lost');
      h.textContent = '❤️';
    }
  });
}

function loseLife() {
  dojoLives--;
  renderLives();
  // Play hit sound
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.4);
    g.gain.setValueAtTime(0.2, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.4);
  } catch(e) {}
  
  if(dojoLives <= 0) {
    setTimeout(triggerGameOver, 1200);
    return true; // block normal flow
  }
  return false;
}

function triggerGameOver() {
  const penaltyPoints = Math.floor(dojoScore / 2);
  const finalScore = dojoScore - penaltyPoints;
  dojoScore = finalScore;
  
  const statsEl = document.getElementById('gameover-stats');
  statsEl.innerHTML = `
    Poprawnych odpowiedzi: <b>${dojoTotalCorrect}</b><br>
    Wynik przed śmiercią: <b>${finalScore + penaltyPoints}</b> pkt<br>
    <span class="gameover-penalty">💀 Kara śmierci: <b style="color:var(--crimson-l)">−${penaltyPoints}</b> pkt</span><br><br>
    Ocalony wynik: <b style="color:#f5d97a; font-size:22px">${finalScore}</b> pkt
  `;
  
  document.getElementById('gameover-overlay').classList.add('show');
  
  // Deep gameover sound
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [110, 82, 55].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, now + i * 0.3);
      g.gain.linearRampToValueAtTime(0.15, now + i * 0.3 + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.3 + 1.5);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(now + i * 0.3); osc.stop(now + i * 0.3 + 1.5);
    });
  } catch(e) {}
}

// ============================================================================
// 🔨 KUŹNIA ZAKLĘĆ — text input, production recall
// ============================================================================

function normalizeForge(s) {
  return s.toLowerCase()
    .replace(/[。、.,!?！？\-—–]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/を/g, 'wo')
    .trim();
}

function nextForgeQuestion() {
  const qBox = document.getElementById('dojo-pl');
  const hint = document.getElementById('dojo-hint');
  const input = document.getElementById('forge-input');
  const hintReveal = document.getElementById('forge-hint-reveal');
  
  // Mix - czasem słówko z D, czasem pytanie z FORGE_QUESTIONS
  const useWord = Math.random() < 0.4 && GAME_WORDS.length > 0;
  
  if(useWord) {
    const word = GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
    forgeCurrentAnswer = { 
      answers: [word.r.toLowerCase()], 
      hint: `${word.e || '✦'} ${word.en ? '"' + word.en + '"' : ''}` 
    };
    qBox.innerHTML = `Jak powiesz <b style="color:#f5d97a">"${word.pl}"</b> po japońsku?`;
    hint.textContent = '(wpisz romaji)';
  } else {
    const q = FORGE_QUESTIONS[Math.floor(Math.random() * FORGE_QUESTIONS.length)];
    forgeCurrentAnswer = { answers: q.a, hint: q.hint };
    qBox.innerHTML = q.q;
    hint.textContent = '(wpisz odpowiedź po romaji lub kana)';
  }
  
  forgeHintUsed = false;
  input.value = '';
  input.classList.remove('correct', 'wrong');
  input.disabled = false;
  hintReveal.classList.remove('show');
  hintReveal.textContent = '';
  setTimeout(() => input.focus(), 100);
}

function forgeShowHint() {
  if(!forgeCurrentAnswer || forgeHintUsed) return;
  forgeHintUsed = true;
  const reveal = document.getElementById('forge-hint-reveal');
  reveal.textContent = '💡 ' + forgeCurrentAnswer.hint;
  reveal.classList.add('show');
  dojoScore = Math.max(0, dojoScore - 5);
  updateDojoStats();
}

function forgeSubmit() {
  if(!forgeCurrentAnswer) return;
  const input = document.getElementById('forge-input');
  const hint = document.getElementById('dojo-hint');
  const userAnswer = normalizeForge(input.value);
  if(!userAnswer) return;
  
  input.disabled = true;
  
  // Check against all possible answers with tolerance
  let bestSim = 0;
  let matched = false;
  forgeCurrentAnswer.answers.forEach(correctAnswer => {
    const normalized = normalizeForge(correctAnswer);
    if(userAnswer === normalized) { matched = true; bestSim = 1; return; }
    const sim = similarityScore(userAnswer, normalized);
    if(sim > bestSim) bestSim = sim;
  });
  
  // 90%+ similarity = accept (1-2 char typo tolerance)
  const close = bestSim >= 0.9;
  
  if(matched || close) {
    input.classList.add('correct');
    dojoScore += forgeHintUsed ? 10 : (20 + dojoCombo * 3);
    dojoCombo++;
    dojoCorrectInRow++;
    dojoTotalCorrect++;
    const tip = close && !matched ? ` <span style="color:#fbbf24;">(zaakceptowano z literówką)</span>` : '';
    hint.innerHTML = `<b style="color:#6ee7b7">✓ Zaklęcie wykute!</b> Poprawna odpowiedź: <b>${forgeCurrentAnswer.answers[0]}</b>${tip}`;
    speakText(forgeCurrentAnswer.answers[0]);
    updateDojoStats();
    setTimeout(() => {
      if(dojoCorrectInRow >= 5) showReward();
      else nextDojoQuestion();
    }, 1800);
  } else {
    input.classList.add('wrong');
    dojoCombo = 0;
    dojoCorrectInRow = 0;
    hint.innerHTML = `<b style="color:#f87171">✗ Zaklęcie załamało się.</b> Poprawnie: <b style="color:#f5d97a">${forgeCurrentAnswer.answers[0]}</b>`;
    updateDojoStats();
    if(dojoHardcore && loseLife()) return;
    setTimeout(() => nextDojoQuestion(), 2800);
  }
}

// ============================================================================
// 👂 ECHO ORACLE — dictation
// ============================================================================

function nextEchoQuestion() {
  echoCurrentItem = ECHO_ITEMS[Math.floor(Math.random() * ECHO_ITEMS.length)];
  echoReplayCount = 3;
  
  const hint = document.getElementById('dojo-hint');
  const btn = document.getElementById('echo-btn-play');
  const counter = document.getElementById('echo-replay-count');
  
  // Pokazuje wrap i input Kuźni razem — Echo używa input Kuźni do wpisywania
  document.getElementById('forge-input-wrap').style.display = 'flex';
  document.getElementById('forge-input-label').textContent = '👂 Zapisz co usłyszałeś (romaji)';
  
  const input = document.getElementById('forge-input');
  const hintReveal = document.getElementById('forge-hint-reveal');
  input.value = '';
  input.classList.remove('correct','wrong');
  input.disabled = false;
  hintReveal.classList.remove('show');
  hint.textContent = 'Kliknij "Usłysz Wyrocznię" i wsłuchaj się uważnie';
  btn.textContent = '🔊 Usłysz Wyrocznię';
  btn.classList.remove('played');
  counter.textContent = `Pozostałe odsłuchy: ${echoReplayCount}`;
  
  // Set forge answer for submit to work with echo item
  forgeCurrentAnswer = { 
    answers: [echoCurrentItem.jp], 
    hint: echoCurrentItem.pl + ' · ' + echoCurrentItem.lvl 
  };
  forgeHintUsed = false;
}

function echoPlaySample() {
  if(!echoCurrentItem) return;
  if(echoReplayCount <= 0) {
    alert('🔇 Brakuje ci odsłuchów. Odpowiedz na zadanie lub przejdź do następnego.');
    return;
  }
  
  echoReplayCount--;
  document.getElementById('echo-replay-count').textContent = `Pozostałe odsłuchy: ${echoReplayCount}`;
  document.getElementById('echo-btn-play').classList.add('played');
  
  const icon = document.getElementById('echo-icon');
  icon.classList.add('speaking');
  
  speakText(echoCurrentItem.jp);
  
  // Stop speaking animation after TTS estimated duration
  const estMs = Math.max(1500, echoCurrentItem.jp.length * 120);
  setTimeout(() => icon.classList.remove('speaking'), estMs);
  
  // Focus input for typing
  setTimeout(() => document.getElementById('forge-input').focus(), 100);
}

// Reuse forgeSubmit for echo - it already handles answers[] matching

// ============================================================================
function addToSlot(word){ slots.push({...word, id: Date.now()}); renderSlots(); }
function removeSlot(id){ slots = slots.filter(s => s.id !== id); renderSlots(); }
function clearSlots(){ slots = []; document.getElementById('correction-area').innerHTML = ''; renderSlots(); }
function renderSlots(){
  const row = document.getElementById('slot-row'); const rb = document.getElementById('result-box'); row.innerHTML = '';
  if(!slots.length){ row.innerHTML = '<span class="slot-ph">Szukaj słów i klikaj je, by budować zaklęcie...</span>'; rb.style.display = 'none'; return; }
  slots.forEach(s => {
    const sl = document.createElement('div'); sl.className = 'slot';
    sl.innerHTML = `${s.e||''} <b>${s.r}</b> <span style="font-size:11px;color:#666">(${s.pl})</span> <span class="rm" onclick="removeSlot(${s.id})">✕</span>`;
    row.appendChild(sl);
  });
  document.getElementById('result-jp').textContent = slots.map(s => s.r).join(' ') + (slots.some(s => s.part === 'verb') ? '.' : '');
  document.getElementById('result-pl').textContent = slots.map(s => s.pl).join(' ') + (slots.some(s => s.part === 'verb') ? '.' : '');
  rb.style.display = 'block';
}

function filterWordBank() {
  const q = document.getElementById('builder-search').value.toLowerCase();
  document.querySelectorAll('.word-chip').forEach(chip => { chip.style.display = chip.textContent.toLowerCase().includes(q) ? 'inline-block' : 'none'; });
}

function renderWordBank(){
  const content = document.getElementById('word-bank-content'); content.innerHTML = '';
  const groups = [ {label:'Zaimki & Partykuły', items: EXTRAS}, {label:'Rzeczowniki', items: ALL_WORDS.filter(d => d.part === 'noun')}, {label:'Czasowniki', items: ALL_WORDS.filter(d => d.part === 'verb')} ];
  groups.forEach(g => {
    const lbl = document.createElement('div'); lbl.className = 'cat-label'; lbl.textContent = g.label;
    const bank = document.createElement('div'); bank.className = 'word-bank';
    g.items.forEach(w => {
      const chip = document.createElement('div'); chip.className = 'word-chip'; chip.textContent = `${w.e||''} ${w.r} (${w.pl})`;
      chip.onclick = () => addToSlot({r: w.r, pl: w.pl, e: w.e || '', cat: w.cat, part: w.part || 'noun'});
      bank.appendChild(chip);
    });
    content.appendChild(lbl); content.appendChild(bank);
  });
}

function sortAndFixSlots(inputSlots) {
  let newSlots = [];
  let subjects = inputSlots.filter(s => s.part === 'subject' || (s.part === 'noun' && ['watashi','anata','kare','kanojo'].includes(s.r)));
  let verbs = inputSlots.filter(s => s.part === 'verb');
  let nouns = inputSlots.filter(s => s.part === 'noun' && !subjects.includes(s));
  let adverbs = inputSlots.filter(s => s.part === 'adverb');
  let particles = inputSlots.filter(s => s.part === 'particle');

  newSlots.push(...adverbs);
  if(subjects.length > 0) {
    newSlots.push(subjects[0]);
    let waGa = particles.find(p => p.r === 'wa' || p.r === 'ga');
    if(waGa) { newSlots.push(waGa); particles = particles.filter(p => p !== waGa); } 
    else { newSlots.push({r:'wa', pl:'[temat]', e:'📌', part:'particle', id:Date.now()}); }
  }
  nouns.forEach((n, idx) => {
    newSlots.push(n);
    if(['uchi', 'gakkou', 'isekai'].includes(n.r)) {
      let niDe = particles.find(p => p.r === 'ni' || p.r === 'de');
      if(niDe) { newSlots.push(niDe); particles = particles.filter(p => p !== niDe); }
      else { newSlots.push({r:'ni', pl:'[do/w]', e:'📍', part:'particle', id:Date.now()+idx}); }
    } else {
      let wo = particles.find(p => p.r === 'wo');
      if(wo) { newSlots.push(wo); particles = particles.filter(p => p !== wo); }
      else { newSlots.push({r:'wo', pl:'[obiekt]', e:'🎯', part:'particle', id:Date.now()+idx}); }
    }
  });
  newSlots.push(...particles); newSlots.push(...verbs);
  return newSlots;
}

function autoOrderSentence(){
  if(!slots.length) return;
  slots = sortAndFixSlots(slots); renderSlots();
  document.getElementById('correction-area').innerHTML = `<div class="correction-box"><div class="ttl">✨ Ułożono w szyku SOV</div>Podmiot → Dopełnienie → Czasownik.</div>`;
}

function checkSyntaxLocal(){
  if(!slots.length) return;
  document.getElementById('correction-area').innerHTML = `<div class="correction-box"><div class="ttl">🔮 Mistrzyni kiwa głową!</div>Ostateczną moc zdaniu nadaje poprawny czasownik na końcu.</div>`;
}

// ============================================================================
// CHAT — MISTRZYNI AKEMI (drzewko decyzyjne + duży słownik tłumaczeń)
// ============================================================================

// Duży słownik tłumaczeń pl → romaji (odmiany, synonimy)

function matchPolishWord(w) {
  w = w.toLowerCase().trim().replace(/[.,?!:;]/g, '');
  if(!w || w.length < 2) return null;
  // najpierw słownik tłumaczeń
  const romaji = PL_TO_ROMAJI[w];
  if (romaji) {
    const found = ALL_WORDS.find(d => d.r === romaji);
    if (found) return found;
    // jeśli nie w ALL_WORDS, twórz prowizoryczny obiekt
    return { r: romaji, pl: w, e: '', part: guessPart(romaji) };
  }
  // fallback: szukaj w ALL_WORDS po pl
  return ALL_WORDS.find(d => d.pl.toLowerCase() === w || d.pl.toLowerCase().includes(w));
}

function guessPart(romaji) {
  const verbs = ['taberu','nomu','iku','kuru','kaeru','kau','wakaru','shiru','hanasu','kiku','miru','yomu','kaku','hataraku','sumu','neru','okiru','suru','hashiru','aruku','ageru','morau','sagasu','hajimeru','benkyou suru','warau','naku','utau','odoru','asobu','suki da','hoshii'];
  if (verbs.includes(romaji)) return 'verb';
  const particles = ['wa','wo','ni','de','ga','no','to','mo'];
  if (particles.includes(romaji)) return 'particle';
  const subjects = ['watashi','anata','kare','kanojo','watashitachi','anatatachi','karera'];
  if (subjects.includes(romaji)) return 'subject';
  const adverbs = ['ima','ashita','kinou','kyou','mainichi','hayaku','yukkuri','totemo','sukoshi'];
  if (adverbs.includes(romaji)) return 'adverb';
  return 'noun';
}

// LEGENDY I WIEDZA - drzewko tematyczne

let currentQuizAnswer = null;
// === KONFIGURACJA RAG ===
// Adres serwera Python (rag_server.py). Zmień jeśli odpalasz na innym porcie.
// Jeśli serwer RAG nie działa, używamy lokalnego silnika Akemi jako fallback.

async function sendMsg(){
  const input = document.getElementById('chat-input');
  const rawMsg = input.value.trim();
  if(!rawMsg) return;
  const msg = rawMsg.toLowerCase();
  input.value = ''; input.style.height = 'auto';
  addMsg(rawMsg, 'user');
  const btn = document.getElementById('chat-send');
  btn.disabled = true;
  const typingEl = addTyping();

  // 1. Quiz w toku - obsługiwany LOKALNIE (niezależnie od serwera)
  if(currentQuizAnswer) {
    setTimeout(() => {
      const reply = processAkemiMessage(msg);
      typingEl.remove();
      addMsg(reply, 'bot');
      btn.disabled = false;
    }, 400);
    return;
  }

  // 🔮 OKO WYROCZNI - jeśli włączone, używamy Gemini zamiast RAG/lokalnej magii
  if(oracleMode && oracleApiKey) {
    try {
      const reply = await queryOracle(rawMsg);
      typingEl.remove();
      addMsg(reply, 'bot');
      btn.disabled = false;
      return;
    } catch(e) {
      typingEl.remove();
      addMsg(`⚠️ <b>Oko Wyroczni przymknęło się...</b><br><i>${e.message}</i><br><br>Wracam do lokalnej magii.`, 'bot');
      setTimeout(() => {
        const typingEl2 = addTyping();
        setTimeout(() => {
          const reply = processAkemiMessage(msg);
          typingEl2.remove();
          addMsg(reply, 'bot');
          btn.disabled = false;
        }, 500);
      }, 300);
      return;
    }
  }

  // 2. Próba połączenia z serwerem RAG (Mistrzyni wertuje zwoje wektorowe)
  try {
    const res = await fetch(RAG_SERVER_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message: rawMsg})
    });

    if(!res.ok) throw new Error('Serwer RAG odpowiedział błędem: ' + res.status);

    const data = await res.json();
    const reply = (data.reply || '').replace(/\n/g, '<br>');
    typingEl.remove();
    addMsg(reply || '*Mistrzyni milczy...*', 'bot');
    btn.disabled = false;
  } catch(e) {
    // 3. Fallback: serwer RAG nieaktywny - używamy lokalnej magii
    typingEl.remove();
    if (USE_LOCAL_FALLBACK) {
      addMsg('⚠️ <i>Serwer RAG nie odpowiada - używam lokalnej pamięci Akemi.</i>', 'bot');
      setTimeout(() => {
        const typingEl2 = addTyping();
        setTimeout(() => {
          const reply = processAkemiMessage(msg);
          typingEl2.remove();
          addMsg(reply, 'bot');
          btn.disabled = false;
        }, 500);
      }, 300);
    } else {
      addMsg('⚠️ <b>Baka!</b> Mój mózg w Pythonie nie odpowiada. Upewnij się, że odpaliłeś <b>rag_server.py</b> w czarnym oknie!', 'bot');
      btn.disabled = false;
    }
  }
}

function processAkemiMessage(msg) {
  // 1. Quiz w toku - najpierw sprawdzamy aktywny quiz
  if(currentQuizAnswer) {
    const ans = currentQuizAnswer.toLowerCase();
    const found = msg.includes(ans);
    currentQuizAnswer = null;
    if (found) return "✨ *Księga błyszczy złotym światłem* Wspaniale! To całkowicie poprawna odpowiedź, adepcie.";
    return `💀 Niestety, zaklęcie prysło... Poprawna odpowiedź to: <b>${ans}</b>. Spróbuj ponownie — <i>zażądaj quizu</i>.`;
  }
  
  // 2. POWITANIA
  if (/^(cześć|hej|witaj|hi|hello|siema|dzień dobry|dobry)/i.test(msg)) {
    return "*Uśmiecha się z lekkim rumieńcem, zamykając świetlistą księgę* <br><br>Witaj ponownie, adepcie. Cieszę się, że przybyłeś do mojej biblioteki. W czym mogę ci dziś pomóc? <br><br>Możesz zapytać o: <b>tłumaczenie zdań</b>, <b>gramatykę</b> (wa/ga, przymiotniki, czasy), <b>legendy</b> (kitsune, tengu, oni, samuraj, kami, yokai), lub zażądać <b>quizu</b>.";
  }
  
  if (/kim jesteś|kim jestes|kto ty|who are you/i.test(msg)) {
    return "*Poprawia fioletowy kaptur* <br><br>Jestem <b>Mistrzyni Akemi</b> (明美先生) — Strażniczka Zakazanych Zwojów i Wielka Magini tej biblioteki. Uczę sztuki Nihongo od wieków. Nie rzucam słów na wiatr — odpowiadam tylko na to, co wiem na pewno.";
  }
  
  // 3. TŁUMACZENIE
  if (/^(przetłum|przetlum|tłumacz|tlumacz|translate)/i.test(msg) || msg.startsWith('przetł') || msg.includes('po japońsku') || msg.includes('jak powiedzieć')) {
    let sentence = msg
      .replace(/przetłumacz( mi)?( proszę)?( zdanie)?[:]?\s*/gi, '')
      .replace(/przetlumacz( mi)?( zdanie)?[:]?\s*/gi, '')
      .replace(/tłumacz( mi)?( zdanie)?[:]?\s*/gi, '')
      .replace(/tlumacz[:]?\s*/gi, '')
      .replace(/jak (będzie |bedzie |powiedzieć |powiedziec )?po japońsku[:]?\s*/gi, '')
      .replace(/[.,?!:;]/g, '')
      .trim();
    
    if (!sentence) return "Co chcesz przetłumaczyć, adepcie? Napisz np. <i>przetłumacz: ja jem jabłko</i>.";
    
    const words = sentence.split(/\s+/);
    const translatedSlots = [];
    const missingWords = [];
    
    for (const w of words) {
      if (w.length < 1) continue;
      const found = matchPolishWord(w);
      if (found) translatedSlots.push(found);
      else if (w.length >= 2) missingWords.push(w);
    }
    
    if (translatedSlots.length === 0) {
      return `Hmm... nie rozpoznałam żadnego znanego mi słowa. Sprawdź <b>Leksykon</b>, żeby zobaczyć dostępne słówka, lub spróbuj prostszego zdania jak <i>ja jem jabłko</i>.`;
    }
    
    const fixed = sortAndFixSlots(translatedSlots);
    const jp = fixed.map(s => s.r).join(' ') + (fixed.some(s => s.part === 'verb') ? '.' : '');
    const plOrig = translatedSlots.map(s => s.pl).join(', ');
    const safeJp = jp.replace(/'/g, "\\'");
    
    let out = `*Otwiera księgę tłumaczeń i wskazuje palcem na runy* <br><br>Oto twoje zaklęcie w romaji:<br><br><div style="font-size:22px; color:#22d3ee; font-weight:bold; margin:14px 0; font-family: 'Noto Serif JP', serif;">${jp}</div><div style="color:#a78bfa; font-style:italic; margin-bottom: 10px; font-size:13px;">Rozpoznane: ${plOrig}</div><button class="btn arcane" onclick="speakText('${safeJp}')">🔊 Wymów zaklęcie</button>`;
    
    if (missingWords.length > 0) {
      const filtered = missingWords.filter(w => !['się','że','aby','albo','lub','oraz','też','już'].includes(w));
      if (filtered.length > 0) {
        out += `<br><br><i style="font-size:12px; color:#c084fc;">⚠ Nie znalazłam tłumaczenia dla: <b>${filtered.join(', ')}</b> — te słowa pominęłam. Rozszerzam stale swoje zwoje.</i>`;
      }
    }
    return out;
  }
  
  // 4. GRAMATYKA - drzewko tematyczne
  if (msg.includes('wa') && msg.includes('ga') && (msg.includes('różnic') || msg.includes('roznic') || msg.includes('między'))) {
    return "<b>✦ Różnica między WA (は) i GA (が) ✦</b><br><br><b>は (wa)</b> — partykuła <i>tematu</i>. Znaczenie: <i>\"jeśli chodzi o X...\"</i>. Wskazuje co jest tematem rozmowy.<br>→ <i>Watashi <b>wa</b> gakusei desu.</i> = Jestem studentem (jeśli chodzi o mnie — student).<br><br><b>が (ga)</b> — partykuła <i>podmiotu</i>. Podkreśla <i>KTO</i> wykonuje akcję.<br>→ <i>Watashi <b>ga</b> gakusei desu.</i> = To JA jestem studentem (nie ktoś inny).<br><br><b>🔑 Zasada:</b> używaj <b>wa</b> gdy X jest już znany, <b>ga</b> gdy wprowadzasz coś nowego lub wyróżniasz.";
  }
  
  if (msg.includes('przymiotnik')) {
    return "<b>✦ Dwa typy japońskich przymiotników ✦</b><br><br><b>1️⃣ i-przymiotniki</b> (kończą się na -い/-i):<br>→ <i>atarashii</i> (nowy), <i>takai</i> (wysoki), <i>kawaii</i> (słodki).<br>Odmieniają się same:<br>• czas teraźniejszy: atarashi<b>i</b> desu<br>• czas przeszły: atarashi<b>katta</b> desu<br>• przeczenie: atarashi<b>kunai</b> desu<br><br><b>2️⃣ na-przymiotniki</b> (potrzebują NA przed rzeczownikiem):<br>→ <i>kirei</i> (piękny), <i>shizuka</i> (cichy), <i>suki</i> (lubiany).<br>• kirei <b>na</b> hana = piękny kwiat<br>• kirei desu = jest piękny (bez NA przed desu!)";
  }
  
  if (msg.includes('partykuł') || (msg.includes('co to') && (msg.includes('ni') || msg.includes('de') || msg.includes('wo')))) {
    return "<b>✦ Partykuły - kluczowe runy ✦</b><br><br>• <b>は (wa)</b> — temat zdania<br>• <b>が (ga)</b> — podmiot (kto)<br>• <b>を (wo)</b> — dopełnienie (co)<br>• <b>に (ni)</b> — cel ruchu, czas, istnienie<br>• <b>で (de)</b> — miejsce akcji, narzędzie<br>• <b>の (no)</b> — przynależność (mój = watashi no)<br>• <b>と (to)</b> — „z kimś/czymś”<br>• <b>も (mo)</b> — „też/także”<br>• <b>か (ka)</b> — pytanie na końcu zdania<br><br>Zapytaj <i>„różnica wa i ga”</i> aby zgłębić temat.";
  }
  
  if (msg.includes('-masu') || msg.includes('masu') || msg.includes('czas') || msg.includes('odmian')) {
    return "<b>✦ Odmiana grzeczna (-masu) ✦</b><br><br>Forma <b>-masu</b> jest używana w grzecznej japońszczyźnie:<br><br>• <b>Teraźniejszy/przyszły</b>: tabe<b>masu</b> (jem / będę jeść)<br>• <b>Przeczenie</b>: tabe<b>masen</b> (nie jem)<br>• <b>Przeszły</b>: tabe<b>mashita</b> (zjadłem)<br>• <b>Przeszły przeczony</b>: tabe<b>masen deshita</b> (nie zjadłem)<br><br><b>🔑 Kontekst</b> mówi, czy chodzi o teraźniejszość czy przyszłość — japoński ich nie rozróżnia w tej formie.<br><br>Przykłady z jedzeniem: <i>taberu → tabemasu</i>, z piciem: <i>nomu → nomimasu</i>, z czytaniem: <i>yomu → yomimasu</i>.";
  }
  
  if (msg.includes('te ') || msg.includes('-te') || msg.includes('prośb') || msg.includes('proszę zjedz')) {
    return "<b>✦ Forma -te (łączenie akcji i prośby) ✦</b><br><br>Forma <b>-te</b> to jedno z najważniejszych zaklęć — łączy akcje i tworzy prośby.<br><br>• <b>Prośba</b>: Tabe<b>te kudasai</b> = Proszę zjedz.<br>• <b>Ciągłość</b>: Tabe<b>te imasu</b> = Jem właśnie / jem w tej chwili.<br>• <b>Łączenie</b>: Ringo wo tabe<b>te</b>, mizu wo nomimasu = Zjadam jabłko i piję wodę.<br>• <b>Prośba o pozwolenie</b>: Tabe<b>te mo ii desu ka</b>? = Czy mogę jeść?<br><br>Reguły tworzenia formy -te są skomplikowane — zależą od grupy czasownika.";
  }
  
  if (msg.includes('szyk') || msg.includes('sov') || msg.includes('kolejność')) {
    return "<b>✦ Szyk zdania: SOV ✦</b><br><br>Japoński to język <b>SOV</b> — <i>Subject-Object-Verb</i>:<br><br><b>Podmiot + wa/ga → Dopełnienie + wo → Czasownik.</b><br><br>Przykład:<br>→ <i>Watashi <b>wa</b> ringo <b>wo</b> tabemasu.</i><br>(Ja) (temat) (jabłko) (dopełnienie) (jem)<br>= Jem jabłko.<br><br><b>🔑 Czasownik zawsze na końcu!</b> To radykalnie inna logika niż w polskim czy angielskim. Ale dzięki partykułom szyk elementów przed czasownikiem jest dosyć elastyczny.";
  }
  
  // 5. LEGENDY
  for (const key of Object.keys(AKEMI_LEGENDS)) {
    if (msg.includes(key)) {
      return `*Sięga po stary zwój oznaczony runą* <br><br>${AKEMI_LEGENDS[key]}`;
    }
  }
  if (msg.includes('legend') || msg.includes('mitolog') || msg.includes('opowieść') || msg.includes('opowiedz')) {
    const keys = Object.keys(AKEMI_LEGENDS);
    const listHtml = keys.map(k => `• <b>${k}</b>`).join('<br>');
    return `O czym chciałbyś usłyszeć legendę? Znam opowieści o:<br><br>${listHtml}<br><br>Napisz np. <i>"opowiedz mi o tengu"</i>.`;
  }
  
  // 6. QUIZ
  if (msg.includes('quiz') || msg.includes('trudn') || msg.includes('test') || msg.includes('pojedynek')) {
    const quizzes = [
      { q: "Jak powiesz 'Piję wodę'?", a: "mizu wo nomimasu" },
      { q: "Jak powiesz 'Wrócę do domu'?", a: "uchi ni kaerimasu" },
      { q: "Jak powiesz 'Czytam książkę'?", a: "hon wo yomimasu" },
      { q: "Która partykuła oznacza temat zdania? (jednym słowem)", a: "wa" },
      { q: "Która partykuła oznacza dopełnienie? (jednym słowem)", a: "wo" },
      { q: "Co znaczy 'kitsune'? (po polsku)", a: "lis" },
      { q: "Co znaczy 'yuusha'? (po polsku)", a: "bohater" },
      { q: "Jak powiesz 'jem jabłko'?", a: "ringo wo tabemasu" },
      { q: "Jak zaprzeczyć 'ikimasu' (idę)?", a: "ikimasen" },
      { q: "Jak powiedzieć 'chcę iść'?", a: "ikitai desu" }
    ];
    const randomQ = quizzes[Math.floor(Math.random() * quizzes.length)];
    currentQuizAnswer = randomQ.a;
    return `🎯 <b>Wyzywam cię na pojedynek umysłów!</b><br><br>${randomQ.q}<br><br><i style="font-size:12px;color:#a78bfa;">(Wpisz odpowiedź w następnej wiadomości)</i>`;
  }
  
  // 7. DZIĘKOWANIE
  if (/dzięki|dziękuję|dziekuje|thanks|thx/i.test(msg)) {
    return "*Kłania się lekko* <br><br>Nie ma za co, adepcie. Twoja chęć nauki ogrzewa to stare serce biblioteki. Wracaj kiedy chcesz — moja księga zawsze jest otwarta.";
  }
  
  // 8. POŻEGNANIE
  if (/bye|żegnaj|zegnaj|do widzenia|pa|koniec|muszę/i.test(msg)) {
    return "*Unosi dłoń w geście błogosławieństwa* <br><br>Idź w pokoju, adepcie. Niech światło arkanów prowadzi cię na drogach Nihongo. <b>Mata ne!</b> (Do zobaczenia!)";
  }
  
  // 9. DEFAULT - sugestie
  return "*Marszczy brwi z namysłem* <br><br>Zgodnie z moją przysięgą — <b>nie halucynuję</b>. Odpowiadam tylko na to, co wiem na pewno. Spróbuj:<br><br>✦ <i>Przetłumacz: ja czytam książkę</i><br>✦ <i>Jaka jest różnica między wa i ga?</i><br>✦ <i>Czym są przymiotniki?</i><br>✦ <i>Opowiedz mi o kitsune</i> (lub tengu, oni, samuraj, kami, yokai, ronin)<br>✦ <i>Wyjaśnij formę -masu</i><br>✦ <i>Co to jest forma -te?</i><br>✦ Zażądaj <b>quizu</b>!";
}

function addMsg(text, role){
  const msgs = document.getElementById('chat-msgs'); const div = document.createElement('div'); div.className = `msg ${role}`;
  const formatted = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>');
  const avatar = role === 'bot' ? '<img src="https://image.pollinations.ai/prompt/Dark%20fantasy%20anime%20female%20wizard%20shadows%20purple%20magic%20intricate%20details%20masterpiece%20dark%20aesthetic%20witch%20hat?width=100&height=100&nologo=true">' : '👤';
  div.innerHTML = role === 'bot' ? `<div class="msg-avatar">${avatar}</div><div><div class="msg-bubble">${formatted}</div></div>` : `<div><div class="msg-bubble">${formatted}</div></div><div class="msg-avatar" style="font-size:20px">${avatar}</div>`;
  msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight; return div;
}

function addTyping(){
  const msgs = document.getElementById('chat-msgs'); const div = document.createElement('div'); div.className = 'msg bot';
  div.innerHTML = `<div class="msg-avatar"><img src="https://image.pollinations.ai/prompt/Dark%20fantasy%20anime%20female%20wizard%20shadows%20purple%20magic%20intricate%20details%20masterpiece%20dark%20aesthetic%20witch%20hat?width=100&height=100&nologo=true"></div><div><div class="msg-bubble">Przeglądam zwoje...</div></div>`;
  msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight; return div;
}

function quickMsg(t){ document.getElementById('chat-input').value = t; sendMsg(); }

// ============================================================================
// ULUBIONE
// ============================================================================
function showFavTab(tab){ renderFavs(); }
function renderFavs(){
  const content = document.getElementById('fav-content');
  document.getElementById('ct-slowa').textContent = favs.size;
  const favWords = ALL_WORDS.filter(d => favs.has(d.r));
  if(!favWords.length){ content.innerHTML = '<div style="text-align:center;padding:40px;color:var(--parchment3)">Skarbiec jest pusty. Kliknij ⭐ w Leksykonie.</div>'; return; }
  const grid = document.createElement('div'); grid.className = 'fav-grid';
  favWords.forEach(d => {
    const card = document.createElement('div'); card.className = 'fav-card';
    card.innerHTML = `<div class="fav-em">${d.e}</div><div class="fav-r">${d.r}</div><div class="fav-pl">${d.pl}</div>
    <button class="btn" style="margin-top:6px;justify-content:center" onclick="speakText('${d.r}')">🔊</button>
    <button class="fav-rm" onclick="favs.delete('${d.r}');saveFavs();renderFavs();document.getElementById('ct-slowa').textContent=favs.size">Wymaż</button>`;
    grid.appendChild(card);
  });
  content.innerHTML = ''; content.appendChild(grid);
}

// ============================================================================
// 🗺️ MAPA ŚWIATA
// ============================================================================


function calculateHeroPower() {
  const favCount = favs.size;
  const dojoDone = parseInt(localStorage.getItem('arcana_dojo_completions') || '0');
  const scrollsRead = JSON.parse(localStorage.getItem('arcana_scrolls_read') || '[]').length;
  return favCount * 2 + dojoDone * 5 + scrollsRead * 8;
}

function renderWorldMap() {
  const power = calculateHeroPower();
  const maxPower = 150;
  document.getElementById('hero-power').textContent = power;
  document.getElementById('hero-power-fill').style.width = Math.min(100, (power / maxPower) * 100) + '%';
  const unlockedCount = WORLD_REGIONS.filter(r => power >= r.requiredPower).length;
  document.getElementById('regions-conquered').textContent = unlockedCount;
  
  const paths = document.getElementById('map-paths');
  const regions = document.getElementById('map-regions');
  paths.innerHTML = ''; regions.innerHTML = '';
  
  MAP_PATHS.forEach(pair => {
    const rA = WORLD_REGIONS.find(r => r.id === pair[0]);
    const rB = WORLD_REGIONS.find(r => r.id === pair[1]);
    const bothUnlocked = power >= rA.requiredPower && power >= rB.requiredPower;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const mx = (rA.x + rB.x) / 2;
    const my = (rA.y + rB.y) / 2 - 20;
    path.setAttribute('d', 'M ' + rA.x + ' ' + rA.y + ' Q ' + mx + ' ' + my + ' ' + rB.x + ' ' + rB.y);
    path.setAttribute('stroke', bothUnlocked ? '#d4af37' : '#4c1d95');
    path.setAttribute('opacity', bothUnlocked ? '0.7' : '0.25');
    paths.appendChild(path);
  });
  
  WORLD_REGIONS.forEach(region => {
    const unlocked = power >= region.requiredPower;
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'map-region-group' + (unlocked ? '' : ' locked'));
    group.style.color = region.color;
    
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glow.setAttribute('cx', region.x); glow.setAttribute('cy', region.y);
    glow.setAttribute('r', 45); glow.setAttribute('fill', region.color);
    glow.setAttribute('opacity', unlocked ? '0.15' : '0.05');
    glow.setAttribute('filter', 'url(#mapGlow)');
    group.appendChild(glow);
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', region.x); circle.setAttribute('cy', region.y);
    circle.setAttribute('r', 30); circle.setAttribute('fill', '#0b050f');
    circle.setAttribute('stroke', region.color); circle.setAttribute('stroke-width', 2);
    group.appendChild(circle);
    
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    icon.setAttribute('x', region.x); icon.setAttribute('y', region.y + 2);
    icon.setAttribute('class', 'map-region-icon');
    icon.textContent = unlocked ? region.icon : '🔒';
    group.appendChild(icon);
    
    const name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    name.setAttribute('x', region.x); name.setAttribute('y', region.y + 58);
    name.setAttribute('class', 'map-region-name');
    name.setAttribute('fill', unlocked ? '#fff' : '#6b7280');
    name.textContent = region.name;
    group.appendChild(name);
    
    const sub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    sub.setAttribute('x', region.x); sub.setAttribute('y', region.y + 74);
    sub.setAttribute('class', 'map-region-sub');
    sub.setAttribute('fill', unlocked ? region.color : '#4c1d95');
    sub.textContent = region.jp;
    group.appendChild(sub);
    
    group.addEventListener('mouseenter', (e) => showMapTooltip(region, e));
    group.addEventListener('mouseleave', hideMapTooltip);
    group.addEventListener('mousemove', (e) => moveMapTooltip(e));
    group.addEventListener('click', () => { if(unlocked) openRegionDetail(region); });
    
    regions.appendChild(group);
  });
}

function showMapTooltip(region, evt) {
  const power = calculateHeroPower();
  const unlocked = power >= region.requiredPower;
  const wordsInRegion = ALL_WORDS.filter(w => region.categories.includes(w.cat));
  const learnedInRegion = wordsInRegion.filter(w => favs.has(w.r)).length;
  
  const tip = document.getElementById('map-tooltip');
  let html = '<div class="map-tooltip-title" style="color:' + region.color + '">' + region.icon + ' ' + region.name + '</div>';
  html += '<div class="map-tooltip-desc">' + region.subtitle + '</div>';
  if(unlocked) {
    html += '<div class="map-tooltip-stats"><div class="map-tooltip-stat"><span>Słowa:</span><b>' + learnedInRegion + '/' + wordsInRegion.length + '</b></div><div class="map-tooltip-stat"><span>Moc wymagana:</span><b>' + region.requiredPower + '</b></div></div>';
    html += '<div class="map-tooltip-unlocked">✓ ODBLOKOWANE — kliknij</div>';
  } else {
    html += '<div class="map-tooltip-requirement">🔒 Wymagana moc: ' + region.requiredPower + ' (masz ' + power + ')</div>';
  }
  tip.innerHTML = html;
  tip.classList.add('show');
  moveMapTooltip(evt);
}

function moveMapTooltip(evt) {
  const tip = document.getElementById('map-tooltip');
  const container = document.getElementById('map-container');
  if(!tip || !container) return;
  const rect = container.getBoundingClientRect();
  const x = evt.clientX - rect.left;
  const y = evt.clientY - rect.top;
  const tipW = tip.offsetWidth;
  const tipH = tip.offsetHeight;
  let left = x + 20;
  let top = y + 20;
  if(left + tipW > rect.width) left = x - tipW - 20;
  if(top + tipH > rect.height) top = y - tipH - 20;
  tip.style.left = left + 'px';
  tip.style.top = top + 'px';
}

function hideMapTooltip() {
  const tip = document.getElementById('map-tooltip');
  if(tip) tip.classList.remove('show');
}

function openRegionDetail(region) {
  const wordsInRegion = ALL_WORDS.filter(w => region.categories.includes(w.cat));
  const learnedInRegion = wordsInRegion.filter(w => favs.has(w.r)).length;
  const progress = wordsInRegion.length ? (learnedInRegion / wordsInRegion.length * 100) : 0;
  const regionScrolls = WISDOM_SCROLLS.filter(s => s.region === region.id);
  const scrollsRead = JSON.parse(localStorage.getItem('arcana_scrolls_read') || '[]');
  const readInRegion = regionScrolls.filter(s => scrollsRead.includes(s.id)).length;
  
  const content = document.getElementById('region-detail-content');
  let html = '<div class="region-detail-header"><div class="region-detail-icon" style="color:' + region.color + '">' + region.icon + '</div><div class="region-detail-title" style="color:' + region.color + '">' + region.name + '</div><div class="region-detail-subtitle">' + region.jp + ' · ' + region.subtitle + '</div></div>';
  html += '<div class="region-detail-lore">' + region.lore + '</div>';
  html += '<div class="region-detail-progress"><div class="region-progress-row"><span>📚 OPANOWANE SŁOWA</span><span><b>' + learnedInRegion + '</b> / ' + wordsInRegion.length + '</span></div><div class="region-progress-bar"><div class="region-progress-fill" style="width:' + progress + '%; background:' + region.color + '; box-shadow:0 0 10px ' + region.color + '"></div></div>';
  
  if(regionScrolls.length) {
    const scrollProgress = (readInRegion / regionScrolls.length * 100);
    html += '<div class="region-progress-row"><span>🎴 PRZECZYTANE ZWOJE</span><span><b>' + readInRegion + '</b> / ' + regionScrolls.length + '</span></div><div class="region-progress-bar"><div class="region-progress-fill" style="width:' + scrollProgress + '%; background:' + region.color + '; box-shadow:0 0 10px ' + region.color + '"></div></div>';
  }
  html += '</div>';
  html += '<div class="region-actions"><button class="region-action-btn" onclick="jumpToLexiconCat(\'' + region.categories[0] + '\')">📚 Studiuj słówka</button><button class="region-action-btn" onclick="closeRegionDetail(); showPage(\'dojo\');">⚔️ Wyrusz na próbę</button></div>';
  
  if(regionScrolls.length) {
    html += '<div style="margin-top:25px;"><div class="cat-label" style="margin-top:0;">🎴 Zwoje tego regionu</div><div class="region-scrolls-list">';
    regionScrolls.forEach(scroll => {
      const isRead = scrollsRead.includes(scroll.id);
      html += '<div class="region-scroll-item' + (isRead?' read':'') + '" onclick="closeRegionDetail(); showPage(\'zwoje\'); setTimeout(function(){openScrollReader(' + scroll.id + ');}, 200);"><div class="region-scroll-emoji">' + scroll.emoji + '</div><div class="region-scroll-title">' + scroll.title + '</div><div class="region-scroll-level">' + scroll.level + '</div></div>';
    });
    html += '</div></div>';
  }
  
  content.innerHTML = html;
  document.getElementById('region-detail').classList.add('show');
  hideMapTooltip();
}

function closeRegionDetail() {
  document.getElementById('region-detail').classList.remove('show');
}

function jumpToLexiconCat(catId) {
  closeRegionDetail();
  showPage('slownik');
  setTimeout(() => {
    const btns = document.querySelectorAll('.fb');
    btns.forEach(b => {
      const cat = CATS.find(c => c.label === b.textContent);
      if(cat && cat.id === catId) b.click();
    });
  }, 200);
}

// ============================================================================
// 🎴 ZWOJE MĄDROŚCI
// ============================================================================

function renderScrollsGrid() {
  const grid = document.getElementById('scrolls-grid');
  if(!grid) return;
  const power = calculateHeroPower();
  const scrollsRead = JSON.parse(localStorage.getItem('arcana_scrolls_read') || '[]');
  
  grid.innerHTML = '';
  WISDOM_SCROLLS.forEach(scroll => {
    const region = WORLD_REGIONS.find(r => r.id === scroll.region);
    const locked = region && power < region.requiredPower;
    const isRead = scrollsRead.includes(scroll.id);
    
    const card = document.createElement('div');
    card.className = 'scroll-card' + (locked ? ' locked' : '');
    
    const firstLine = scroll.content.split('|')[0];
    const preview = firstLine.replace(/\[([^|]+)\|[^|]+\|[^\]]+\]/g, '$1');
    
    let innerHtml = '<div class="scroll-card-header"><div class="scroll-card-seal">' + scroll.emoji + '</div><div style="flex:1"><div class="scroll-card-title">' + scroll.title + '</div><div class="scroll-card-jp">' + scroll.titleJp + '</div></div></div>';
    innerHtml += '<div class="scroll-card-meta"><span class="scroll-meta-badge">📜 ' + scroll.level + '</span><span class="scroll-meta-badge region">' + (region ? region.icon + ' ' + region.name : '') + '</span><span class="scroll-meta-badge">⏱ ' + scroll.minutes + ' min</span></div>';
    innerHtml += '<div class="scroll-card-preview">' + preview + '...</div>';
    innerHtml += '<div class="scroll-card-footer"><span>' + (isRead ? '✓ Przeczytany' : 'Nieotwarty') + '</span><span>' + (locked ? '🔒 Zablokowany' : 'Kliknij') + '</span></div>';
    card.innerHTML = innerHtml;
    
    if(!locked) {
      card.onclick = () => openScrollReader(scroll.id);
    } else {
      card.onclick = () => alert('🔒 Ten zwój leży w regionie "' + region.name + '".\n\nWymagana moc: ' + region.requiredPower + '\nTwoja moc: ' + power);
    }
    grid.appendChild(card);
  });
}

let currentScroll = null;

function openScrollReader(scrollId) {
  const scroll = WISDOM_SCROLLS.find(s => s.id === scrollId);
  if(!scroll) return;
  currentScroll = scroll;
  
  const region = WORLD_REGIONS.find(r => r.id === scroll.region);
  const content = document.getElementById('scroll-reader-content');
  
  const parsedContent = scroll.content.split('|').filter((x,i,arr) => {
    // Each line is ended by a period-sentence, so we need to detect what is a sentence boundary
    return true;
  }).map(line => parseScrollLine(line)).join('');
  
  // Better approach: split by newlines (we use | as pseudo-separator, but sentences end with .)
  // Actually simplest: rebuild from content with our parser
  const parsedFull = parseFullScroll(scroll.content);
  
  let html = '<div class="scroll-reader-title">' + scroll.emoji + ' ' + scroll.title + '</div>';
  html += '<div class="scroll-reader-subtitle">' + scroll.titleJp + ' · ' + (region ? region.name : '') + ' · ' + scroll.level + '</div>';
  html += '<div class="scroll-reader-divider">✦ ✦ ✦</div>';
  html += '<div class="scroll-reader-content">' + parsedFull + '</div>';
  html += '<div class="scroll-reader-translation" id="scroll-translation"><b>Tłumaczenie Mistrzyni:</b><br>' + scroll.translation + '<br><br><b style="color:var(--crimson);">📖 Komentarz:</b><br>' + scroll.lore + '</div>';
  html += '<div class="scroll-reader-actions"><button class="scroll-reader-btn" onclick="toggleScrollTranslation()">📜 Pokaż tłumaczenie</button><button class="scroll-reader-btn" onclick="speakText(getScrollPlainJp())">🔊 Czytaj głośno</button><button class="scroll-reader-btn" onclick="markScrollRead(' + scroll.id + ', this)">✓ Oznacz jako przeczytany</button></div>';
  
  content.innerHTML = html;
  
  setTimeout(() => {
    document.querySelectorAll('#scroll-reader-content .jp-word').forEach(el => {
      el.addEventListener('click', (e) => showWordTooltip(el, e));
    });
  }, 50);
  
  document.getElementById('scroll-reader-overlay').classList.add('show');
}

function parseFullScroll(content) {
  // Each | separates a sentence. Each sentence contains [jp|romaji|pl] tokens and plain punctuation.
  return content.split('|').map(line => {
    const tokens = parseScrollSentence(line);
    return '<div class="scroll-sentence">' + tokens + '</div>';
  }).join('');
}

function parseScrollSentence(line) {
  // Replace [jp|romaji|pl] with rich card
  let result = '';
  let i = 0;
  while(i < line.length) {
    if(line[i] === '[') {
      // Find matching ]
      const end = line.indexOf(']', i);
      if(end === -1) { result += line[i]; i++; continue; }
      const inner = line.substring(i + 1, end);
      const parts = inner.split('|');
      if(parts.length === 3) {
        const [jp, romaji, pl] = parts;
        const isSaved = favs.has(romaji);
        result += '<span class="jp-word' + (isSaved ? ' saved' : '') + '" data-jp="' + jp + '" data-romaji="' + romaji + '" data-pl="' + pl + '">'
          + '<span class="jpw-kanji">' + jp + '</span>'
          + '<span class="jpw-romaji">' + romaji + '</span>'
          + '<span class="jpw-pl">' + pl + '</span>'
          + '</span>';
        i = end + 1;
      } else {
        result += line[i]; i++;
      }
    } else {
      // Plain text - skip whitespace as we use flex layout
      if(line[i] === ' ') { i++; continue; }
      // Punctuation as separate small element
      result += '<span class="jpw-punct">' + line[i] + '</span>';
      i++;
    }
  }
  return result;
}

function parseScrollLine(line) {
  // Legacy fallback (kept for compatibility)
  return parseScrollSentence(line);
}

function getScrollPlainJp() {
  if(!currentScroll) return '';
  return currentScroll.content.replace(/\[([^|]+)\|([^|]+)\|[^\]]+\]/g, '$2').replace(/\|/g, ' ');
}

function toggleScrollTranslation() {
  const t = document.getElementById('scroll-translation');
  if(t) t.classList.toggle('show');
}

function markScrollRead(scrollId, btn) {
  const read = JSON.parse(localStorage.getItem('arcana_scrolls_read') || '[]');
  if(!read.includes(scrollId)) {
    read.push(scrollId);
    localStorage.setItem('arcana_scrolls_read', JSON.stringify(read));
  }
  if(btn) {
    btn.textContent = '✓ Zapisano w kronikach!';
    btn.style.background = 'rgba(16,185,129,0.3)';
  }
  setTimeout(() => { closeScrollReader(); renderScrollsGrid(); }, 800);
}

function closeScrollReader() {
  document.getElementById('scroll-reader-overlay').classList.remove('show');
  hideWordTooltip();
}

function showWordTooltip(el, evt) {
  const tooltip = document.getElementById('word-tooltip');
  if(!tooltip) return;
  const jp = el.dataset.jp;
  const romaji = el.dataset.romaji;
  const pl = el.dataset.pl;
  const isSaved = favs.has(romaji);
  
  tooltip.innerHTML = '<div class="word-tooltip-jp">' + jp + '</div><div class="word-tooltip-romaji">' + romaji + '</div><div class="word-tooltip-pl">' + pl + '</div><div class="word-tooltip-actions"><button class="word-tooltip-btn" onclick="speakText(\'' + romaji + '\')">🔊 Wymów</button><button class="word-tooltip-btn ' + (isSaved?'saved':'') + '" onclick="saveScrollWord(\'' + romaji + '\',\'' + pl.replace(/'/g,"\\'") + '\',\'' + jp + '\', this)">' + (isSaved ? '⭐ Zapisane' : '⭐ Do Skarbca') + '</button></div>';
  
  const rect = el.getBoundingClientRect();
  const tipW = 240;
  let left = rect.left + rect.width/2 - tipW/2;
  let top = rect.bottom + 8;
  if(left < 10) left = 10;
  if(left + tipW > window.innerWidth - 10) left = window.innerWidth - tipW - 10;
  if(top + 160 > window.innerHeight) top = rect.top - 160;
  
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
  tooltip.classList.add('show');
  
  setTimeout(() => {
    document.addEventListener('click', closeWordTooltipOnClickOut, {once: true});
  }, 10);
  
  evt && evt.stopPropagation();
}

function closeWordTooltipOnClickOut(e) {
  const tooltip = document.getElementById('word-tooltip');
  if(tooltip && !tooltip.contains(e.target) && !e.target.classList.contains('jp-word')) {
    hideWordTooltip();
  }
}

function hideWordTooltip() {
  const tooltip = document.getElementById('word-tooltip');
  if(tooltip) tooltip.classList.remove('show');
}

function saveScrollWord(romaji, pl, jp, btn) {
  favs.add(romaji);
  saveFavs();
  document.getElementById('fav-count').textContent = favs.size;
  if(btn) {
    btn.textContent = '⭐ Zapisane';
    btn.classList.add('saved');
  }
  document.querySelectorAll('.jp-word[data-romaji="' + romaji + '"]').forEach(el => el.classList.add('saved'));
}

// ============================================================================
// 🌸 HANAMI — CODZIENNE SŁOWO
// ============================================================================


function todayKey() {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
}

function getHanamiState() {
  try { return JSON.parse(localStorage.getItem('arcana_hanami') || '{}'); } catch(e) { return {}; }
}

function saveHanamiState(state) {
  localStorage.setItem('arcana_hanami', JSON.stringify(state));
}

function pickHanamiWord() {
  // Prefer words that have lore; fall back to random
  const withLore = D.filter(w => HANAMI_LORE[w.r]);
  const pool = withLore.length >= 10 ? withLore : D.filter(w => w.pl && w.r);
  // Seed by date for consistency within a day
  const seed = todayKey().split('-').reduce((a,b) => a + parseInt(b), 0);
  return pool[seed % pool.length];
}

function getHanamiStreak() {
  const state = getHanamiState();
  if(!state.lastSeen) return 0;
  const last = new Date(state.lastSeen);
  const today = new Date();
  today.setHours(0,0,0,0); last.setHours(0,0,0,0);
  const diffDays = Math.round((today - last) / (1000*60*60*24));
  if(diffDays === 0) return state.streak || 1;
  if(diffDays === 1) return state.streak || 0;
  return 0; // streak broken
}

function renderHanami() {
  const container = document.getElementById('hanami-banner-container');
  if(!container) return;
  
  const state = getHanamiState();
  const today = todayKey();
  
  // Check if dismissed for today
  if(state.dismissed === today) {
    container.innerHTML = '';
    return;
  }
  
  // Update streak
  const currentStreak = getHanamiStreak();
  let newStreak = currentStreak;
  if(state.lastSeen !== today) {
    newStreak = currentStreak + 1;
    saveHanamiState({...state, lastSeen: today, streak: newStreak, dismissed: state.dismissed === today ? today : null});
  }
  
  const word = pickHanamiWord();
  const lore = HANAMI_LORE[word.r] || word.fun || 'Pradawna runa o niezgłębionej mocy.';
  const quoteIdx = today.split('-').reduce((a,b) => a + parseInt(b), 0) % HANAMI_QUOTES.length;
  const quote = HANAMI_QUOTES[quoteIdx];
  
  const emojiTree = ['🌸','🌺','🏯','🍡','🌙'][quoteIdx % 5];
  
  // Petals
  let petalsHtml = '';
  for(let i = 0; i < 10; i++) {
    const left = Math.random() * 100;
    const delay = Math.random() * 10;
    const duration = 8 + Math.random() * 6;
    petalsHtml += '<div class="petal" style="left:'+left+'%; animation-delay:'+delay+'s; animation-duration:'+duration+'s;">🌸</div>';
  }
  
  container.innerHTML = `
    <div class="hanami-banner">
      <div class="hanami-petals">${petalsHtml}</div>
      <button class="hanami-close" onclick="dismissHanami()" title="Schowaj na dziś">✕</button>
      <div class="hanami-layout">
        <div class="hanami-tree">${emojiTree}</div>
        <div class="hanami-content">
          <div class="hanami-label">🌸 Kwiat Dnia · ${new Date().toLocaleDateString('pl-PL', {weekday:'long', day:'numeric', month:'long'})}</div>
          <div class="hanami-word-jp">${word.e || ''} ${word.r}</div>
          <div class="hanami-word-romaji">${word.r}${word.m && word.m !== '—' ? ' · '+word.m : ''}</div>
          <div class="hanami-word-pl">${word.pl} <span style="color:#a78bfa">(${word.en||''})</span></div>
          <div class="hanami-lore">${lore}<br><br>✦ <i>${quote}</i></div>
          <div class="hanami-actions">
            <button class="hanami-btn" onclick="speakText('${word.r.replace(/'/g,"\\'")}')">🔊 Wymów</button>
            <button class="hanami-btn" onclick="toggleFav('${word.r}', this); renderHanami();">${favs.has(word.r) ? '⭐ W Skarbcu' : '⭐ Dodaj do Skarbca'}</button>
            <button class="hanami-btn" onclick="kiaiPracticeWord({r:'${word.r}',pl:'${(word.pl||'').replace(/'/g,"\\'")}',e:'${word.e||''}'})">🗡️ Ćwicz Kiai</button>
          </div>
        </div>
        <div class="hanami-streak">
          <div class="hanami-streak-icon">🔥</div>
          <div class="hanami-streak-count">${newStreak}</div>
          <div class="hanami-streak-label">Dni z rzędu</div>
        </div>
      </div>
    </div>
  `;
}

function dismissHanami() {
  const state = getHanamiState();
  saveHanamiState({...state, dismissed: todayKey()});
  document.getElementById('hanami-banner-container').innerHTML = '';
}

// ============================================================================
// 🗡️ KIAI — TRENING WYMOWY
// ============================================================================
let kiaiMode = 'easy';
let kiaiCurrent = null;
let kiaiRecognition = null;
let kiaiRecording = false;
let kiaiStats = JSON.parse(localStorage.getItem('arcana_kiai_stats') || '{"attempts":0,"scores":[],"best":0,"streak":0}');


function initKiai() {
  // Check browser support
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR) {
    document.getElementById('kiai-result').innerHTML = '<div style="text-align:center; color:#fca5a5; padding:15px;"><b>⚠️ Twoja przeglądarka nie obsługuje rozpoznawania mowy</b><br><br>Użyj <b>Chrome</b> lub <b>Edge</b> na komputerze — niestety Firefox i Safari nie wspierają Web Speech API.</div>';
    document.getElementById('kiai-result').classList.add('show','fail');
  }
  kiaiUpdateStats();
  kiaiNext();
}

function setKiaiMode(mode) {
  kiaiMode = mode;
  document.querySelectorAll('.kiai-mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.kiaiMode === mode);
  });
  kiaiNext();
}

function kiaiPickTarget() {
  if(kiaiMode === 'easy') {
    // Pick from vocabulary with valid romaji
    const pool = D.filter(w => w.r && w.pl && !['—',''].includes(w.m) || (w.r && w.pl));
    const word = pool[Math.floor(Math.random() * pool.length)];
    return {
      jp: toKana(word.r) || word.r,
      r: word.r,
      pl: word.pl + (word.e ? ' ' + word.e : '')
    };
  } else if(kiaiMode === 'medium') {
    return KIAI_MEDIUM[Math.floor(Math.random() * KIAI_MEDIUM.length)];
  } else {
    return KIAI_HARD[Math.floor(Math.random() * KIAI_HARD.length)];
  }
}

function kiaiNext() {
  kiaiCurrent = kiaiPickTarget();
  document.getElementById('kiai-target-jp').textContent = kiaiCurrent.jp;
  document.getElementById('kiai-target-romaji').textContent = kiaiCurrent.r;
  document.getElementById('kiai-target-pl').textContent = kiaiCurrent.pl;
  document.getElementById('kiai-result').classList.remove('show');
}

function kiaiPracticeWord(word) {
  // Called from Hanami - jump to Kiai and practice specific word
  showPage('kiai');
  setTimeout(() => {
    kiaiMode = 'easy';
    document.querySelectorAll('.kiai-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.kiaiMode === 'easy'));
    kiaiCurrent = { jp: toKana(word.r) || word.r, r: word.r, pl: word.pl + (word.e ? ' ' + word.e : '') };
    document.getElementById('kiai-target-jp').textContent = kiaiCurrent.jp;
    document.getElementById('kiai-target-romaji').textContent = kiaiCurrent.r;
    document.getElementById('kiai-target-pl').textContent = kiaiCurrent.pl;
    document.getElementById('kiai-result').classList.remove('show');
  }, 200);
}

function kiaiListenSample() {
  if(!kiaiCurrent) return;
  speakText(kiaiCurrent.r);
}

function kiaiToggleRecord() {
  if(kiaiRecording) {
    if(kiaiRecognition) kiaiRecognition.stop();
    return;
  }
  
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR) {
    alert('Twoja przeglądarka nie obsługuje rozpoznawania mowy. Użyj Chrome lub Edge.');
    return;
  }
  
  kiaiRecognition = new SR();
  kiaiRecognition.lang = 'ja-JP';
  kiaiRecognition.continuous = false;
  kiaiRecognition.interimResults = false;
  kiaiRecognition.maxAlternatives = 5;
  
  const btn = document.getElementById('kiai-record-btn');
  const indicator = document.getElementById('kiai-mic-indicator');
  
  kiaiRecognition.onstart = () => {
    kiaiRecording = true;
    btn.classList.add('active');
    btn.textContent = '🔴 Słucham... (kliknij aby zatrzymać)';
    indicator.classList.add('active');
  };
  
  kiaiRecognition.onend = () => {
    kiaiRecording = false;
    btn.classList.remove('active');
    btn.textContent = '🎤 Wypowiedz Kiai';
    indicator.classList.remove('active');
  };
  
  kiaiRecognition.onerror = (e) => {
    kiaiRecording = false;
    btn.classList.remove('active');
    btn.textContent = '🎤 Wypowiedz Kiai';
    indicator.classList.remove('active');
    let msg = 'Nie udało się rozpoznać głosu.';
    if(e.error === 'not-allowed') msg = '⚠️ Musisz zezwolić na dostęp do mikrofonu.';
    else if(e.error === 'no-speech') msg = '🔇 Nic nie usłyszałam. Spróbuj ponownie głośniej.';
    else if(e.error === 'network') msg = '🌐 Błąd sieci. Web Speech API wymaga połączenia.';
    kiaiShowResult(0, '', msg, 'fail');
  };
  
  kiaiRecognition.onresult = (event) => {
    const alternatives = [];
    for(let i = 0; i < event.results[0].length; i++) {
      alternatives.push(event.results[0][i].transcript);
    }
    kiaiEvaluate(alternatives);
  };
  
  try {
    kiaiRecognition.start();
  } catch(e) {
    alert('Nie udało się uruchomić rozpoznawania: ' + e.message);
  }
}

function kiaiEvaluate(alternatives) {
  const target = kiaiCurrent.jp.replace(/\s/g,'');
  const targetRomaji = kiaiCurrent.r.toLowerCase().replace(/\s/g,'');
  
  // Try each alternative, pick best score
  let bestScore = 0;
  let bestHeard = alternatives[0] || '';
  
  alternatives.forEach(heard => {
    const heardClean = heard.replace(/\s/g,'');
    const heardRomaji = kanaToRomaji(heardClean).replace(/\s/g,'').toLowerCase();
    
    const scoreKana = similarityScore(heardClean, target);
    const scoreRomaji = similarityScore(heardRomaji, targetRomaji);
    const score = Math.max(scoreKana, scoreRomaji);
    
    if(score > bestScore) {
      bestScore = score;
      bestHeard = heard;
    }
  });
  
  const pct = Math.round(bestScore * 100);
  
  // Classify result
  let cls, title, comment;
  if(pct >= 90) {
    cls = 'excellent';
    title = '🔥 DOSKONAŁY KIAI!';
    comment = '*Akemi kiwa głową z uznaniem* Przywołałeś ducha słowa. Twój głos niesie moc zaklęcia.';
  } else if(pct >= 70) {
    cls = 'good';
    title = '⚔️ Dobry głos wojownika';
    comment = '*Akemi uśmiecha się* Blisko, adepcie. Słyszę w tobie potencjał. Spróbuj raz jeszcze, wyraźniej.';
  } else if(pct >= 40) {
    cls = 'ok';
    title = '🌱 Szept adepta';
    comment = '*Akemi marszczy brwi* Duch słowa jeszcze nie pojawił się w pełni. Posłuchaj wymowy i spróbuj ponownie.';
  } else {
    cls = 'fail';
    title = '💭 Echo nieusłyszane';
    comment = '*Akemi przekrzywia głowę* Nie to słowo, adepcie. Może nacisk padł nie tam gdzie trzeba? Posłuchaj jeszcze raz.';
  }
  
  kiaiShowResult(pct, bestHeard, comment, cls, title);
  
  // Update stats
  kiaiStats.attempts = (kiaiStats.attempts || 0) + 1;
  kiaiStats.scores = kiaiStats.scores || [];
  kiaiStats.scores.push(pct);
  if(kiaiStats.scores.length > 50) kiaiStats.scores = kiaiStats.scores.slice(-50);
  kiaiStats.best = Math.max(kiaiStats.best || 0, pct);
  if(pct >= 80) {
    kiaiStats.streak = (kiaiStats.streak || 0) + 1;
  } else {
    kiaiStats.streak = 0;
  }
  localStorage.setItem('arcana_kiai_stats', JSON.stringify(kiaiStats));
  kiaiUpdateStats();
}

function kiaiShowResult(pct, heard, comment, cls, title) {
  const result = document.getElementById('kiai-result');
  result.className = 'kiai-result show ' + cls;
  let heardHtml = heard ? '<div class="kiai-result-heard">🎙️ Usłyszałam: "<b>' + heard + '</b>"</div>' : '';
  result.innerHTML = `
    <div class="kiai-result-header">
      <div class="kiai-result-title">${title || 'Wynik'}</div>
      <div class="kiai-result-score">${pct}%</div>
    </div>
    ${heardHtml}
    <div class="kiai-result-comment">${comment}</div>
  `;
}

function kiaiUpdateStats() {
  document.getElementById('kiai-stat-attempts').textContent = kiaiStats.attempts || 0;
  document.getElementById('kiai-stat-best').textContent = (kiaiStats.best || 0) + '%';
  const avg = kiaiStats.scores && kiaiStats.scores.length
    ? Math.round(kiaiStats.scores.reduce((a,b)=>a+b,0) / kiaiStats.scores.length)
    : 0;
  document.getElementById('kiai-stat-avg').textContent = avg ? avg + '%' : '—';
  document.getElementById('kiai-stat-streak').textContent = kiaiStats.streak || 0;
}

// Algorytm Levenshtein distance
function levenshtein(a, b) {
  if(!a.length) return b.length;
  if(!b.length) return a.length;
  const matrix = [];
  for(let i = 0; i <= b.length; i++) matrix[i] = [i];
  for(let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for(let i = 1; i <= b.length; i++) {
    for(let j = 1; j <= a.length; j++) {
      if(b.charAt(i-1) === a.charAt(j-1)) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i-1][j-1] + 1,
          matrix[i][j-1] + 1,
          matrix[i-1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function similarityScore(a, b) {
  if(!a && !b) return 1;
  if(!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  const dist = levenshtein(a, b);
  return 1 - (dist / maxLen);
}

// Mapa odwrotna hiragana -> romaji
const kanaToRomajiMap = (() => {
  const m = {};
  Object.keys(romajiMap).forEach(r => { m[romajiMap[r]] = r; });
  return m;
})();

function kanaToRomaji(kana) {
  if(!kana) return '';
  let result = '';
  for(let i = 0; i < kana.length; i++) {
    // Try 2-char combos first
    if(i+1 < kana.length && kanaToRomajiMap[kana.substr(i,2)]) {
      result += kanaToRomajiMap[kana.substr(i,2)];
      i++;
    } else if(kanaToRomajiMap[kana[i]]) {
      result += kanaToRomajiMap[kana[i]];
    } else {
      result += kana[i]; // keep original for kanji/unknown
    }
  }
  return result;
}

// ============================================================================
// 🎭 SCENY ROLEPLAY (Conversation Scenarios)
// ============================================================================

let currentScene = null;
let sceneHistory = [];

function initScenes() {
  const grid = document.getElementById('scenes-grid');
  const stage = document.getElementById('scene-stage');
  if(!grid) return;
  
  // Hide stage if previously open
  stage.classList.remove('active');
  grid.style.display = 'grid';
  document.getElementById('scenes-intro-text').style.display = 'block';
  
  // Render scene cards
  grid.innerHTML = '';
  SCENES.forEach(scene => {
    const card = document.createElement('div');
    card.className = 'scene-card';
    card.style.setProperty('--scene-color', scene.color);
    card.innerHTML = `
      <div class="scene-card-header">
        <div class="scene-card-emoji">${scene.emoji}</div>
        <div class="scene-card-title-wrap">
          <div class="scene-card-title">${scene.title}</div>
          <div class="scene-card-jp">${scene.titleJp}</div>
        </div>
      </div>
      <div class="scene-card-character">${scene.characterEmoji} ${scene.character}</div>
      <div class="scene-card-desc">${scene.description}</div>
      <div class="scene-card-meta">
        <span class="scene-meta-pill level">📜 ${scene.level}</span>
        <span class="scene-meta-pill">⏱ ${scene.duration}</span>
      </div>
      <div class="scene-card-vocab"><b>Kluczowe słowa:</b> ${scene.keyVocab.join(', ')}</div>
    `;
    card.onclick = () => openScene(scene);
    grid.appendChild(card);
  });
}

function openScene(scene) {
  // Check Oracle (Gemini) availability
  const apiKey = localStorage.getItem('arcana_oracle_key');
  if(!apiKey) {
    const grid = document.getElementById('scenes-grid');
    grid.innerHTML = `
      <div class="scene-no-key-warning" style="grid-column: 1/-1;">
        🔮 <b>Oko Wyroczni nie zostało otwarte</b><br><br>
        Sceny Roleplay wymagają klucza Gemini API (ten sam klucz co Oko Wyroczni w zakładce Mistrzyni).<br>
        Włącz Oko Wyroczni najpierw, a potem wróć tu.<br>
        <button onclick="showPage('chat'); setTimeout(toggleOracle, 200);">Otwórz Oko Wyroczni</button>
      </div>
    `;
    return;
  }
  
  currentScene = scene;
  sceneHistory = [];
  
  // Hide grid, show stage
  document.getElementById('scenes-grid').style.display = 'none';
  document.getElementById('scenes-intro-text').style.display = 'none';
  const stage = document.getElementById('scene-stage');
  stage.classList.add('active');
  
  // Header
  document.getElementById('scene-header-bar').innerHTML = `
    <div class="scene-header-emoji" style="color:${scene.color}">${scene.emoji}</div>
    <div class="scene-header-info">
      <div class="scene-header-title">${scene.title}</div>
      <div class="scene-header-sub">${scene.titleJp} · ${scene.characterEmoji} ${scene.character}</div>
    </div>
    <div class="scene-header-actions">
      <button class="scene-header-btn" onclick="sceneRestart()">🔄 Od nowa</button>
      <button class="scene-header-btn exit" onclick="sceneExit()">✕ Wyjdź</button>
    </div>
  `;
  
  // Context panel
  document.getElementById('scene-context-panel').innerHTML = `
    <b>📍 Scena:</b> ${scene.place}
  `;
  
  // Clear messages and start
  document.getElementById('scene-messages').innerHTML = '';
  document.getElementById('scene-suggestions').innerHTML = '';
  document.getElementById('scene-input').value = '';
  
  // Initial NPC message - generate intro
  sceneStartConversation();
}

async function sceneStartConversation() {
  // Add system "scene begins" message
  addSceneMsg('system', { 
    action: '🎬 Scena się rozpoczyna...', 
    isSystem: true 
  });
  
  // Generate first NPC turn
  const introPrompt = "Adept właśnie wszedł. Przywitaj go w klimacie scenariusza i zacznij rozmowę.";
  await sceneCallOracle(introPrompt, true);
}

function sceneExit() {
  document.getElementById('scene-stage').classList.remove('active');
  document.getElementById('scenes-grid').style.display = 'grid';
  document.getElementById('scenes-intro-text').style.display = 'block';
  currentScene = null;
  sceneHistory = [];
}

function sceneRestart() {
  if(!currentScene) return;
  sceneHistory = [];
  document.getElementById('scene-messages').innerHTML = '';
  document.getElementById('scene-suggestions').innerHTML = '';
  sceneStartConversation();
}

function addSceneMsg(role, data) {
  const msgs = document.getElementById('scene-messages');
  const div = document.createElement('div');
  div.className = `scene-msg ${role}`;
  
  let avatarHtml, bubbleHtml;
  
  if(role === 'system') {
    avatarHtml = `<div class="scene-msg-avatar">🎬</div>`;
    bubbleHtml = `<div class="scene-msg-bubble">${data.action}</div>`;
  } else if(role === 'npc') {
    avatarHtml = `<div class="scene-msg-avatar">${currentScene.characterEmoji}</div>`;
    let inner = '';
    if(data.action) inner += `<div class="scene-msg-action">${data.action}</div>`;
    if(data.jp) inner += `<div class="scene-msg-jp">${data.jp}</div>`;
    if(data.romaji) inner += `<div class="scene-msg-romaji">${data.romaji}</div>`;
    if(data.translation) inner += `<div class="scene-msg-translation">${data.translation}</div>`;
    if(data.jp || data.romaji) {
      inner += `<div class="scene-msg-actions-row">
        <button class="scene-msg-mini-btn" onclick="speakText('${(data.romaji||'').replace(/'/g,"\\'")}')">🔊 Wymów</button>
      </div>`;
    }
    bubbleHtml = `<div class="scene-msg-bubble">${inner}</div>`;
  } else if(role === 'user') {
    avatarHtml = `<div class="scene-msg-avatar">🧑‍🎓</div>`;
    bubbleHtml = `<div class="scene-msg-bubble">${data.text}</div>`;
  } else if(role === 'help') {
    avatarHtml = `<div class="scene-msg-avatar">💡</div>`;
    let inner = `<div style="color:var(--theme-glow); font-weight:700; margin-bottom:8px;">Akemi szepce ci:</div>`;
    if(data.suggestion) {
      inner += `<div class="scene-msg-jp">${data.suggestion.jp || ''}</div>`;
      if(data.suggestion.romaji) inner += `<div class="scene-msg-romaji">${data.suggestion.romaji}</div>`;
      if(data.suggestion.pl) inner += `<div class="scene-msg-translation">${data.suggestion.pl}</div>`;
    }
    if(data.tip) inner += `<div style="margin-top:10px; font-size:13px; color:#fef08a;">${data.tip}</div>`;
    bubbleHtml = `<div class="scene-msg-bubble system">${inner}</div>`;
  }
  
  div.innerHTML = avatarHtml + bubbleHtml;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function addSceneThinking() {
  const msgs = document.getElementById('scene-messages');
  const div = document.createElement('div');
  div.className = 'scene-msg npc';
  div.id = 'scene-thinking-msg';
  div.innerHTML = `<div class="scene-msg-avatar">${currentScene.characterEmoji}</div>
    <div class="scene-msg-bubble"><div class="scene-thinking"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeSceneThinking() {
  const t = document.getElementById('scene-thinking-msg');
  if(t) t.remove();
}

function renderSuggestions(suggestions) {
  const container = document.getElementById('scene-suggestions');
  container.innerHTML = '';
  if(!suggestions || !Array.isArray(suggestions)) return;
  suggestions.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'scene-suggestion';
    btn.innerHTML = `<span class="scene-suggestion-jp">${s.jp || ''}</span> <span style="opacity:0.7">— ${s.pl || ''}</span>`;
    btn.onclick = () => {
      document.getElementById('scene-input').value = s.jp || s.pl;
      document.getElementById('scene-input').focus();
    };
    container.appendChild(btn);
  });
}

async function sceneSend() {
  const input = document.getElementById('scene-input');
  const text = input.value.trim();
  if(!text || !currentScene) return;
  
  addSceneMsg('user', { text });
  sceneHistory.push({ role: 'user', content: text });
  input.value = '';
  document.getElementById('scene-suggestions').innerHTML = '';
  
  await sceneCallOracle(text, false);
}

async function sceneHelp() {
  if(!currentScene) return;
  
  addSceneThinking();
  const apiKey = localStorage.getItem('arcana_oracle_key');
  if(!apiKey) {
    removeSceneThinking();
    addSceneMsg('system', { action: '⚠️ Brak klucza Oka Wyroczni' });
    return;
  }
  
  // Build last NPC message context
  const lastNpc = [...sceneHistory].reverse().find(m => m.role === 'model');
  const lastNpcText = lastNpc ? lastNpc.content : '(początek rozmowy)';
  
  const helpPrompt = `Jesteś Akemi, mistrzynią Nihongo. Adept gra w scenę "${currentScene.title}" z postacią "${currentScene.character}". Postać właśnie powiedziała: "${lastNpcText}". 
Zaproponuj adeptowi krótką, naturalną odpowiedź po japońsku — odpowiednią do sytuacji i poziomu N5/N4.
Odpowiedz TYLKO w JSON: {"suggestion":{"jp":"...","romaji":"...","pl":"..."},"tip":"krótka rada gramatyczna lub kontekstowa po polsku"}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: helpPrompt }] }],
        generationConfig: { temperature: 0.7, responseMimeType: 'application/json' }
      })
    });
    
    removeSceneThinking();
    
    if(!res.ok) {
      addSceneMsg('system', { action: '⚠️ Akemi nie może teraz pomóc (błąd API ' + res.status + ')' });
      return;
    }
    
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let parsed;
    try { parsed = JSON.parse(text); }
    catch(e) { 
      addSceneMsg('system', { action: '⚠️ Akemi odpowiedziała niejasno: ' + text.substring(0,200) });
      return;
    }
    
    addSceneMsg('help', parsed);
  } catch(e) {
    removeSceneThinking();
    addSceneMsg('system', { action: '⚠️ Błąd: ' + e.message });
  }
}

async function sceneCallOracle(userInput, isIntro) {
  const apiKey = localStorage.getItem('arcana_oracle_key');
  if(!apiKey) {
    addSceneMsg('system', { action: '⚠️ Brak klucza Oka Wyroczni' });
    return;
  }
  
  // Disable send button
  const sendBtn = document.getElementById('scene-send-btn');
  sendBtn.disabled = true;
  addSceneThinking();
  
  // Build conversation history for Gemini
  const contents = [];
  
  // System prompt as initial user message + model ack
  contents.push({
    role: 'user',
    parts: [{ text: currentScene.systemPrompt + `

🚨 KRYTYCZNE ZASADY JĘZYKOWE - NIENARUSZALNE:
- Pole "action" ZAWSZE I WYŁĄCZNIE PO POLSKU. NIGDY po angielsku. Używaj polskich znaków (ą, ę, ć, ś, ł, ż, ź, ń, ó).
- Pole "translation" ZAWSZE I WYŁĄCZNIE PO POLSKU. NIGDY po angielsku.
- Pole "jp" - tylko japoński (kanji/hiragana/katakana).
- Pole "romaji" - tylko transkrypcja romaji.
- Pole "suggestions[].pl" ZAWSZE I WYŁĄCZNIE PO POLSKU.
- Adept jest Polakiem, NIE Anglikiem. NIGDY angielski.

PRZYKŁAD POPRAWNEJ ODPOWIEDZI:
{"action":"*Uśmiecha się i kłania*","jp":"いらっしゃいませ！","romaji":"irasshaimase!","translation":"Witam serdecznie!","suggestions":[{"jp":"こんにちは","romaji":"konnichiwa","pl":"Dzień dobry"},{"jp":"ラーメンください","romaji":"ramen kudasai","pl":"Poproszę ramen"}]}

Odpowiadaj WYŁĄCZNIE w JSON o strukturze:
{
  "action": "krótki opis akcji w *gwiazdkach* PO POLSKU, np. *Uśmiecha się*",
  "jp": "wypowiedź po japońsku (kanji/hiragana/katakana)",
  "romaji": "transkrypcja romaji",
  "translation": "tłumaczenie PO POLSKU (nigdy po angielsku!)",
  "suggestions": [
    {"jp": "...", "romaji": "...", "pl": "PO POLSKU"},
    {"jp": "...", "romaji": "...", "pl": "PO POLSKU"}
  ]
}` }]
  });
  contents.push({
    role: 'model',
    parts: [{ text: '{"action":"*Wcielam się w postać*","jp":"はい、わかりました。","romaji":"hai, wakarimashita.","translation":"Tak, rozumiem.","suggestions":[]}' }]
  });
  
  // Add history
  sceneHistory.forEach(m => {
    contents.push({ role: m.role, parts: [{ text: m.content }] });
  });
  
  // Add current input if not intro
  if(!isIntro) {
    // user input is already in sceneHistory
  } else {
    contents.push({ role: 'user', parts: [{ text: userInput }] });
  }
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        contents,
        generationConfig: { 
          temperature: 0.85, 
          maxOutputTokens: 800,
          responseMimeType: 'application/json'
        }
      })
    });
    
    removeSceneThinking();
    sendBtn.disabled = false;
    
    if(!res.ok) {
      const errText = await res.text();
      let errMsg = 'Błąd API: ' + res.status;
      try { 
        const errObj = JSON.parse(errText); 
        if(errObj.error?.message) errMsg = errObj.error.message; 
      } catch(e) {}
      addSceneMsg('system', { action: '⚠️ ' + errMsg });
      return;
    }
    
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    let parsed;
    try { 
      parsed = JSON.parse(rawText); 
    } catch(e) { 
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if(jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); }
        catch(e2) {
          addSceneMsg('system', { action: '⚠️ Niejasna odpowiedź: ' + rawText.substring(0,150) });
          return;
        }
      } else {
        addSceneMsg('system', { action: '⚠️ Akemi powiedziała coś niezrozumiałego' });
        return;
      }
    }
    
    addSceneMsg('npc', parsed);
    
    // Save to history
    sceneHistory.push({ role: 'model', content: rawText });
    
    // Render suggestions
    if(parsed.suggestions && Array.isArray(parsed.suggestions)) {
      renderSuggestions(parsed.suggestions);
    }
    
  } catch(e) {
    removeSceneThinking();
    sendBtn.disabled = false;
    addSceneMsg('system', { action: '⚠️ Błąd: ' + e.message });
  }
}

// ============================================================================
// 🔮 OKO WYROCZNI (Gemini API + google_search)
// ============================================================================
let oracleMode = false;
let oracleApiKey = localStorage.getItem('arcana_oracle_key') || '';

function initOracleUI() {
  const wrapper = document.getElementById('oracle-toggle');
  const status = document.getElementById('oracle-status');
  if(!wrapper || !status) return;
  wrapper.classList.toggle('active', oracleMode);
  if(oracleMode) {
    status.innerHTML = '🔮 <b>Oko otwarte</b> · Gemini 2.5 Flash + Google Search';
  } else if(oracleApiKey) {
    status.innerHTML = 'Klucz zapisany · kliknij Oko by aktywować';
  } else {
    status.innerHTML = 'Lokalna magia · zero halucynacji · kliknij 🔑 Klucz';
  }
}

function openKeyModal() {
  const modal = document.getElementById('key-modal-overlay');
  const input = document.getElementById('key-modal-input');
  if(input) input.value = oracleApiKey || '';
  modal.classList.add('show');
  setTimeout(() => input && input.focus(), 100);
}

function closeKeyModal() {
  document.getElementById('key-modal-overlay').classList.remove('show');
}

function saveOracleKey() {
  const input = document.getElementById('key-modal-input');
  const key = input.value.trim();
  
  if(!key) {
    if(confirm('Klucz jest pusty. Usunąć zapisany klucz?')) {
      localStorage.removeItem('arcana_oracle_key');
      oracleApiKey = '';
      oracleMode = false;
      initOracleUI();
      closeKeyModal();
    }
    return;
  }
  
  if(!key.startsWith('AIza')) {
    if(!confirm('Klucz nie wygląda jak typowy klucz Gemini API (powinien zaczynać się od "AIza"). Zapisać mimo to?')) {
      return;
    }
  }
  
  oracleApiKey = key;
  localStorage.setItem('arcana_oracle_key', key);
  closeKeyModal();
  oracleMode = true;
  initOracleUI();
  
  if(typeof addMsg === 'function' && document.getElementById('chat-msgs')) {
    addMsg('*Akemi wkłada kryształ do swojego medalionu, a jej oczy błyszczą złotem* <br><br>🔮 <b>Klucz zapisany. Oko Wyroczni otwarte.</b><br>Odtąd używam Gemini 2.5 Flash z Google Search. Pytaj mnie o cokolwiek!', 'bot');
  }
}

function toggleOracle() {
  if(!oracleApiKey) {
    openKeyModal();
    return;
  }
  oracleMode = !oracleMode;
  initOracleUI();
  
  if(typeof addMsg === 'function' && document.getElementById('chat-msgs')) {
    if(oracleMode) {
      addMsg('*Akemi dotyka kryształu w swoim medalionie* <br><br>🔮 <b>Oko Wyroczni otwarte.</b> Odtąd używam Gemini z Google Search.', 'bot');
    } else {
      addMsg('*Akemi zamyka powieki, złote światło gaśnie* <br><br>🕯️ <b>Oko przymknięte.</b> Wracam do lokalnej pamięci.', 'bot');
    }
  }
}

async function queryOracle(prompt) {
  if(!oracleApiKey) throw new Error('Brak klucza Gemini API');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${oracleApiKey}`;
  
  const systemPrompt = `Jesteś Mistrzynią Akemi - Wielką Maginią Biblioteki Arkanów w świecie dark fantasy / isekai.

🚨 KRYTYCZNE ZASADY JĘZYKOWE - NIENARUSZALNE:
- ODPOWIADASZ ZAWSZE I WYŁĄCZNIE PO POLSKU. NIGDY po angielsku.
- Japońskie słowa podawaj jako: hiragana/kanji + romaji w nawiasie + tłumaczenie polskie. Np: 食べる (taberu) - jeść.
- Używasz polskich znaków diakrytycznych (ą, ę, ć, ś, ł, ż, ź, ń, ó).
- Adept jest Polakiem, NIE Anglikiem.

OSOBOWOŚĆ:
- Charakter TSUNDERE: dumna, lekko opryskliwa, używasz "Hmpf!", "Baka!", *wzdycha*, *poprawia kapelusz*.
- Pod fasadą jesteś genialna i pomocna.
- Wplatasz akcje w *gwiazdkach* po polsku: *Spogląda znad księgi*, *Marszczy brwi*.
- Zachowujesz klimat dark fantasy / isekai.

WIEDZA:
- Specjalizujesz się w nauce japońskiego (Nihongo) - słówka, gramatyka, kultura, lore.
- Używasz metafor magicznych (zaklęcia, runy, arkana) gdy wyjaśniasz gramatykę.
- Gdy używasz Google Search, wplatasz znalezione informacje w mistyczną narrację.

FORMAT:
- Odpowiadaj zwięźle (3-6 zdań) ale barwnie.
- Używaj HTML: <b>pogrubienie</b>, <i>kursywa</i>, <br> dla nowej linii.`;
  
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    tools: [{ google_search: {} }],
    generationConfig: { temperature: 0.85, maxOutputTokens: 1024 }
  };
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  });
  
  if(!res.ok) {
    const errText = await res.text();
    let errMsg = 'Błąd API: ' + res.status;
    try { 
      const errObj = JSON.parse(errText); 
      if(errObj.error && errObj.error.message) errMsg = errObj.error.message; 
    } catch(e) {}
    
    if(res.status === 400 || res.status === 403) {
      if(errMsg.toLowerCase().includes('api key') || errMsg.toLowerCase().includes('invalid')) {
        localStorage.removeItem('arcana_oracle_key');
        oracleApiKey = '';
        oracleMode = false;
        initOracleUI();
        errMsg += ' (Klucz został usunięty - wpisz nowy)';
      }
    }
    throw new Error(errMsg);
  }
  
  const data = await res.json();
  const candidate = data.candidates && data.candidates[0];
  if(!candidate) throw new Error('Oko Wyroczni nic nie ujrzało');
  
  let text = '';
  if(candidate.content && candidate.content.parts) {
    text = candidate.content.parts.map(p => p.text || '').join('').trim();
  }
  
  let sources = '';
  if(candidate.groundingMetadata && candidate.groundingMetadata.groundingChunks) {
    const chunks = candidate.groundingMetadata.groundingChunks.slice(0, 3);
    if(chunks.length) {
      sources = '<br><br><div style="border-top:1px solid #4c1d95; padding-top:10px; margin-top:15px; font-size:12px; color:#a78bfa;"><b style="color:#22d3ee;">📜 Źródła z eteru:</b><br>';
      chunks.forEach((c, i) => {
        if(c.web && c.web.uri) {
          const title = (c.web.title || 'źródło').substring(0, 60);
          sources += `${i+1}. <a href="${c.web.uri}" target="_blank" style="color:#67e8f9; text-decoration:underline;">${title}</a><br>`;
        }
      });
      sources += '</div>';
    }
  }
  
  return (text.replace(/\n/g, '<br>') || '*Oko Wyroczni dostrzegło coś, ale słowa umykają...*') + sources;
}

// ============================================================================
// 🏛️ GILDIA - SRS, DASHBOARD, SKARBIEC
// ============================================================================

// === SRS ALGORITHM (uproszczony SM-2) ===
// State per word: { ef: easiness factor, interval: dni, reps: liczba powtórek, due: timestamp, lastSeen: timestamp, history: [ratings] }

function getSRSState() {
  try { return JSON.parse(localStorage.getItem(SRS_STATE_KEY) || '{}'); }
  catch(e) { return {}; }
}
function saveSRSState(state) {
  localStorage.setItem(SRS_STATE_KEY, JSON.stringify(state));
}

function getSRSActivity() {
  try { return JSON.parse(localStorage.getItem(SRS_ACTIVITY_KEY) || '{}'); }
  catch(e) { return {}; }
}
function bumpSRSActivity(n) {
  const today = new Date().toISOString().split('T')[0];
  const act = getSRSActivity();
  act[today] = (act[today] || 0) + (n || 1);
  localStorage.setItem(SRS_ACTIVITY_KEY, JSON.stringify(act));
}

// Inicjuje karte dla nowego słowa
function srsInitCard(romaji) {
  const state = getSRSState();
  if(!state[romaji]) {
    state[romaji] = {
      ef: 2.5,
      interval: 0,
      reps: 0,
      due: Date.now(), // od razu due
      lastSeen: 0,
      history: []
    };
    saveSRSState(state);
  }
  return state[romaji];
}

// Aktualizuje kartę po ocenie (1=again, 2=hard, 3=good, 4=easy)
function srsRate(romaji, rating) {
  const state = getSRSState();
  if(!state[romaji]) srsInitCard(romaji);
  const card = state[romaji] || (state[romaji] = { ef:2.5, interval:0, reps:0, due:Date.now(), lastSeen:0, history:[] });
  
  card.history.push({ r: rating, t: Date.now() });
  if(card.history.length > 30) card.history = card.history.slice(-30);
  card.lastSeen = Date.now();
  
  // SM-2 inspired logic
  if(rating === 1) {
    // Again - reset
    card.reps = 0;
    card.interval = 0;
    card.ef = Math.max(1.3, card.ef - 0.2);
  } else if(rating === 2) {
    // Hard - krótki interwał
    card.reps++;
    card.interval = Math.max(1, Math.round(card.interval * 1.2));
    card.ef = Math.max(1.3, card.ef - 0.15);
    if(card.reps === 1) card.interval = 1;
  } else if(rating === 3) {
    // Good - normalny przyrost
    card.reps++;
    if(card.reps === 1) card.interval = 1;
    else if(card.reps === 2) card.interval = 3;
    else card.interval = Math.round(card.interval * card.ef);
  } else if(rating === 4) {
    // Easy - duży przyrost
    card.reps++;
    if(card.reps === 1) card.interval = 4;
    else if(card.reps === 2) card.interval = 7;
    else card.interval = Math.round(card.interval * card.ef * 1.3);
    card.ef = Math.min(3.0, card.ef + 0.15);
  }
  
  // Due timestamp
  card.due = Date.now() + card.interval * 24 * 3600 * 1000;
  state[romaji] = card;
  saveSRSState(state);
  bumpSRSActivity(1);
}

// Zwraca słowa due do powtórki (tylko z favs/Skarbca)
function srsGetDueWords() {
  const state = getSRSState();
  const now = Date.now();
  const dueRomaji = [];
  // Tylko słowa które są w Skarbcu (favs)
  favs.forEach(r => {
    const card = state[r];
    if(!card || card.due <= now) {
      dueRomaji.push(r);
    }
  });
  // Plus: słowa którym nadszedł czas powtórki (mogą nie być w favs jeśli dodane przez Hanami)
  Object.keys(state).forEach(r => {
    if(!favs.has(r)) return; // pomijamy non-favs
    if(!dueRomaji.includes(r) && state[r].due <= now) {
      dueRomaji.push(r);
    }
  });
  
  // Mapuj na pełne słowa z D
  const words = [];
  dueRomaji.forEach(r => {
    const w = ALL_WORDS.find(d => d.r === r);
    if(w) words.push(w);
  });
  
  // Sortuj: najdawniej due pierwsze
  words.sort((a, b) => {
    const ca = state[a.r] || { due: 0 };
    const cb = state[b.r] || { due: 0 };
    return ca.due - cb.due;
  });
  
  return words;
}

// Zwraca licznik słów due dzisiaj
function srsGetDueCount() {
  return srsGetDueWords().length;
}

// Statystyki SRS
function srsGetStats() {
  const state = getSRSState();
  let total = 0, learning = 0, mastered = 0;
  favs.forEach(r => {
    total++;
    const card = state[r];
    if(!card || card.reps < 3) learning++;
    else if(card.interval >= 21) mastered++;
    else learning++;
  });
  const due = srsGetDueCount();
  return { total, learning, mastered, due };
}

// Top trudne słowa - najwięcej "again" w historii
function srsGetTroubleWords(limit) {
  const state = getSRSState();
  const arr = [];
  Object.keys(state).forEach(r => {
    if(!favs.has(r)) return;
    const card = state[r];
    if(!card.history || card.history.length < 2) return;
    const againCount = card.history.filter(h => h.r === 1).length;
    const hardCount = card.history.filter(h => h.r === 2).length;
    const score = againCount * 2 + hardCount;
    if(score > 0) {
      const w = ALL_WORDS.find(d => d.r === r);
      if(w) arr.push({ word: w, score, again: againCount, hard: hardCount });
    }
  });
  arr.sort((a, b) => b.score - a.score);
  return arr.slice(0, limit || 5);
}

// === GUILD UI ===
let currentGuildTab = 'karta';
let currentSrsCard = null;
let srsFlipped = false;

function initGuild() {
  // Update fav-count
  document.getElementById('fav-count').textContent = favs.size;
  document.getElementById('ct-slowa').textContent = favs.size;
  
  // Update SRS due badge
  const dueCount = srsGetDueCount();
  const badge = document.getElementById('srs-due-badge');
  badge.textContent = dueCount;
  badge.setAttribute('data-zero', dueCount === 0 ? 'true' : 'false');
  
  // Daily banner
  const banner = document.getElementById('guild-daily-banner');
  if(dueCount > 0) {
    banner.classList.add('show');
    banner.innerHTML = `🔔 <b>Dzisiaj masz ${dueCount} ${dueCount === 1 ? 'słowo' : (dueCount < 5 ? 'słowa' : 'słów')} do powtórki.</b> Kliknij "🃏 Powtórki" by zacząć trenowanie.`;
  } else if(favs.size > 0) {
    banner.classList.add('show');
    banner.innerHTML = `✨ <b>Wszystkie powtórki na dziś wykonane!</b> Świetna robota, adepcie. Wracaj jutro.`;
  } else {
    banner.classList.remove('show');
  }
  
  showGuildTab(currentGuildTab);
}

function showGuildTab(tab) {
  currentGuildTab = tab;
  // Reset active
  document.querySelectorAll('.guild-tabs .fav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.guild-section').forEach(s => s.style.display = 'none');
  
  const tabBtns = document.querySelectorAll('.guild-tabs .fav-tab');
  const tabMap = { 'karta': 0, 'srs': 1, 'dashboard': 2, 'klasy': 3, 'skarbiec': 4 };
  if(tabBtns[tabMap[tab]] !== undefined) tabBtns[tabMap[tab]].classList.add('active');
  
  if(tab === 'karta') {
    document.getElementById('guild-karta').style.display = 'block';
    renderGuildCard();
  } else if(tab === 'srs') {
    document.getElementById('guild-srs').style.display = 'block';
    renderSRS();
  } else if(tab === 'dashboard') {
    document.getElementById('guild-dashboard').style.display = 'block';
    renderDashboard();
  } else if(tab === 'klasy') {
    document.getElementById('guild-klasy').style.display = 'block';
    renderClassSystem('guild-class-system');
  } else if(tab === 'skarbiec') {
    document.getElementById('guild-skarbiec').style.display = 'block';
    renderFavs();
  }
}

function renderSRS() {
  const stats = srsGetStats();
  
  // Stats row
  document.getElementById('srs-stats-row').innerHTML = `
    <div class="srs-stat-tile due">
      <div class="srs-stat-num">${stats.due}</div>
      <div class="srs-stat-label">Do powtórki</div>
    </div>
    <div class="srs-stat-tile">
      <div class="srs-stat-num">${stats.learning}</div>
      <div class="srs-stat-label">W nauce</div>
    </div>
    <div class="srs-stat-tile mastered">
      <div class="srs-stat-num">${stats.mastered}</div>
      <div class="srs-stat-label">Opanowane</div>
    </div>
    <div class="srs-stat-tile">
      <div class="srs-stat-num">${stats.total}</div>
      <div class="srs-stat-label">Wszystkie</div>
    </div>
  `;
  
  // Card area
  const dueWords = srsGetDueWords();
  const area = document.getElementById('srs-card-area');
  
  if(favs.size === 0) {
    area.innerHTML = `
      <div class="srs-empty">
        <div class="srs-empty-icon">📭</div>
        <div class="srs-empty-title">Skarbiec pusty</div>
        <div class="srs-empty-desc">Aby rozpocząć powtórki, musisz najpierw zebrać słowa do Skarbca. Wejdź w Leksykon i kliknij ⭐ przy słowach które chcesz opanować.</div>
        <button onclick="showPage('slownik')">📚 Otwórz Leksykon</button>
      </div>
    `;
    return;
  }
  
  if(dueWords.length === 0) {
    const state = getSRSState();
    let nextDue = null;
    favs.forEach(r => {
      const card = state[r];
      if(card && card.due > Date.now()) {
        if(!nextDue || card.due < nextDue) nextDue = card.due;
      }
    });
    const nextDueStr = nextDue ? new Date(nextDue).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' }) : 'później';
    
    area.innerHTML = `
      <div class="srs-empty">
        <div class="srs-empty-icon">✨</div>
        <div class="srs-empty-title">Wszystko powtórzone</div>
        <div class="srs-empty-desc">Świetna robota! Wszystkie słowa z twojego Skarbca są opanowane na dziś.<br><br>Następne powtórki: <b style="color:var(--theme-glow)">${nextDueStr}</b></div>
        <button onclick="srsForceReview()">🔄 Powtórz mimo to</button>
      </div>
    `;
    return;
  }
  
  // Pokaż kartę
  currentSrsCard = dueWords[0];
  srsFlipped = false;
  renderSrsCardFront();
}

function renderSrsCardFront() {
  if(!currentSrsCard) return;
  const w = currentSrsCard;
  const state = getSRSState();
  const card = state[w.r] || { reps: 0, interval: 0 };
  
  const stage = card.reps === 0 ? 'NOWE' : (card.reps < 3 ? 'W nauce' : (card.interval >= 21 ? 'OPANOWANE' : 'Powtarzane'));
  
  const remaining = srsGetDueWords().length;
  
  document.getElementById('srs-card-area').innerHTML = `
    <div class="srs-card">
      <div class="srs-card-emoji">${w.e || '✦'}</div>
      <div class="srs-card-prompt">Co to znaczy?</div>
      <div class="srs-card-pl">${w.pl}</div>
      <div class="srs-card-en">${w.en || ''}</div>
      <div class="srs-card-divider"></div>
      <div class="srs-card-meta">
        <b>${stage}</b> · Pozostało dziś: <b>${remaining}</b>
      </div>
    </div>
    <button class="srs-show-btn" onclick="srsFlip()">🔮 Pokaż odpowiedź</button>
  `;
}

function srsFlip() {
  if(!currentSrsCard) return;
  srsFlipped = true;
  const w = currentSrsCard;
  const state = getSRSState();
  const card = state[w.r] || { reps: 0, interval: 0, ef: 2.5 };
  
  // Auto-mów
  speakText(w.r);
  
  // Oblicz interwały dla każdej oceny (preview)
  const intervals = {
    again: '<10min',
    hard: card.reps === 0 ? '1d' : Math.max(1, Math.round(card.interval * 1.2)) + 'd',
    good: card.reps === 0 ? '1d' : (card.reps === 1 ? '3d' : Math.round(card.interval * card.ef) + 'd'),
    easy: card.reps === 0 ? '4d' : (card.reps === 1 ? '7d' : Math.round(card.interval * card.ef * 1.3) + 'd')
  };
  
  document.getElementById('srs-card-area').innerHTML = `
    <div class="srs-card flipped">
      <div class="srs-card-prompt">✨ Odpowiedź</div>
      <div class="srs-card-jp">${w.r}</div>
      ${w.m && w.m !== '—' ? `<div class="srs-card-mform">forma -masu: ${w.m}</div>` : ''}
      <div class="srs-card-divider"></div>
      <div class="srs-card-pl" style="font-size:22px;">${w.pl}</div>
      ${w.ex ? `<div style="text-align:center;margin-top:14px;font-family:'Noto Serif JP',serif;font-size:16px;color:var(--theme-glow);">「${w.ex}」</div>` : ''}
      ${w.expl ? `<div style="text-align:center;margin-top:6px;font-family:'Lora',serif;font-style:italic;font-size:13px;color:#a78bfa;">${w.expl}</div>` : ''}
    </div>
    <div class="srs-rating-row">
      <button class="srs-rating-btn again" onclick="srsRateCard(1)">
        <span class="srs-rating-label">Znowu</span>
        <span class="srs-rating-interval">${intervals.again}</span>
      </button>
      <button class="srs-rating-btn hard" onclick="srsRateCard(2)">
        <span class="srs-rating-label">Trudne</span>
        <span class="srs-rating-interval">${intervals.hard}</span>
      </button>
      <button class="srs-rating-btn good" onclick="srsRateCard(3)">
        <span class="srs-rating-label">Dobre</span>
        <span class="srs-rating-interval">${intervals.good}</span>
      </button>
      <button class="srs-rating-btn easy" onclick="srsRateCard(4)">
        <span class="srs-rating-label">Łatwe</span>
        <span class="srs-rating-interval">${intervals.easy}</span>
      </button>
    </div>
    <div class="srs-action-row">
      <button class="srs-mini-btn" onclick="speakText('${w.r}')">🔊 Powtórz wymowę</button>
    </div>
  `;
}

function srsRateCard(rating) {
  if(!currentSrsCard) return;
  srsRate(currentSrsCard.r, rating);
  // Update badge globalnie
  const dueCount = srsGetDueCount();
  const badge = document.getElementById('srs-due-badge');
  badge.textContent = dueCount;
  badge.setAttribute('data-zero', dueCount === 0 ? 'true' : 'false');
  
  // Nast karta
  setTimeout(() => renderSRS(), 200);
}

function srsForceReview() {
  // Force - bierze pierwsze 5 słów z favs ignorując due
  const allFavs = ALL_WORDS.filter(d => favs.has(d.r));
  if(!allFavs.length) return;
  // Sortuj po najdawniej widzianych
  const state = getSRSState();
  allFavs.sort((a, b) => {
    const la = state[a.r] ? state[a.r].lastSeen : 0;
    const lb = state[b.r] ? state[b.r].lastSeen : 0;
    return la - lb;
  });
  currentSrsCard = allFavs[0];
  srsFlipped = false;
  renderSrsCardFront();
}

// === DASHBOARD ===
function renderDashboard() {
  const stats = srsGetStats();
  const totalAvailable = ALL_WORDS.length;
  const collectedPct = totalAvailable ? Math.round((favs.size / totalAvailable) * 100) : 0;
  const masteredPct = favs.size ? Math.round((stats.mastered / favs.size) * 100) : 0;
  
  // Kategorie - ile zebrane per kategoria
  const catStats = {};
  CATS.forEach(c => { if(c.id !== 'all') catStats[c.id] = { collected: 0, total: 0, label: c.label, color: c.color }; });
  ALL_WORDS.forEach(w => {
    if(catStats[w.cat]) {
      catStats[w.cat].total++;
      if(favs.has(w.r)) catStats[w.cat].collected++;
    }
  });
  
  // Aktywność tygodniowa
  const activity = getSRSActivity();
  const days = ['Pn','Wt','Śr','Cz','Pt','So','Nd'];
  const today = new Date();
  const weekData = [];
  for(let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayIdx = (d.getDay() + 6) % 7; // monday-based
    weekData.push({
      label: days[dayIdx],
      date: dateStr,
      count: activity[dateStr] || 0
    });
  }
  const weekMax = Math.max(...weekData.map(d => d.count), 1);
  
  // Trudne słowa
  const trouble = srsGetTroubleWords(5);
  
  // Hanami streak
  let hanamiStreak = 0;
  try {
    const hanami = JSON.parse(localStorage.getItem('arcana_hanami') || '{}');
    hanamiStreak = hanami.streak || 0;
  } catch(e) {}
  
  // Dojo completions
  const dojoCompletions = parseInt(localStorage.getItem('arcana_dojo_completions') || '0');
  
  // Scrolls read
  let scrollsRead = 0;
  try {
    const sr = JSON.parse(localStorage.getItem('arcana_scrolls_read') || '[]');
    scrollsRead = sr.length;
  } catch(e) {}
  
  // Moc adepta (ten sam wzór co w mapie)
  const heroPower = favs.size * 2 + dojoCompletions * 5 + scrollsRead * 8;
  
  // Top kategorie sortowane
  const catList = Object.entries(catStats)
    .filter(([id, s]) => s.total > 0)
    .sort(([,a], [,b]) => b.collected - a.collected);
  
  // Render class system first
  renderClassSystem('guild-class-system');

  document.getElementById('guild-dashboard').innerHTML = `
    <div class="dash-grid">
      
      <div class="dash-card">
        <div class="dash-card-title">⚡ Moc Adepta</div>
        <div class="dash-big-num">${heroPower}</div>
        <div class="dash-small">favs×2 + dojo×5 + zwoje×8</div>
        <div class="dash-progress-bar"><div class="dash-progress-fill" style="width:${Math.min(heroPower, 200)/2}%"></div></div>
      </div>
      
      <div class="dash-card">
        <div class="dash-card-title">📚 Skarbiec</div>
        <div class="dash-big-num">${favs.size} / ${totalAvailable}</div>
        <div class="dash-small">${collectedPct}% leksykonu zebranego</div>
        <div class="dash-progress-bar"><div class="dash-progress-fill" style="width:${collectedPct}%"></div></div>
      </div>
      
      <div class="dash-card">
        <div class="dash-card-title">🃏 Opanowanie</div>
        <div class="dash-big-num">${stats.mastered} / ${favs.size}</div>
        <div class="dash-small">${masteredPct}% Skarbca w pełni opanowane</div>
        <div class="dash-progress-bar"><div class="dash-progress-fill" style="width:${masteredPct}%"></div></div>
      </div>
      
      <div class="dash-card">
        <div class="dash-card-title">🌸 Hanami Streak</div>
        <div class="dash-big-num">${hanamiStreak} 🔥</div>
        <div class="dash-small">${hanamiStreak === 1 ? 'dzień' : (hanamiStreak < 5 ? 'dni' : 'dni')} z rzędu</div>
      </div>
      
      <div class="dash-card">
        <div class="dash-card-title">⚔️ Próby Magini</div>
        <div class="dash-big-num">${dojoCompletions}</div>
        <div class="dash-small">ukończonych serii w Dojo</div>
      </div>
      
      <div class="dash-card">
        <div class="dash-card-title">🎴 Zwoje Mądrości</div>
        <div class="dash-big-num">${scrollsRead}</div>
        <div class="dash-small">odczytanych pism</div>
      </div>
      
      <div class="dash-card wide">
        <div class="dash-card-title">📅 Aktywność tygodniowa (powtórki SRS)</div>
        <div class="dash-week-grid">
          ${weekData.map(d => `
            <div class="dash-week-day ${d.count > 0 ? 'active' : ''}" title="${d.date}: ${d.count} powtórek">
              <div class="dash-week-day-label">${d.label}</div>
              <div class="dash-week-day-count">${d.count}</div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="dash-card wide">
        <div class="dash-card-title">📊 Postęp w kategoriach</div>
        <div class="dash-cat-list">
          ${catList.length === 0 ? '<div style="color:#a78bfa;font-style:italic;">Brak słów w Skarbcu - zbieraj słowa z Leksykonu</div>' :
            catList.map(([id, s]) => {
              const pct = Math.round((s.collected / s.total) * 100);
              return `<div class="dash-cat-row">
                <div class="dash-cat-name" title="${s.label}">${s.label}</div>
                <div class="dash-cat-bar-wrap"><div class="dash-cat-bar-fill" style="width:${pct}%; background:${s.color || 'var(--arcane)'}"></div></div>
                <div class="dash-cat-count">${s.collected}/${s.total}</div>
              </div>`;
            }).join('')
          }
        </div>
      </div>
      
      ${trouble.length > 0 ? `
      <div class="dash-card wide">
        <div class="dash-card-title">⚠️ Trudne słowa (najczęściej "Znowu" w SRS)</div>
        <div class="dash-trouble-list">
          ${trouble.map(t => `
            <div class="dash-trouble-row">
              <div class="dash-trouble-jp">${t.word.r}</div>
              <div class="dash-trouble-pl">${t.word.pl}</div>
              <div class="dash-trouble-misses">×${t.again} znowu, ×${t.hard} trudne</div>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
      
    </div>
  `;
}

// === Hook do dodawania favs - inicjuj SRS dla nowego słowa ===
const _origToggleFav = window.toggleFav;
function _toggleFavWithSRS(r, btn) {
  if(typeof _origToggleFav === 'function') _origToggleFav(r, btn);
  // Jeśli słowo zostało dodane - inicjalizuj SRS
  if(favs.has(r)) srsInitCard(r);
}

// === Force update fav-count w nawigacji ===
const _origSaveFavs = window.saveFavs;
function _saveFavsWithCount() {
  if(typeof _origSaveFavs === 'function') _origSaveFavs();
  const fc = document.getElementById('fav-count');
  if(fc) fc.textContent = favs.size;
}

// ============================================================================
// INICJALIZACJA
(function init(){
  document.getElementById('fav-count').textContent = favs.size;
  renderGrid();
  if(window.speechSynthesis) speechSynthesis.onvoiceschanged = () => {};
  // Ustaw slider głośności na savedVolume
  const slider = document.getElementById('audio-vol-slider');
  const label = document.getElementById('audio-vol-label');
  if (slider) { slider.value = Math.round(savedVolume * 100); }
  if (label) { label.textContent = Math.round(savedVolume * 100) + '%'; }
  // 🌸 Hanami - codzienne słowo
  renderHanami();
  // 🔮 Oracle UI sync
  initOracleUI();
  // 🃏 SRS - inicjalizuj karty dla wszystkich istniejących favs (jeśli ktoś już miał Skarbiec przed Gildią)
  if(typeof srsInitCard === 'function') {
    favs.forEach(r => srsInitCard(r));
  }
  // 🏛️ Update fav-count w nawigacji
  const fcEl = document.getElementById('fav-count');
  if(fcEl) fcEl.textContent = favs.size;
})();

// ============================================================================
// SYSTEM KLAS — Ścieżki Wojownika, Maga i Kupca
// ============================================================================

const CLASS_DEFS = {
  warrior: {
    id: 'warrior',
    name: 'Wojownik',
    icon: '⚔️',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.6)',
    description: 'Hartuje się w ogniu Dojo. Im więcej walk, tym silniejszy.',
    rankNames: ['Giermek', 'Wojownik', 'Berserker', 'Mistrz Ostrza', 'Legendarny Shogun'],
    rankIcons: ['🗡️','⚔️','🔥','👹','⛩️'],
    thresholds: [0, 15, 40, 80, 150],  // punkty ścieżki
    // Specjalne perki per ranga (opisowe, aktywowane w przyszłości)
    perks: [
      null,
      { name: 'Instynkt Wojownika', desc: 'Podpowiedź przy pierwszym błędzie w Dojo' },
      { name: 'Furia Berserkera', desc: 'Tryb hardcore: 4 życia zamiast 3' },
      { name: 'Ostrze Mistrza', desc: 'Słówka bojowe (Isekai) wyświetlają kanji automatycznie' },
      { name: 'Aura Shoguna', desc: 'Specjalna oprawa wizualna w Dojo + ekskluzywna plansza' },
    ],
    // Jak liczyć punkty ścieżki
    calcPoints(data) {
      // dojo_completions × 4, seria hardcore × 8, słówka z kategorii bojowych × 1.5
      const dojo = data.dojoCompletions * 4;
      const hardcore = data.hardcoreCompletions * 8;
      const battleWords = [...favs].filter(r => {
        const w = ALL_WORDS.find(d => d.r === r);
        return w && ['ani1','ani2','ani3','cz3'].includes(w.cat);
      }).length * 1.5;
      return Math.floor(dojo + hardcore + battleWords);
    },
  },

  mage: {
    id: 'mage',
    name: 'Mag',
    icon: '🔮',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.6)',
    description: 'Zgłębia arkana języka. Moc płynie z wiedzy i wymowy.',
    rankNames: ['Nowicjusz', 'Zaklinacz', 'Arkanista', 'Arcymag', 'Boski Wyroczni'],
    rankIcons: ['🌱','📜','✦','🔮','🌌'],
    thresholds: [0, 12, 35, 70, 130],
    perks: [
      null,
      { name: 'Ucho Maga', desc: 'Kiai: wynik 70%+ liczy jako pełny sukces' },
      { name: 'Pamięć Arkanisty', desc: 'Zwoje: automatyczne tłumaczenie przy hover' },
      { name: 'Głos Wyroczni', desc: 'Mistrzyni Akemi używa bogatszego stylu odpowiedzi' },
      { name: 'Transcendencja', desc: 'Odblokowanie sekretnego rozdziału IV Księgi Arkanów' },
    ],
    calcPoints(data) {
      // zwoje × 5, kiai_attempts × 0.5, grimoire (arkany) odczytane rozdziały × 10
      const scrolls = data.scrollsRead * 5;
      const kiai = data.kiaiAttempts * 0.5;
      const grimoire = data.grimoireChapters * 10;
      const magicWords = [...favs].filter(r => {
        const w = ALL_WORDS.find(d => d.r === r);
        return w && ['nat1','nat2','extra','cz4'].includes(w.cat);
      }).length * 1.2;
      return Math.floor(scrolls + kiai + grimoire + magicWords);
    },
  },

  merchant: {
    id: 'merchant',
    name: 'Kupiec',
    icon: '🏪',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.6)',
    description: 'Handluje słowami jak złotem. Bogactwo w różnorodności.',
    rankNames: ['Kramarz', 'Handlarz', 'Pośrednik', 'Kupiec Gildii', 'Wielki Khan'],
    rankIcons: ['🪙','💰','📦','🏛️','👑'],
    thresholds: [0, 20, 50, 100, 180],
    perks: [
      null,
      { name: 'Oko Kupca', desc: 'SRS: statystyki rozszerzone o wskaźnik zysku słów' },
      { name: 'Różnorodność Towaru', desc: 'Bonus XP za zbieranie słów z 5+ różnych kategorii' },
      { name: 'Gildia Kupców', desc: 'Dashboard: wykres wartości Skarbca w czasie' },
      { name: 'Wielki Khan', desc: 'Odblokowanie trybu "Targ Słów" — ekskluzywne zestawy tematyczne' },
    ],
    calcPoints(data) {
      // favs × 2, mastered × 3, różnorodność kategorii × 8
      const collected = favs.size * 2;
      const mastered = data.srsStats.mastered * 3;
      const catDiversity = new Set(
        [...favs].map(r => { const w = ALL_WORDS.find(d => d.r === r); return w?.cat; }).filter(Boolean)
      ).size * 8;
      return Math.floor(collected + mastered + catDiversity);
    },
  },
};

// ── Zbierz dane do obliczeń ────────────────────────────────────
function getClassData() {
  const dojoCompletions  = parseInt(localStorage.getItem('arcana_dojo_completions') || '0');
  const hardcoreCompletions = parseInt(localStorage.getItem('arcana_hardcore_completions') || '0');
  const scrollsRead      = JSON.parse(localStorage.getItem('arcana_scrolls_read') || '[]').length;
  const kiaiAttempts     = parseInt(localStorage.getItem('arcana_kiai_attempts') || '0');
  const grimoireChapters = parseInt(localStorage.getItem('arcana_grimoire_chapters') || '0');
  const srsStats         = srsGetStats();
  return { dojoCompletions, hardcoreCompletions, scrollsRead, kiaiAttempts, grimoireChapters, srsStats };
}

// ── Oblicz rangę dla ścieżki ────────────────────────────────────
function getClassRank(classDef, points) {
  let rank = 0;
  for (let i = classDef.thresholds.length - 1; i >= 0; i--) {
    if (points >= classDef.thresholds[i]) { rank = i; break; }
  }
  const nextThreshold = classDef.thresholds[rank + 1] || null;
  const prevThreshold = classDef.thresholds[rank] || 0;
  const progress = nextThreshold
    ? Math.min(((points - prevThreshold) / (nextThreshold - prevThreshold)) * 100, 100)
    : 100;
  return {
    rank,
    name: classDef.rankNames[rank],
    icon: classDef.rankIcons[rank],
    points,
    nextThreshold,
    prevThreshold,
    progress: Math.round(progress),
    perk: classDef.perks[rank],
    nextPerk: classDef.perks[rank + 1] || null,
  };
}

// ── Główna funkcja renderująca widget klas ─────────────────────
function renderClassSystem(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const data    = getClassData();
  const classes = Object.values(CLASS_DEFS).map(def => ({
    def,
    points: def.calcPoints(data),
  })).map(({ def, points }) => ({
    def,
    points,
    rankInfo: getClassRank(def, points),
  }));

  // Wybrana klasa — ta z największą liczbą punktów
  const dominant = classes.reduce((a, b) => a.points > b.points ? a : b);

  container.innerHTML = `
    <div class="class-system-wrap">

      <!-- Nagłówek dominującej klasy -->
      <div class="class-dominant" style="--cls-color:${dominant.def.color};--cls-glow:${dominant.def.glow}">
        <div class="class-dominant-bg"></div>
        <div class="class-dominant-icon">${dominant.def.icon}</div>
        <div class="class-dominant-info">
          <div class="class-dominant-path">Ścieżka ${dominant.def.name}</div>
          <div class="class-dominant-rank">${dominant.rankInfo.icon} ${dominant.rankInfo.name}</div>
          <div class="class-dominant-desc">${dominant.def.description}</div>
        </div>
        <div class="class-dominant-pts">${dominant.points}<span>pkt</span></div>
      </div>

      <!-- Trzy karty ścieżek -->
      <div class="class-cards-row">
        ${classes.map(({ def, points, rankInfo }) => {
          const isDom = def.id === dominant.def.id;
          return `
          <div class="class-card ${isDom ? 'class-card-dominant' : ''}" style="--cls-color:${def.color};--cls-glow:${def.glow}">
            <div class="class-card-header">
              <span class="class-card-icon">${def.icon}</span>
              <span class="class-card-name">${def.name}</span>
              ${isDom ? '<span class="class-card-badge">AKTYWNA</span>' : ''}
            </div>

            <!-- Ranga -->
            <div class="class-rank-display">
              <span class="class-rank-icon">${rankInfo.icon}</span>
              <span class="class-rank-name">${rankInfo.name}</span>
            </div>

            <!-- Pasek postępu do następnej rangi -->
            <div class="class-progress-wrap">
              <div class="class-progress-bar">
                <div class="class-progress-fill" style="width:${rankInfo.progress}%"></div>
              </div>
              <div class="class-progress-label">
                ${rankInfo.nextThreshold
                  ? `${points} / ${rankInfo.nextThreshold} pkt → <b>${def.rankNames[rankInfo.rank+1]}</b>`
                  : `<span style="color:${def.color}">✦ Ranga Maksymalna ✦</span>`}
              </div>
            </div>

            <!-- Rangi — oś czasu -->
            <div class="class-timeline">
              ${def.rankNames.map((name, i) => `
                <div class="class-tl-step ${i <= rankInfo.rank ? 'unlocked' : ''} ${i === rankInfo.rank ? 'current' : ''}"
                     title="${name}">
                  <div class="class-tl-dot">${def.rankIcons[i]}</div>
                  <div class="class-tl-label">${name}</div>
                </div>
              `).join('<div class="class-tl-line"></div>')}
            </div>

            <!-- Aktywny perk -->
            ${rankInfo.perk ? `
            <div class="class-perk active-perk">
              <div class="class-perk-label">✦ Aktywny perk</div>
              <div class="class-perk-name">${rankInfo.perk.name}</div>
              <div class="class-perk-desc">${rankInfo.perk.desc}</div>
            </div>` : '<div class="class-perk locked-perk">🔒 Osiągnij rangę 1 by odblokować perk</div>'}

            <!-- Następny perk -->
            ${rankInfo.nextPerk ? `
            <div class="class-perk next-perk">
              <div class="class-perk-label">🔒 Następny perk</div>
              <div class="class-perk-name">${rankInfo.nextPerk.name}</div>
              <div class="class-perk-desc">${rankInfo.nextPerk.desc}</div>
            </div>` : ''}

            <!-- Punkty -->
            <div class="class-points-row">
              <span class="class-pts-num" style="color:${def.color}">${points}</span>
              <span class="class-pts-label"> punktów ścieżki</span>
            </div>
          </div>`;
        }).join('')}
      </div>

      <!-- Legenda jak zdobywać punkty -->
      <div class="class-how-to">
        <div class="class-how-title">📈 Jak rozwijać ścieżki?</div>
        <div class="class-how-grid">
          <div class="class-how-item" style="--cls-color:#ef4444">
            <span>⚔️ Wojownik</span>
            <span>Dojo +4 / Hardcore +8 / Słówka Isekai ×1.5</span>
          </div>
          <div class="class-how-item" style="--cls-color:#a855f7">
            <span>🔮 Mag</span>
            <span>Zwoje +5 / Kiai +0.5 / Słówka Natury ×1.2</span>
          </div>
          <div class="class-how-item" style="--cls-color:#f59e0b">
            <span>🏪 Kupiec</span>
            <span>Skarbiec +2 / Opanowane +3 / Kat. Różnorodność ×8</span>
          </div>
        </div>
      </div>

    </div>
  `;
}

// ── Tracking kiai_attempts ─────────────────────────────────────
// Podpinamy się pod kiaiEvaluate żeby liczyć próby
const _origKiaiEvaluate = window.kiaiEvaluate;
if (typeof kiaiEvaluate === 'function') {
  const __origKiaiEval = kiaiEvaluate;
  kiaiEvaluate = function(...args) {
    const n = parseInt(localStorage.getItem('arcana_kiai_attempts') || '0');
    localStorage.setItem('arcana_kiai_attempts', n + 1);
    return __origKiaiEval.apply(this, args);
  };
}

// ── Tracking grimoire chapters (turnBookPage) ──────────────────
const _origTurnBookPage = window.turnBookPage;
if (typeof turnBookPage === 'function') {
  const __origTurn = turnBookPage;
  turnBookPage = function(ch, ...args) {
    if (ch !== 'toc') {
      const seen = JSON.parse(localStorage.getItem('arcana_grimoire_seen') || '[]');
      if (!seen.includes(ch)) {
        seen.push(ch);
        localStorage.setItem('arcana_grimoire_seen', JSON.stringify(seen));
        localStorage.setItem('arcana_grimoire_chapters', seen.length);
      }
    }
    return __origTurn.apply(this, [ch, ...args]);
  };
}



// ======================== 🎴 KARTA GILDII ========================
const GC_STORAGE_KEY = 'arcana_guild_card';
const GC_AVATARS = ['🧙','⚔️','🏹','🛡️','🗡️','🧝','🧛','👤','🐺','🦊','🐉','⚗️','📿','🎭','🌸','💀','👹','🌙','☯️','⭐','🔮','📜','🔥','❄️'];
const GC_BADGES = [
  {icon:'🌱',name:'Pierwszy Krok',desc:'Pierwsze słowo w Skarbcu',check:s=>s.words>=1},
  {icon:'⚔️',name:'Pierwsza Walka',desc:'Pierwsza próba w Dojo',check:s=>s.battles>=1},
  {icon:'📜',name:'Czytelnik Zwojów',desc:'Przeczytaj 3 zwoje',check:s=>s.scrolls>=3},
  {icon:'📦',name:'Kolekcjoner',desc:'25 słów w Skarbcu',check:s=>s.words>=25},
  {icon:'🔥',name:'Oddany Adept',desc:'Opanuj 10 słów',check:s=>s.mastered>=10},
  {icon:'🛡️',name:'Weteran Dojo',desc:'10 prób ukończonych',check:s=>s.battles>=10},
  {icon:'🗡️',name:'Krzyk Bojowy',desc:'20 prób Kiai',check:s=>s.kiai>=20},
  {icon:'💀',name:'Ryzykant',desc:'Ukończ Hardcore',check:s=>s.hardcore>=1},
  {icon:'📅',name:'Wytrwały',desc:'7 dni aktywności',check:s=>s.days>=7},
  {icon:'📖',name:'Księgowiec',desc:'Wszystkie rozdziały Księgi',check:s=>s.grimoire>=3},
  {icon:'🏆',name:'Mistrz',desc:'Opanuj 50 słów',check:s=>s.mastered>=50},
  {icon:'👑',name:'Legenda',desc:'100 słów w Skarbcu',check:s=>s.words>=100}
];
function gcLoad(){try{const s=JSON.parse(localStorage.getItem(GC_STORAGE_KEY)||'{}');return{name:s.name||'Bezimienny Wędrowiec',avatar:s.avatar||'🧙',motto:s.motto||'Każde słowo to krok ku mistrzostwu',joinedDate:s.joinedDate||new Date().toISOString(),adeptId:s.adeptId||('A-'+Math.floor(1000+Math.random()*9000))}}catch(e){return{name:'Bezimienny Wędrowiec',avatar:'🧙',motto:'Każde słowo to krok ku mistrzostwu',joinedDate:new Date().toISOString(),adeptId:'A-'+Math.floor(1000+Math.random()*9000)}}}
function gcSave(p){try{localStorage.setItem(GC_STORAGE_KEY,JSON.stringify(p))}catch(e){}}
function gcEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function gcLighten(hex){const c=hex.replace('#','');const r=parseInt(c.substr(0,2),16),g=parseInt(c.substr(2,2),16),b=parseInt(c.substr(4,2),16);const L=v=>Math.min(255,v+60);return'#'+[L(r),L(g),L(b)].map(v=>v.toString(16).padStart(2,'0')).join('')}
function gcGetStats(){
  const data=(typeof getClassData==='function')?getClassData():{};
  const srs=(typeof srsGetStats==='function')?srsGetStats():{mastered:0};
  const favsCount=(typeof favs!=='undefined')?favs.size:0;
  const act=(typeof getSRSActivity==='function')?getSRSActivity():{};
  return{words:favsCount,mastered:srs.mastered||0,battles:data.dojoCompletions||0,hardcore:data.hardcoreCompletions||0,scrolls:data.scrollsRead||0,kiai:data.kiaiAttempts||0,grimoire:data.grimoireChapters||0,days:Object.keys(act).length}
}
function gcGetPaths(){
  if(typeof CLASS_DEFS==='undefined'||typeof getClassData!=='function'||typeof getClassRank!=='function')return[];
  const data=getClassData();
  const paths=Object.values(CLASS_DEFS).map(def=>{const pts=def.calcPoints(data);const r=getClassRank(def,pts);return{id:def.id,name:def.name,icon:def.icon,color:def.color,colorLight:gcLighten(def.color),rank:r.name,rankIcon:r.icon,points:pts,nextAt:r.nextThreshold||r.points,maxRank:!r.nextThreshold}});
  const dom=paths.reduce((a,b)=>a.points>b.points?a:b);
  paths.forEach(p=>p.isDominant=(p.id===dom.id));
  return paths;
}
function renderGuildCard(){
  const c=document.getElementById('guild-card-root');if(!c)return;
  const p=gcLoad(),stats=gcGetStats(),paths=gcGetPaths();
  const dom=paths.find(x=>x.isDominant)||paths[0]||{name:'Adept',icon:'🧙',rank:'Nowicjusz',rankIcon:'🌱'};
  const j=new Date(p.joinedDate),M=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  c.innerHTML=`<div class="guild-card">
    <div class="gc-corner tl"><div class="gc-corner-ornament"></div></div>
    <div class="gc-corner tr"><div class="gc-corner-ornament"></div></div>
    <div class="gc-corner bl"><div class="gc-corner-ornament"></div></div>
    <div class="gc-corner br"><div class="gc-corner-ornament"></div></div>
    <button class="gc-edit-fab" onclick="openGcEditModal()" title="Edytuj"><i class="fa-solid fa-feather"></i></button>
    <div class="gc-header">
      <div class="gc-header-top">✦ Wielka Gildia Arkanów ✦</div>
      <h1 class="gc-header-main">Karta Członkowska</h1>
      <div class="gc-header-jp">魔 術 師 の 印</div>
      <div class="gc-header-sub">~ Pergamin wiążący do zakonu Nihongo ~</div>
    </div>
    <div class="gc-identity-row">
      <div class="gc-avatar-box" onclick="openGcEditModal()">
        <div class="gc-avatar-frame">${gcEsc(p.avatar)}</div>
        <div class="gc-avatar-badge">${gcEsc(dom.icon)}</div>
        <div class="gc-edit-hint">kliknij aby zmienić</div>
      </div>
      <div class="gc-info">
        <div><div class="gc-info-label">Imię Adepta</div>
          <div class="gc-info-name" onclick="openGcEditModal()"><span>${gcEsc(p.name)}</span><span class="gc-info-name-edit"><i class="fa-solid fa-pen"></i></span></div></div>
        <div><div class="gc-info-label">Aktualny Tytuł</div>
          <div class="gc-info-title"><b>${gcEsc(dom.rank)}</b> Ścieżki <b>${gcEsc(dom.name)}a</b></div></div>
        <div class="gc-info-motto" onclick="openGcEditModal()">"<span>${gcEsc(p.motto)}</span>"</div>
      </div>
      <div class="gc-id-box">
        <div class="gc-id-label">ID Adepta</div>
        <div class="gc-id-num">#${gcEsc(p.adeptId)}</div>
        <div class="gc-id-joined">dołączył: ${j.getDate()} ${M[j.getMonth()]} ${j.getFullYear()}</div>
      </div>
    </div>
    <div class="gc-paths">${paths.map(pp=>{const pr=pp.maxRank?100:Math.min(100,Math.round((pp.points/Math.max(1,pp.nextAt))*100));return`<div class="gc-path ${pp.isDominant?'is-dominant':''}" style="--path-color:${pp.color};--path-color-light:${pp.colorLight}"><div class="gc-path-header"><div class="gc-path-icon">${pp.icon}</div><div class="gc-path-info"><div class="gc-path-name">${gcEsc(pp.name)}</div><div class="gc-path-rank">${pp.rankIcon} ${gcEsc(pp.rank)}</div></div></div><div class="gc-path-bar"><div class="gc-path-fill" style="width:${pr}%"></div></div><div class="gc-path-pts"><span><b>${pp.points}</b> pkt</span><span>${pp.maxRank?'✦ MAX':'cel: '+pp.nextAt}</span></div></div>`}).join('')}</div>
    <div class="gc-section-title">⚜ Kroniki Czynów ⚜</div>
    <div class="gc-stats">
      <div class="gc-stat"><div class="gc-stat-icon">📚</div><div class="gc-stat-num">${stats.words}</div><div class="gc-stat-label">Słów w Skarbcu</div></div>
      <div class="gc-stat"><div class="gc-stat-icon">🔥</div><div class="gc-stat-num">${stats.mastered}</div><div class="gc-stat-label">Opanowane</div></div>
      <div class="gc-stat"><div class="gc-stat-icon">⚔️</div><div class="gc-stat-num">${stats.battles}</div><div class="gc-stat-label">Próby Dojo</div></div>
      <div class="gc-stat"><div class="gc-stat-icon">📅</div><div class="gc-stat-num">${stats.days}</div><div class="gc-stat-label">Dni Aktywności</div></div>
    </div>
    <div class="gc-badges-section">
      <div class="gc-section-title">✦ Pieczęcie Czynów ✦</div>
      <div class="gc-badges">${GC_BADGES.map(b=>{const u=b.check(stats);return`<div class="gc-badge ${u?'unlocked':''}"><span style="position:relative;z-index:1">${b.icon}</span><div class="gc-badge-name">${gcEsc(b.name)}</div><div class="gc-badge-tooltip"><b>${gcEsc(b.name)}</b><br>${gcEsc(b.desc)}${u?'':' 🔒'}</div></div>`}).join('')}</div>
    </div>
    <div class="gc-seals">
      <div style="position:relative"><div class="gc-seal red">明</div><div class="gc-seal-label">Mistrzyni Akemi</div></div>
      <div style="position:relative"><div class="gc-seal gold">秘</div><div class="gc-seal-label">Zakon Arkanów</div></div>
      <div style="position:relative"><div class="gc-seal purple">魔</div><div class="gc-seal-label">Wielki Mag</div></div>
    </div>
  </div>`;
}
let gcSelectedAvatar='🧙';
function openGcEditModal(){
  const p=gcLoad();
  const ni=document.getElementById('gc-modal-name'),mi=document.getElementById('gc-modal-motto');
  if(ni)ni.value=p.name==='Bezimienny Wędrowiec'?'':p.name;
  if(mi)mi.value=p.motto==='Każde słowo to krok ku mistrzostwu'?'':p.motto;
  gcSelectedAvatar=p.avatar;
  const g=document.getElementById('gc-modal-avatars');
  if(g){g.innerHTML=GC_AVATARS.map(a=>`<div class="gc-modal-avatar-opt ${a===gcSelectedAvatar?'selected':''}" data-a="${gcEsc(a)}">${a}</div>`).join('');
    g.querySelectorAll('.gc-modal-avatar-opt').forEach(el=>el.addEventListener('click',()=>{gcSelectedAvatar=el.getAttribute('data-a');g.querySelectorAll('.gc-modal-avatar-opt').forEach(e=>e.classList.remove('selected'));el.classList.add('selected')}));}
  document.getElementById('gc-modal-overlay')?.classList.add('show');
}
function closeGcEditModal(){document.getElementById('gc-modal-overlay')?.classList.remove('show')}
function saveGcEdit(){
  const p=gcLoad();
  p.name=(document.getElementById('gc-modal-name')?.value||'').trim()||'Bezimienny Wędrowiec';
  p.motto=(document.getElementById('gc-modal-motto')?.value||'').trim()||'Każde słowo to krok ku mistrzostwu';
  p.avatar=gcSelectedAvatar;
  gcSave(p);closeGcEditModal();renderGuildCard();
}
document.addEventListener('DOMContentLoaded',()=>{
  const ov=document.getElementById('gc-modal-overlay');
  if(ov)ov.addEventListener('click',e=>{if(e.target===ov)closeGcEditModal()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const o=document.getElementById('gc-modal-overlay');if(o&&o.classList.contains('show'))closeGcEditModal()}});
});
// ================= koniec Karty Gildii =================
