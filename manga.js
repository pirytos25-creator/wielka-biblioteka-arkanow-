// ==============================================================
// MANGA.JS — Tryb Manga dla Leksykonu  (v2 – sceny per słówko)
// ==============================================================

let mangaMode = false;

// ── Kolory kategorii ──────────────────────────────────────────
const CAT_COLORS = {
  cz1:'#22c55e', cz2:'#14b8a6', cz3:'#84cc16', cz4:'#06b6d4',
  cz5:'#0ea5e9', cz6:'#ec4899', dom1:'#3b82f6', dom2:'#6366f1',
  nat1:'#10b981', nat2:'#059669', zw1:'#f97316', zw2:'#f59e0b',
  ani1:'#a855f7', ani2:'#9333ea', ani3:'#7e22ce', extra:'#f59e0b',
};

// ── SFX per kategoria ─────────────────────────────────────────
const CAT_SFX = {
  cz1:'SURU!', cz2:'IIYO~', cz3:'IKU!!', cz4:'N~...',
  cz5:'YOSHI', cz6:'KYAA!', dom1:'HEYA~', dom2:'SUGOI',
  nat1:'SHIZEN', nat2:'WOW!!', zw1:'KAWAII', zw2:'SUGEE!',
  ani1:'YUUSHA', ani2:'TATAKE', ani3:'MAHOU!', extra:'NANI?!',
};

// ── Mapa słówko → scena SVG ───────────────────────────────────
// Każda scena to funkcja(color) → string SVG (viewBox 0 0 120 100)
// Dla nieznanych słówek: fallback na generyczną Akemi

const WORD_SCENES = {
  // ── Jedzenie / picie ──────────────────────────────────────
  'taberu': (c) => `
    <rect x="30" y="55" width="60" height="5" rx="2" fill="#8b5e3c"/>
    <ellipse cx="60" cy="54" rx="22" ry="8" fill="#f0e0b0" stroke="#c8a96e" stroke-width="1"/>
    <ellipse cx="52" cy="51" rx="7" ry="5" fill="#f97316" opacity=".9"/>
    <ellipse cx="63" cy="52" rx="5" ry="4" fill="#22c55e" opacity=".85"/>
    <ellipse cx="70" cy="50" rx="4" ry="3" fill="#fbbf24" opacity=".9"/>
    ${akemiChibi(c,'open','sparkle',50,30,0.8)}
    <text x="15" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".6" font-weight="bold">食</text>
    <text x="90" y="90" font-family="serif" font-size="9" fill="${c}" opacity=".5">べる</text>`,

  'nomu': (c) => `
    <rect x="52" y="45" width="16" height="28" rx="5" fill="#a0d8ef" stroke="#5ba8cc" stroke-width="1.5"/>
    <rect x="54" y="43" width="12" height="5" rx="2" fill="#5ba8cc"/>
    <rect x="56" y="30" width="2" height="14" rx="1" fill="#5ba8cc"/>
    <ellipse cx="57" cy="29" rx="3" ry="2" fill="#5ba8cc"/>
    ${akemiChibi(c,'open','sparkle',35,28,0.8)}
    <text x="85" y="25" font-family="serif" font-size="11" fill="${c}" opacity=".55" font-weight="bold">飲</text>`,

  'neru': (c) => `
    <rect x="18" y="62" width="84" height="18" rx="6" fill="#6366f1" opacity=".3"/>
    <rect x="22" y="58" width="76" height="10" rx="4" fill="#e0e7ff"/>
    <ellipse cx="38" cy="58" rx="9" ry="9" fill="#ffe0c4"/>
    <path d="M29 58 Q38 52 47 58" fill="#1a0a2e"/>
    <path d="M33 59 Q35 61 37 59" stroke="#e91e8c" stroke-width="1" fill="none"/>
    <path d="M37 59 Q39 61 41 59" stroke="#e91e8c" stroke-width="1" fill="none"/>
    <ellipse cx="33" cy="63" rx="3" ry="1.5" fill="#ff9999" opacity=".5"/>
    <ellipse cx="43" cy="63" rx="3" ry="1.5" fill="#ff9999" opacity=".5"/>
    <text x="52" y="52" font-size="14" fill="${c}" opacity=".7">💤</text>
    <text x="68" y="44" font-size="10" fill="${c}" opacity=".5">Z z z</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">寝</text>`,

  'okiru': (c) => `
    <rect x="18" y="62" width="84" height="18" rx="6" fill="#fbbf24" opacity=".2"/>
    <rect x="22" y="58" width="76" height="10" rx="4" fill="#fef3c7"/>
    <ellipse cx="38" cy="55" rx="9" ry="9" fill="#ffe0c4"/>
    <path d="M29 51 Q38 46 47 51" fill="#1a0a2e"/>
    <ellipse cx="34" cy="56" rx="3" ry="3.5" fill="#5b2589"/>
    <ellipse cx="42" cy="56" rx="3" ry="3.5" fill="#5b2589"/>
    <circle cx="35" cy="55" r="1" fill="#fff"/>
    <circle cx="43" cy="55" r="1" fill="#fff"/>
    <text x="60" y="30" font-size="18" fill="#fbbf24" opacity=".9">☀️</text>
    <text x="82" y="52" font-size="9" fill="${c}" opacity=".5">!!</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">起</text>`,

  'iku': (c) => `
    <line x1="20" y1="80" x2="100" y2="80" stroke="#c8a96e" stroke-width="2"/>
    ${akemiChibi(c,'firm','sharp',30,42,0.75)}
    <text x="78" y="55" font-size="20" fill="${c}" opacity=".8">→</text>
    <text x="86" y="75" font-size="8" fill="${c}" opacity=".5">GO!</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">行</text>`,

  'kuru': (c) => `
    <line x1="20" y1="80" x2="100" y2="80" stroke="#c8a96e" stroke-width="2"/>
    <text x="20" y="55" font-size="20" fill="${c}" opacity=".8">←</text>
    ${akemiChibi(c,'happy','sparkle',60,42,0.75)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">来</text>`,

  'kaeru': (c) => `
    <path d="M20 80 L100 80" stroke="#c8a96e" stroke-width="2"/>
    <rect x="80" y="55" width="20" height="25" rx="3" fill="#3b82f6" opacity=".5"/>
    <rect x="87" y="62" width="6" height="18" rx="2" fill="#1a0a2e" opacity=".6"/>
    <polygon points="90,50 76,58 104,58" fill="#ef4444" opacity=".7"/>
    ${akemiChibi(c,'happy','sparkle',28,44,0.75)}
    <text x="55" y="55" font-size="16" fill="${c}" opacity=".75">→🏠</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">帰</text>`,

  'kau': (c) => `
    <rect x="55" y="38" width="32" height="42" rx="4" fill="#fef9c3" stroke="#fbbf24" stroke-width="1.5"/>
    <path d="M62 38 Q71 28 80 38" stroke="#fbbf24" stroke-width="2" fill="none"/>
    <text x="60" y="62" font-size="20">🛍️</text>
    ${akemiChibi(c,'excited','sparkle',28,42,0.78)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">買</text>`,

  'wakaru': (c) => `
    ${akemiChibi(c,'excited','sparkle',35,38,0.8)}
    <circle cx="80" cy="40" r="18" fill="#fef3c7" stroke="#fbbf24" stroke-width="1.5" opacity=".9"/>
    <text x="68" y="46" font-size="18">💡</text>
    <text x="72" y="72" font-size="8" fill="${c}" opacity=".6">AHA!</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">分</text>`,

  'shiru': (c) => `
    ${akemiChibi(c,'thinking','closed',30,38,0.8)}
    <ellipse cx="82" cy="42" rx="16" ry="12" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1" opacity=".9"/>
    <text x="72" y="48" font-size="16">🧠</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">知</text>`,

  'suki da': (c) => `
    ${akemiChibi(c,'blush','hearts',35,38,0.8)}
    <text x="72" y="35" font-size="22" fill="#e91e8c">♥</text>
    <text x="84" y="55" font-size="14" fill="#e91e8c" opacity=".6">♥</text>
    <text x="66" y="65" font-size="10" fill="#e91e8c" opacity=".4">♥</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">好</text>`,

  'hoshii': (c) => `
    ${akemiChibi(c,'excited','sparkle',28,42,0.75)}
    <text x="65" y="35" font-size="16" fill="#fbbf24">✦</text>
    <text x="80" y="50" font-size="12" fill="#fbbf24" opacity=".7">✦</text>
    <text x="70" y="62" font-size="9" fill="#fbbf24" opacity=".5">✦</text>
    <circle cx="85" cy="28" r="8" fill="#1a0a2e" stroke="#fbbf24" stroke-width="1.5"/>
    <text x="78" y="32" font-size="10" fill="#fbbf24">★</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">欲</text>`,

  // ── Komunikacja ───────────────────────────────────────────
  'hanasu': (c) => `
    ${akemiChibi(c,'open','sparkle',25,42,0.75)}
    <ellipse cx="82" cy="40" rx="22" ry="14" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1.5" opacity=".9"/>
    <text x="65" y="46" font-size="15">💬</text>
    <path d="M62 50 L58 58 L66 53 Z" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">話</text>`,

  'kiku': (c) => `
    ${akemiChibi(c,'calm','closed',35,42,0.8)}
    <text x="72" y="55" font-size="22">👂</text>
    <path d="M72 48 Q85 30 90 55" stroke="${c}" stroke-width="1" fill="none" stroke-dasharray="3,2" opacity=".5"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">聞</text>`,

  'miru': (c) => `
    ${akemiChibi(c,'focused','sharp',25,42,0.75)}
    <text x="72" y="55" font-size="22">👀</text>
    <line x1="50" y1="50" x2="72" y2="50" stroke="${c}" stroke-width="1.5" stroke-dasharray="3,2" opacity=".6"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">見</text>`,

  'yomu': (c) => `
    ${akemiChibi(c,'calm','smile',28,38,0.78)}
    <rect x="62" y="35" width="36" height="44" rx="3" fill="#f5f0e8" stroke="#c8a96e" stroke-width="1.5"/>
    <rect x="65" y="40" width="30" height="2" rx="1" fill="#c8a96e" opacity=".5"/>
    <rect x="65" y="45" width="30" height="2" rx="1" fill="#c8a96e" opacity=".5"/>
    <rect x="65" y="50" width="22" height="2" rx="1" fill="#c8a96e" opacity=".5"/>
    <rect x="65" y="55" width="28" height="2" rx="1" fill="#c8a96e" opacity=".5"/>
    <rect x="65" y="60" width="18" height="2" rx="1" fill="#c8a96e" opacity=".5"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">読</text>`,

  'kaku': (c) => `
    ${akemiChibi(c,'focused','sharp',25,38,0.78)}
    <rect x="62" y="40" width="36" height="44" rx="3" fill="#fff" stroke="#6366f1" stroke-width="1.5"/>
    <line x1="66" y1="55" x2="94" y2="55" stroke="#6366f1" stroke-width="1.5"/>
    <line x1="66" y1="62" x2="94" y2="62" stroke="#6366f1" stroke-width="1"/>
    <line x1="66" y1="68" x2="86" y2="68" stroke="#6366f1" stroke-width="1"/>
    <rect x="75" y="35" width="3" height="18" rx="1" fill="#1a0a2e" transform="rotate(-30,76,44)"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">書</text>`,

  'hataraku': (c) => `
    ${akemiChibi(c,'firm','sharp',28,40,0.75)}
    <rect x="68" y="48" width="36" height="28" rx="3" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5"/>
    <rect x="72" y="52" width="28" height="16" rx="2" fill="#1e293b"/>
    <rect x="74" y="76" width="24" height="3" rx="1" fill="#94a3b8"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">働</text>`,

  'sumu': (c) => `
    <rect x="55" y="40" width="50" height="42" rx="3" fill="#bfdbfe" stroke="#3b82f6" stroke-width="1.5"/>
    <polygon points="80,28 55,43 105,43" fill="#ef4444" opacity=".8"/>
    <rect x="68" y="62" width="14" height="20" rx="2" fill="#1e40af" opacity=".7"/>
    <rect x="60" y="50" width="8" height="8" rx="1" fill="#93c5fd"/>
    <rect x="82" y="50" width="8" height="8" rx="1" fill="#93c5fd"/>
    ${akemiChibi(c,'happy','sparkle',18,44,0.72)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">住</text>`,

  'suru': (c) => `
    ${akemiChibi(c,'heroic','sharp',30,38,0.8)}
    <text x="72" y="38" font-size="10" fill="${c}" opacity=".7" font-weight="bold">ACTION</text>
    <text x="68" y="52" font-size="20">⚡</text>
    <text x="84" y="68" font-size="16" fill="${c}" opacity=".6">!</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">す</text>`,

  // ── Ruch ──────────────────────────────────────────────────
  'matsu': (c) => `
    ${akemiChibi(c,'thinking','closed',32,38,0.8)}
    <text x="70" y="48" font-size="22">⏳</text>
    <text x="65" y="68" font-size="8" fill="${c}" opacity=".6">...待ち...</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">待</text>`,

  'tatsu': (c) => `
    ${akemiChibi(c,'firm','sharp',45,30,0.9)}
    <line x1="15" y1="82" x2="105" y2="82" stroke="#c8a96e" stroke-width="2"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">立</text>`,

  'suwaru': (c) => `
    <rect x="30" y="62" width="60" height="8" rx="3" fill="#8b5e3c" opacity=".8"/>
    <rect x="28" y="70" width="6" height="18" rx="2" fill="#8b5e3c" opacity=".8"/>
    <rect x="86" y="70" width="6" height="18" rx="2" fill="#8b5e3c" opacity=".8"/>
    ${akemiChibi(c,'calm','smile',44,35,0.85)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">座</text>`,

  'hashiru': (c) => `
    <line x1="15" y1="82" x2="105" y2="82" stroke="#c8a96e" stroke-width="2"/>
    ${akemiRunning(c)}
    <text x="15" y="65" font-size="8" fill="${c}" opacity=".4">━━</text>
    <text x="22" y="60" font-size="8" fill="${c}" opacity=".3">━━</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">走</text>`,

  'aruku': (c) => `
    <line x1="15" y1="82" x2="105" y2="82" stroke="#c8a96e" stroke-width="2"/>
    ${akemiWalking(c)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">歩</text>`,

  'ageru': (c) => `
    ${akemiChibi(c,'happy','sparkle',28,42,0.75)}
    <text x="62" y="48" font-size="20">🌸</text>
    <text x="55" y="35" font-size="10" fill="${c}" opacity=".7">↑ あげる</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">上</text>`,

  'morau': (c) => `
    ${akemiChibi(c,'happy','sparkle',28,42,0.75)}
    <text x="62" y="48" font-size="20">🎁</text>
    <text x="55" y="35" font-size="10" fill="${c}" opacity=".7">↓ もらう</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">受</text>`,

  'sagasu': (c) => `
    ${akemiChibi(c,'focused','sharp',28,42,0.75)}
    <circle cx="82" cy="48" r="14" fill="none" stroke="${c}" stroke-width="2.5" opacity=".8"/>
    <line x1="91" y1="58" x2="100" y2="67" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity=".8"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">探</text>`,

  'hajimeru': (c) => `
    ${akemiChibi(c,'excited','sparkle',28,42,0.75)}
    <text x="65" y="42" font-size="16" fill="${c}" opacity=".9">▶</text>
    <text x="60" y="60" font-size="9" fill="${c}" opacity=".6">START!</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">始</text>`,

  'owaru': (c) => `
    ${akemiChibi(c,'calm','smile',28,42,0.75)}
    <text x="65" y="42" font-size="16" fill="${c}" opacity=".9">⏹</text>
    <text x="59" y="60" font-size="9" fill="${c}" opacity=".6">OWARI</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">終</text>`,

  // ── Umysł ────────────────────────────────────────────────
  'omou': (c) => `
    ${akemiChibi(c,'thinking','closed',28,42,0.75)}
    <ellipse cx="82" cy="35" rx="18" ry="12" fill="#f0e6ff" stroke="${c}" stroke-width="1" opacity=".9"/>
    <text x="70" y="40" font-size="14">💭</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">思</text>`,

  'oboeru': (c) => `
    ${akemiChibi(c,'excited','sparkle',28,42,0.75)}
    <rect x="66" y="30" width="32" height="40" rx="3" fill="#fef3c7" stroke="#fbbf24" stroke-width="1.5"/>
    <line x1="70" y1="42" x2="94" y2="42" stroke="#fbbf24" stroke-width="1.5"/>
    <line x1="70" y1="50" x2="94" y2="50" stroke="#fbbf24" stroke-width="1"/>
    <line x1="70" y1="58" x2="88" y2="58" stroke="#fbbf24" stroke-width="1"/>
    <text x="74" y="38" font-size="8" fill="#92400e">★ memo</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">覚</text>`,

  'wasureru': (c) => `
    ${akemiChibi(c,'thinking','hmm',28,42,0.75)}
    <text x="66" y="42" font-size="18">❓</text>
    <text x="80" y="35" font-size="12" fill="${c}" opacity=".5">？</text>
    <text x="72" y="65" font-size="9" fill="${c}" opacity=".5">あれ…</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">忘</text>`,

  // ── Emocje ────────────────────────────────────────────────
  'warau': (c) => `
    ${akemiChibi(c,'excited','sparkle',30,38,0.8)}
    <text x="68" y="45" font-size="24">😂</text>
    <text x="65" y="65" font-size="8" fill="${c}" opacity=".5">HA HA HA</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">笑</text>`,

  'naku': (c) => `
    ${akemiChibi(c,'blush','closed',32,38,0.8)}
    <text x="68" y="45" font-size="24">😭</text>
    <text x="62" y="65" font-size="8" fill="${c}" opacity=".5">ぐすん…</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">泣</text>`,

  'utau': (c) => `
    ${akemiChibi(c,'open','sparkle',30,38,0.8)}
    <text x="68" y="38" font-size="18">🎤</text>
    <text x="84" y="32" font-size="10" fill="${c}" opacity=".7">♪</text>
    <text x="92" y="45" font-size="8" fill="${c}" opacity=".5">♫</text>
    <text x="80" y="58" font-size="9" fill="${c}" opacity=".4">♩</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">歌</text>`,

  'odoru': (c) => `
    ${akemiDancing(c)}
    <text x="82" y="32" font-size="10" fill="${c}" opacity=".7">♪</text>
    <text x="90" y="50" font-size="8" fill="${c}" opacity=".5">♫</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">踊</text>`,

  'asobu': (c) => `
    ${akemiChibi(c,'excited','sparkle',28,42,0.75)}
    <text x="62" y="42" font-size="20">⚽</text>
    <text x="82" y="52" font-size="14" fill="${c}" opacity=".6">🎮</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">遊</text>`,

  // ── Dom ───────────────────────────────────────────────────
  'akeru': (c) => `
    ${akemiChibi(c,'open','sparkle',20,42,0.75)}
    <rect x="60" y="30" width="45" height="58" rx="3" fill="#bfdbfe" stroke="#3b82f6" stroke-width="2"/>
    <rect x="60" y="30" width="22" height="58" rx="2" fill="#93c5fd" opacity=".8"/>
    <path d="M82 58 L60 58" stroke="#3b82f6" stroke-width="2"/>
    <circle cx="84" cy="59" r="3" fill="#fbbf24"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">開</text>`,

  'shimeru': (c) => `
    ${akemiChibi(c,'firm','sharp',20,42,0.75)}
    <rect x="60" y="30" width="45" height="58" rx="3" fill="#93c5fd" stroke="#3b82f6" stroke-width="2"/>
    <circle cx="76" cy="59" r="3" fill="#fbbf24"/>
    <text x="58" y="22" font-size="9" fill="${c}" opacity=".6">SLAM</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">閉</text>`,

  'hairu': (c) => `
    <rect x="60" y="30" width="45" height="58" rx="3" fill="#bfdbfe" stroke="#3b82f6" stroke-width="2"/>
    <rect x="60" y="30" width="22" height="58" rx="2" fill="#93c5fd" opacity=".8"/>
    <circle cx="84" cy="59" r="3" fill="#fbbf24"/>
    ${akemiChibi(c,'happy','sparkle',18,44,0.75)}
    <text x="28" y="58" font-size="14" fill="${c}" opacity=".8">→</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">入</text>`,

  'deru': (c) => `
    <rect x="20" y="30" width="45" height="58" rx="3" fill="#bfdbfe" stroke="#3b82f6" stroke-width="2"/>
    <rect x="43" y="30" width="22" height="58" rx="2" fill="#93c5fd" opacity=".8"/>
    <circle cx="42" cy="59" r="3" fill="#fbbf24"/>
    ${akemiChibi(c,'happy','sparkle',62,44,0.75)}
    <text x="62" y="58" font-size="14" fill="${c}" opacity=".8">→</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">出</text>`,

  'tsukau': (c) => `
    ${akemiChibi(c,'focused','sharp',28,38,0.75)}
    <text x="66" y="55" font-size="24">🔧</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">使</text>`,

  'tsukuru': (c) => `
    ${akemiChibi(c,'focused','sharp',25,38,0.75)}
    <text x="64" y="40" font-size="18">🛠️</text>
    <rect x="66" y="52" width="32" height="24" rx="2" fill="#fef3c7" stroke="#fbbf24" stroke-width="1.5"/>
    <text x="72" y="68" font-size="9" fill="#92400e">MAKE!</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">作</text>`,

  'kiru': (c) => `
    ${akemiChibi(c,'happy','sparkle',28,42,0.75)}
    <text x="68" y="50" font-size="22">👘</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">着</text>`,

  'arau': (c) => `
    ${akemiChibi(c,'happy','sparkle',28,42,0.75)}
    <text x="64" y="48" font-size="22">🧼</text>
    <ellipse cx="80" cy="68" rx="14" ry="6" fill="#a0d8ef" opacity=".6"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">洗</text>`,

  'ryouri suru': (c) => `
    ${akemiChibi(c,'excited','sparkle',22,38,0.75)}
    <text x="60" y="48" font-size="22">🍳</text>
    <text x="78" y="38" font-size="14">🔥</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">料</text>`,

  // ── Natura ────────────────────────────────────────────────
  'sora': (c) => `
    <rect x="10" y="10" width="100" height="80" rx="6" fill="#bfdbfe" opacity=".5"/>
    <ellipse cx="40" cy="30" rx="18" ry="10" fill="#fff" opacity=".8"/>
    <ellipse cx="55" cy="25" rx="14" ry="9" fill="#fff" opacity=".9"/>
    <ellipse cx="65" cy="32" rx="16" ry="9" fill="#fff" opacity=".7"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">空</text>`,

  'umi': (c) => `
    <rect x="10" y="55" width="100" height="35" rx="4" fill="#0ea5e9" opacity=".6"/>
    <path d="M10 55 Q35 45 60 55 Q85 65 110 55" fill="#38bdf8" opacity=".5"/>
    <path d="M10 65 Q35 55 60 65 Q85 75 110 65" fill="#0284c7" opacity=".4"/>
    <ellipse cx="30" cy="50" rx="12" ry="7" fill="#fff" opacity=".7"/>
    <ellipse cx="80" cy="42" rx="16" ry="8" fill="#fff" opacity=".6"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">海</text>`,

  'yama': (c) => `
    <rect x="10" y="60" width="100" height="32" rx="3" fill="#22c55e" opacity=".4"/>
    <polygon points="60,10 20,78 100,78" fill="#6b7280" opacity=".6"/>
    <polygon points="60,10 42,40 78,40" fill="#f1f5f9" opacity=".8"/>
    <polygon points="80,25 58,70 102,70" fill="#9ca3af" opacity=".5"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">山</text>`,

  'kawa': (c) => `
    <rect x="10" y="50" width="100" height="40" rx="4" fill="#38bdf8" opacity=".4"/>
    <path d="M10 58 Q40 50 70 60 Q90 68 110 58" stroke="#0ea5e9" stroke-width="2" fill="none"/>
    <path d="M10 68 Q40 60 70 70 Q90 78 110 68" stroke="#0284c7" stroke-width="2" fill="none"/>
    <polygon points="20,50 40,10 60,50" fill="#4ade80" opacity=".5"/>
    <polygon points="70,50 90,15 110,50" fill="#22c55e" opacity=".4"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">川</text>`,

  'mori': (c) => `
    <rect x="10" y="58" width="100" height="32" rx="3" fill="#4ade80" opacity=".3"/>
    <polygon points="30,60 20,85 40,85" fill="#16a34a" opacity=".7"/>
    <polygon points="30,50 18,72 42,72" fill="#22c55e" opacity=".8"/>
    <polygon points="60,55 48,80 72,80" fill="#15803d" opacity=".7"/>
    <polygon points="60,45 46,68 74,68" fill="#16a34a" opacity=".8"/>
    <polygon points="90,58 78,82 102,82" fill="#22c55e" opacity=".7"/>
    <polygon points="90,48 76,70 104,70" fill="#4ade80" opacity=".7"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">森</text>`,

  'hana': (c) => `
    <circle cx="60" cy="50" r="8" fill="#fbbf24"/>
    <ellipse cx="60" cy="38" rx="6" ry="9" fill="#f9a8d4" opacity=".9"/>
    <ellipse cx="60" cy="62" rx="6" ry="9" fill="#f9a8d4" opacity=".9"/>
    <ellipse cx="48" cy="50" rx="9" ry="6" fill="#f0abfc" opacity=".9"/>
    <ellipse cx="72" cy="50" rx="9" ry="6" fill="#f0abfc" opacity=".9"/>
    <ellipse cx="51" cy="41" rx="6" ry="9" fill="#fda4af" opacity=".85" transform="rotate(-45,51,41)"/>
    <ellipse cx="69" cy="41" rx="6" ry="9" fill="#fda4af" opacity=".85" transform="rotate(45,69,41)"/>
    <ellipse cx="51" cy="59" rx="6" ry="9" fill="#f9a8d4" opacity=".85" transform="rotate(45,51,59)"/>
    <ellipse cx="69" cy="59" rx="6" ry="9" fill="#f9a8d4" opacity=".85" transform="rotate(-45,69,59)"/>
    <line x1="60" y1="58" x2="60" y2="88" stroke="#16a34a" stroke-width="2.5"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">花</text>`,

  'tsuki': (c) => `
    <rect x="10" y="10" width="100" height="80" rx="6" fill="#1e1b4b" opacity=".6"/>
    <circle cx="72" cy="35" r="18" fill="#fef3c7" opacity=".9"/>
    <circle cx="80" cy="28" r="14" fill="#1e1b4b" opacity=".8"/>
    <circle cx="30" cy="25" r="1.5" fill="#fff" opacity=".8"/>
    <circle cx="20" cy="45" r="1" fill="#fff" opacity=".7"/>
    <circle cx="45" cy="18" r="1.5" fill="#fff" opacity=".8"/>
    <circle cx="95" cy="60" r="1" fill="#fff" opacity=".7"/>
    <circle cx="15" cy="68" r="1.5" fill="#fff" opacity=".6"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="#fef3c7" opacity=".65" font-weight="bold">月</text>`,

  'taiyou': (c) => `
    <rect x="10" y="10" width="100" height="80" rx="6" fill="#fef3c7" opacity=".4"/>
    <circle cx="60" cy="45" r="20" fill="#fbbf24" opacity=".9"/>
    <circle cx="60" cy="45" r="14" fill="#f59e0b"/>
    ${[0,1,2,3,4,5,6,7].map(i=>{const a=i*45*Math.PI/180;const x1=60+22*Math.cos(a);const y1=45+22*Math.sin(a);const x2=60+32*Math.cos(a);const y2=45+32*Math.sin(a);return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>`;}).join('')}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">太陽</text>`,

  // ── Zwierzęta ─────────────────────────────────────────────
  'neko': (c) => `
    ${catSVG(c)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">猫</text>`,

  'inu': (c) => `
    ${dogSVG(c)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">犬</text>`,

  'tori': (c) => `
    ${birdSVG(c)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">鳥</text>`,

  'sakana': (c) => `
    ${fishSVG(c)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">魚</text>`,

  'usagi': (c) => `
    ${rabbitSVG(c)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">兎</text>`,

  'kuma': (c) => `
    ${bearSVG(c)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">熊</text>`,

  'uma': (c) => `
    ${horseSVG(c)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">馬</text>`,

  'ryu': (c) => `
    ${dragonSVG(c)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">竜</text>`,

  // ── Isekai / Wojownicy ───────────────────────────────────
  'ken': (c) => `
    <rect x="54" y="15" width="8" height="60" rx="3" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
    <rect x="50" y="68" width="16" height="12" rx="3" fill="#92400e"/>
    <rect x="40" y="62" width="36" height="6" rx="2" fill="#475569"/>
    <ellipse cx="58" cy="13" rx="5" ry="3" fill="#e2e8f0"/>
    ${speedlinesSVG(c)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">剣</text>`,

  'mahou': (c) => `
    ${akemiChibi(c,'heroic','sharp',28,42,0.75)}
    <circle cx="84" cy="42" r="16" fill="none" stroke="${c}" stroke-width="2" opacity=".6" stroke-dasharray="5,3"/>
    <text x="72" y="48" font-size="16">🔮</text>
    <text x="62" y="28" font-size="10" fill="${c}" opacity=".7">✦</text>
    <text x="88" y="25" font-size="8" fill="${c}" opacity=".5">✦</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">魔法</text>`,

  'yuusha': (c) => `
    ${akemiChibi(c,'heroic','sharp',28,35,0.85)}
    <text x="68" y="30" font-size="10" fill="${c}" font-weight="bold" opacity=".8">HERO</text>
    <text x="60" y="48" font-size="18" fill="#fbbf24">★</text>
    ${speedlinesSVG(c)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">勇者</text>`,

  'teki': (c) => `
    <ellipse cx="80" cy="45" rx="20" ry="25" fill="#7f1d1d" opacity=".5"/>
    <ellipse cx="80" cy="35" rx="12" ry="12" fill="#991b1b" opacity=".7"/>
    <circle cx="75" cy="33" r="2" fill="#ef4444"/>
    <circle cx="85" cy="33" r="2" fill="#ef4444"/>
    <path d="M74 40 Q80 45 86 40" stroke="#ef4444" stroke-width="1.5" fill="none"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">敵</text>`,

  'nakama': (c) => `
    ${akemiChibi(c,'happy','sparkle',20,42,0.7)}
    ${akemiChibiSmall(c,'calm','smile',55,50)}
    ${akemiChibiSmall(c,'excited','sparkle',80,50)}
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">仲間</text>`,

  'shiro': (c) => `
    <rect x="35" y="50" width="50" height="38" rx="2" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
    <rect x="54" y="62" width="12" height="26" rx="2" fill="#1e293b" opacity=".7"/>
    <polygon points="60,15 35,52 85,52" fill="#94a3b8"/>
    <polygon points="38,52 38,62 52,62 52,52" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
    <polygon points="68,52 68,62 82,62 82,52" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
    <rect x="20" y="35" width="12" height="55" rx="2" fill="#94a3b8" stroke="#64748b" stroke-width="1"/>
    <rect x="88" y="35" width="12" height="55" rx="2" fill="#94a3b8" stroke="#64748b" stroke-width="1"/>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">城</text>`,
};

// ── Pomocnicze mini-rysunki ────────────────────────────────────

function akemiChibi(c, mouth='smile', eyes='sparkle', cx=40, cy=45, scale=1.0) {
  const eyeMap = {
    sparkle: `<ellipse cx="${cx-6}" cy="${cy+2}" rx="${3*scale}" ry="${3.5*scale}" fill="#5b2589"/>
              <ellipse cx="${cx+6}" cy="${cy+2}" rx="${3*scale}" ry="${3.5*scale}" fill="#5b2589"/>
              <circle cx="${cx-5}" cy="${cy}" r="${1.2*scale}" fill="#fff"/>
              <circle cx="${cx+7}" cy="${cy}" r="${1.2*scale}" fill="#fff"/>`,
    sharp: `<path d="M${cx-10},${cy} L${cx-3},${cy+2} L${cx-10},${cy+4} Z" fill="#5b2589"/>
            <path d="M${cx+3},${cy} L${cx+10},${cy+2} L${cx+3},${cy+4} Z" fill="#5b2589"/>`,
    closed: `<path d="M${cx-9},${cy+2} Q${cx-5},${cy-1} ${cx-1},${cy+2}" stroke="#5b2589" stroke-width="1.5" fill="none" stroke-linecap="round"/>
             <path d="M${cx+1},${cy+2} Q${cx+5},${cy-1} ${cx+9},${cy+2}" stroke="#5b2589" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
    hearts: `<text x="${cx-12}" y="${cy+4}" font-size="${8*scale}" fill="#e91e8c">♥</text>
             <text x="${cx+2}" y="${cy+4}" font-size="${8*scale}" fill="#e91e8c">♥</text>`,
    hmm: `<path d="M${cx-8},${cy+1} Q${cx-5},${cy-1} ${cx-2},${cy+2}" stroke="#5b2589" stroke-width="1.5" fill="none"/>
          <path d="M${cx+2},${cy+1} Q${cx+5},${cy-1} ${cx+8},${cy+2}" stroke="#5b2589" stroke-width="1.5" fill="none"/>`,
  };
  const mouthMap = {
    smile: `<path d="M${cx-5},${cy+10} Q${cx},${cy+14} ${cx+5},${cy+10}" stroke="#8b1a1a" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
    open:  `<path d="M${cx-5},${cy+10} Q${cx},${cy+15} ${cx+5},${cy+10}" stroke="#8b1a1a" stroke-width="1.2" fill="#ffc0cb" stroke-linecap="round"/>`,
    firm:  `<line x1="${cx-5}" y1="${cy+10}" x2="${cx+5}" y2="${cy+10}" stroke="#8b1a1a" stroke-width="1.5" stroke-linecap="round"/>`,
    hmm:   `<path d="M${cx-4},${cy+10} Q${cx},${cy+8} ${cx+4},${cy+11}" stroke="#8b1a1a" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
  };
  const r = 14 * scale;
  const blush = `<ellipse cx="${cx-8}" cy="${cy+7}" rx="${3.5*scale}" ry="${1.8*scale}" fill="#ff9999" opacity=".5"/>
                 <ellipse cx="${cx+8}" cy="${cy+7}" rx="${3.5*scale}" ry="${1.8*scale}" fill="#ff9999" opacity=".5"/>`;
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r*1.15}" fill="#ffe0c4"/>
    <path d="M${cx-r},${cy-4} Q${cx-r+2},${cy-r*1.5} ${cx},${cy-r*1.6} Q${cx+r-2},${cy-r*1.5} ${cx+r},${cy-4} Q${cx+r-3},${cy-r} ${cx+r-8},${cy-r+2} Q${cx},${cy-r*1.2} Q${cx-r+8},${cy-r+2} ${cx-r+3},${cy-r} Z" fill="#1a0a2e"/>
    ${eyeMap[eyes] || eyeMap.sparkle}
    <circle cx="${cx}" cy="${cy+6}" r="${0.9*scale}" fill="#cc9977"/>
    ${mouthMap[mouth] || mouthMap.smile}
    ${blush}
    <path d="M${cx-r*0.8},${cy+10} Q${cx-r*1.4},${cy+r*1.6} ${cx-r*0.5},${cy+r*2.2}" fill="${c}" stroke="none" opacity=".85"/>
    <path d="M${cx+r*0.8},${cy+10} Q${cx+r*1.4},${cy+r*1.6} ${cx+r*0.5},${cy+r*2.2}" fill="${c}" stroke="none" opacity=".85"/>`;
}

function akemiChibiSmall(c, mouth, eyes, x, y) {
  const r = 9;
  return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*1.1}" fill="#ffe0c4"/>
          <path d="M${x-r},${y-3} Q${x},${y-r*1.4} ${x+r},${y-3}" fill="#1a0a2e"/>
          <ellipse cx="${x-3}" cy="${y+1}" rx="2" ry="2.5" fill="#5b2589"/>
          <ellipse cx="${x+3}" cy="${y+1}" rx="2" ry="2.5" fill="#5b2589"/>
          <path d="M${x-3},${y+7} Q${x},${y+10} ${x+3},${y+7}" stroke="#8b1a1a" stroke-width="1" fill="none"/>`;
}

function akemiRunning(c) {
  const cx = 65, cy = 45;
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="12" ry="13" fill="#ffe0c4"/>
    <path d="M${cx-12},${cy-2} Q${cx},${cy-16} ${cx+12},${cy-2}" fill="#1a0a2e"/>
    <ellipse cx="${cx-4}" cy="${cy+2}" rx="2.5" ry="3" fill="#5b2589"/>
    <ellipse cx="${cx+4}" cy="${cy+2}" rx="2.5" ry="3" fill="#5b2589"/>
    <path d="M${cx-3},${cy+8} Q${cx},${cy+11} ${cx+3},${cy+8}" stroke="#8b1a1a" stroke-width="1.2" fill="none"/>
    <path d="M${cx+10},${cy+10} Q${cx+22},${cy+26} ${cx+8},${cy+36}" fill="${c}" opacity=".85"/>
    <path d="M${cx-10},${cy+10} Q${cx-16},${cy+22} ${cx-4},${cy+36}" fill="${c}" opacity=".85"/>
    <path d="M${cx-4},${cy+36} Q${cx+2},${cy+50} ${cx+12},${cy+55}" stroke="${c}" stroke-width="4" fill="none" opacity=".7"/>
    <path d="M${cx+8},${cy+36} Q${cx-2},${cy+48} ${cx-10},${cy+52}" stroke="${c}" stroke-width="4" fill="none" opacity=".7"/>
    <path d="M${cx-14},${cy+28} Q${cx-26},${cy+18} ${cx-20},${cy+10}" stroke="#ffe0c4" stroke-width="4" fill="none"/>
    <path d="M${cx+14},${cy+20} Q${cx+28},${cy+32} ${cx+24},${cy+40}" stroke="#ffe0c4" stroke-width="4" fill="none"/>`;
}

function akemiWalking(c) {
  const cx = 58, cy = 46;
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="12" ry="13" fill="#ffe0c4"/>
    <path d="M${cx-12},${cy-2} Q${cx},${cy-16} ${cx+12},${cy-2}" fill="#1a0a2e"/>
    <ellipse cx="${cx-4}" cy="${cy+2}" rx="2.5" ry="3" fill="#5b2589"/>
    <ellipse cx="${cx+4}" cy="${cy+2}" rx="2.5" ry="3" fill="#5b2589"/>
    <path d="M${cx-3},${cy+8} Q${cx},${cy+11} ${cx+3},${cy+8}" stroke="#8b1a1a" stroke-width="1.2" fill="none"/>
    <path d="M${cx+10},${cy+10} Q${cx+20},${cy+26} ${cx+8},${cy+36}" fill="${c}" opacity=".85"/>
    <path d="M${cx-10},${cy+10} Q${cx-14},${cy+22} ${cx-2},${cy+36}" fill="${c}" opacity=".85"/>
    <path d="M${cx-2},${cy+36} Q${cx+4},${cy+52} ${cx+14},${cy+56}" stroke="${c}" stroke-width="4" fill="none" opacity=".7"/>
    <path d="M${cx+8},${cy+36} Q${cx+6},${cy+52} ${cx-2},${cy+56}" stroke="${c}" stroke-width="4" fill="none" opacity=".7"/>
    <path d="M${cx-14},${cy+22} Q${cx-24},${cy+18} ${cx-22},${cy+10}" stroke="#ffe0c4" stroke-width="4" fill="none"/>
    <path d="M${cx+12},${cy+22} Q${cx+22},${cy+28} ${cx+20},${cy+18}" stroke="#ffe0c4" stroke-width="4" fill="none"/>`;
}

function akemiDancing(c) {
  const cx = 58, cy = 42;
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="12" ry="13" fill="#ffe0c4"/>
    <path d="M${cx-12},${cy-2} Q${cx},${cy-16} ${cx+12},${cy-2}" fill="#1a0a2e"/>
    <ellipse cx="${cx-4}" cy="${cy+2}" rx="3.5" ry="4" fill="#5b2589"/>
    <ellipse cx="${cx+4}" cy="${cy+2}" rx="3.5" ry="4" fill="#5b2589"/>
    <circle cx="${cx-3}" cy="${cy}" r="1.2" fill="#fff"/>
    <circle cx="${cx+5}" cy="${cy}" r="1.2" fill="#fff"/>
    <path d="M${cx-4},${cy+9} Q${cx},${cy+13} ${cx+4},${cy+9}" stroke="#8b1a1a" stroke-width="1.2" fill="#ffc0cb"/>
    <path d="M${cx+10},${cy+10} Q${cx+22},${cy+22} ${cx+10},${cy+36}" fill="${c}" opacity=".85"/>
    <path d="M${cx-10},${cy+10} Q${cx-18},${cy+22} ${cx-6},${cy+36}" fill="${c}" opacity=".85"/>
    <path d="M${cx-6},${cy+36} Q${cx-14},${cy+50} ${cx-4},${cy+60}" stroke="${c}" stroke-width="4" fill="none" opacity=".8"/>
    <path d="M${cx+10},${cy+36} Q${cx+20},${cy+50} ${cx+12},${cy+60}" stroke="${c}" stroke-width="4" fill="none" opacity=".8"/>
    <path d="M${cx-14},${cy+18} Q${cx-28},${cy+8} ${cx-22},${cy-2}" stroke="#ffe0c4" stroke-width="4" fill="none"/>
    <path d="M${cx+14},${cy+14} Q${cx+28},${cy+24} ${cx+26},${cy+36}" stroke="#ffe0c4" stroke-width="4" fill="none"/>`;
}

// ── Zwierzaki ─────────────────────────────────────────────────
function catSVG(c) {
  return `
    <ellipse cx="60" cy="58" rx="22" ry="18" fill="#d4a574"/>
    <ellipse cx="60" cy="44" rx="16" ry="14" fill="#d4a574"/>
    <polygon points="46,34 42,22 52,32" fill="#d4a574"/>
    <polygon points="74,34 78,22 68,32" fill="#d4a574"/>
    <polygon points="47,34 44,25 52,32" fill="#f9a8d4" opacity=".8"/>
    <polygon points="73,34 76,25 68,32" fill="#f9a8d4" opacity=".8"/>
    <ellipse cx="53" cy="44" rx="3.5" ry="4" fill="#1a0a2e"/>
    <ellipse cx="67" cy="44" rx="3.5" ry="4" fill="#1a0a2e"/>
    <circle cx="54" cy="43" r="1.5" fill="#fff"/>
    <circle cx="68" cy="43" r="1.5" fill="#fff"/>
    <ellipse cx="60" cy="50" rx="3" ry="2" fill="#f9a8d4"/>
    <path d="M52 52 Q56 56 60 54 Q64 56 68 52" stroke="#8b5e3c" stroke-width="1" fill="none"/>
    <line x1="40" y1="48" x2="55" y2="50" stroke="#8b5e3c" stroke-width="1" opacity=".7"/>
    <line x1="80" y1="48" x2="65" y2="50" stroke="#8b5e3c" stroke-width="1" opacity=".7"/>
    <line x1="40" y1="52" x2="55" y2="51" stroke="#8b5e3c" stroke-width="1" opacity=".7"/>
    <line x1="80" y1="52" x2="65" y2="51" stroke="#8b5e3c" stroke-width="1" opacity=".7"/>
    <path d="M60 62 Q72 70 76 82 Q68 76 60 76 Q52 76 44 82 Q48 70 60 62 Z" fill="#d4a574" opacity=".6"/>`;
}

function dogSVG(c) {
  return `
    <ellipse cx="60" cy="62" rx="24" ry="18" fill="#d4a574"/>
    <ellipse cx="60" cy="44" rx="18" ry="16" fill="#d4a574"/>
    <ellipse cx="42" cy="40" rx="7" ry="12" fill="#c49a6c" transform="rotate(20,42,40)"/>
    <ellipse cx="78" cy="40" rx="7" ry="12" fill="#c49a6c" transform="rotate(-20,78,40)"/>
    <ellipse cx="53" cy="44" rx="4" ry="4.5" fill="#1a0a2e"/>
    <ellipse cx="67" cy="44" rx="4" ry="4.5" fill="#1a0a2e"/>
    <circle cx="54" cy="42" r="1.8" fill="#fff"/>
    <circle cx="68" cy="42" r="1.8" fill="#fff"/>
    <ellipse cx="60" cy="52" rx="5" ry="3.5" fill="#8b1a1a"/>
    <path d="M52 56 Q60 62 68 56" stroke="#8b1a1a" stroke-width="1.5" fill="#fda4af"/>
    <path d="M60 55 Q68 60 80 56 Q76 68 60 66 Z" fill="#fda4af" opacity=".7"/>
    <path d="M60 62 Q50 72 46 84" stroke="#d4a574" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M60 62 Q70 72 74 84" stroke="#d4a574" stroke-width="5" fill="none" stroke-linecap="round"/>`;
}

function birdSVG(c) {
  return `
    <ellipse cx="60" cy="58" rx="20" ry="16" fill="#fbbf24"/>
    <ellipse cx="60" cy="44" rx="13" ry="12" fill="#fbbf24"/>
    <path d="M40 52 Q28 42 32 34 Q36 28 42 36 Q44 44 46 52 Z" fill="#fbbf24"/>
    <path d="M80 52 Q92 42 88 34 Q84 28 78 36 Q76 44 74 52 Z" fill="#fbbf24"/>
    <ellipse cx="54" cy="43" rx="3.5" ry="4" fill="#1a0a2e"/>
    <ellipse cx="66" cy="43" rx="3.5" ry="4" fill="#1a0a2e"/>
    <circle cx="55" cy="41" r="1.5" fill="#fff"/>
    <circle cx="67" cy="41" r="1.5" fill="#fff"/>
    <path d="M54 52 Q60 56 66 52" fill="#f97316" stroke="#ea580c" stroke-width="1"/>
    <path d="M60 56 L57 62 L63 62 Z" fill="#f97316"/>
    <path d="M60 62 L54 80 Q60 78 66 80 Z" fill="#fbbf24" opacity=".7"/>`;
}

function fishSVG(c) {
  return `
    <ellipse cx="55" cy="54" rx="28" ry="16" fill="#38bdf8" opacity=".9"/>
    <path d="M83 54 Q98 42 100 54 Q98 66 83 54 Z" fill="#0ea5e9"/>
    <ellipse cx="40" cy="52" rx="5" ry="5" fill="#1a0a2e"/>
    <circle cx="38" cy="50" r="2" fill="#fff"/>
    <path d="M36 54 Q40 58 44 54" stroke="#0284c7" stroke-width="1.5" fill="none"/>
    <path d="M55 42 Q62 34 70 42" stroke="#7dd3fc" stroke-width="2" fill="none" opacity=".6"/>
    <path d="M55 66 Q62 74 70 66" stroke="#7dd3fc" stroke-width="2" fill="none" opacity=".6"/>
    <rect x="10" y="46" width="100" height="20" rx="6" fill="#a0d8ef" opacity=".15"/>`;
}

function rabbitSVG(c) {
  return `
    <ellipse cx="48" cy="30" rx="6" ry="18" fill="#e5e7eb"/>
    <ellipse cx="72" cy="30" rx="6" ry="18" fill="#e5e7eb"/>
    <ellipse cx="48" cy="30" rx="3.5" ry="14" fill="#fda4af" opacity=".6"/>
    <ellipse cx="72" cy="30" rx="3.5" ry="14" fill="#fda4af" opacity=".6"/>
    <ellipse cx="60" cy="58" rx="20" ry="17" fill="#f1f5f9"/>
    <ellipse cx="60" cy="45" rx="15" ry="14" fill="#f1f5f9"/>
    <ellipse cx="53" cy="44" rx="3.5" ry="4" fill="#e11d48"/>
    <ellipse cx="67" cy="44" rx="3.5" ry="4" fill="#e11d48"/>
    <circle cx="54" cy="43" r="1.5" fill="#fff"/>
    <circle cx="68" cy="43" r="1.5" fill="#fff"/>
    <ellipse cx="60" cy="52" rx="3" ry="2" fill="#fda4af"/>
    <path d="M53 54 Q60 58 67 54" stroke="#9f1239" stroke-width="1" fill="none"/>
    <line x1="42" y1="50" x2="55" y2="52" stroke="#94a3b8" stroke-width="1" opacity=".7"/>
    <line x1="78" y1="50" x2="65" y2="52" stroke="#94a3b8" stroke-width="1" opacity=".7"/>
    <path d="M60 62 Q52 74 50 86" stroke="#e2e8f0" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M60 62 Q68 74 70 86" stroke="#e2e8f0" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="60" cy="82" rx="12" ry="6" fill="#e5e7eb" opacity=".5"/>`;
}

function bearSVG(c) {
  return `
    <ellipse cx="60" cy="62" rx="26" ry="22" fill="#8b6914"/>
    <ellipse cx="60" cy="46" rx="20" ry="18" fill="#8b6914"/>
    <ellipse cx="42" cy="34" rx="9" ry="9" fill="#92400e"/>
    <ellipse cx="78" cy="34" rx="9" ry="9" fill="#92400e"/>
    <ellipse cx="60" cy="52" rx="12" ry="10" fill="#a37820"/>
    <ellipse cx="52" cy="44" rx="4" ry="4.5" fill="#1a0a2e"/>
    <ellipse cx="68" cy="44" rx="4" ry="4.5" fill="#1a0a2e"/>
    <circle cx="53" cy="42" r="1.8" fill="#fff"/>
    <circle cx="69" cy="42" r="1.8" fill="#fff"/>
    <ellipse cx="60" cy="54" rx="4" ry="3" fill="#5c3409"/>
    <path d="M53 58 Q60 63 67 58" stroke="#5c3409" stroke-width="1.5" fill="none"/>`;
}

function horseSVG(c) {
  return `
    <ellipse cx="60" cy="60" rx="30" ry="18" fill="#c49a6c"/>
    <rect x="38" y="68" width="8" height="20" rx="4" fill="#c49a6c"/>
    <rect x="52" y="68" width="8" height="20" rx="4" fill="#c49a6c"/>
    <rect x="60" y="68" width="8" height="20" rx="4" fill="#c49a6c"/>
    <rect x="74" y="68" width="8" height="20" rx="4" fill="#c49a6c"/>
    <ellipse cx="30" cy="50" rx="14" ry="12" fill="#c49a6c"/>
    <rect x="22" y="56" width="10" height="18" rx="4" fill="#c49a6c"/>
    <ellipse cx="53" cy="46" rx="4" ry="4.5" fill="#1a0a2e"/>
    <circle cx="54" cy="44" r="1.8" fill="#fff"/>
    <path d="M28 46 Q28 38 30 34 Q34 28 38 32" stroke="#8b6914" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M26 32 Q30 26 38 32" stroke="#1a0a2e" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M86 54 Q96 48 98 58 Q96 68 86 66" stroke="#c49a6c" stroke-width="5" fill="none"/>`;
}

function dragonSVG(c) {
  return `
    <ellipse cx="60" cy="55" rx="28" ry="20" fill="${c}" opacity=".7"/>
    <ellipse cx="60" cy="42" rx="18" ry="16" fill="${c}" opacity=".8"/>
    <path d="M42 38 Q34 24 38 16 Q44 10 48 20 Q50 28 46 36 Z" fill="${c}" opacity=".75"/>
    <path d="M78 38 Q86 24 82 16 Q76 10 72 20 Q70 28 74 36 Z" fill="${c}" opacity=".75"/>
    <ellipse cx="52" cy="40" rx="4.5" ry="5" fill="#fbbf24"/>
    <ellipse cx="68" cy="40" rx="4.5" ry="5" fill="#fbbf24"/>
    <circle cx="53" cy="38" r="2" fill="#1a0a2e"/>
    <circle cx="69" cy="38" r="2" fill="#1a0a2e"/>
    <path d="M50 52 Q60 58 70 52" stroke="#1a0a2e" stroke-width="1.5" fill="none"/>
    <text x="56" y="56" font-size="9" fill="#ef4444">🔥</text>
    <path d="M60 62 Q50 72 46 84" stroke="${c}" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>
    <path d="M60 62 Q70 72 74 84" stroke="${c}" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>
    <path d="M82 56 Q98 46 100 62 Q94 72 80 66" fill="${c}" opacity=".5"/>`;
}

// ── Speedlines ─────────────────────────────────────────────────
function speedlinesSVG(color = '#9333ea') {
  const lines = [];
  const cx = 60, cy = 50;
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const r1 = 25 + Math.random() * 12;
    const r2 = 80 + Math.random() * 20;
    const x1 = cx + Math.cos(angle) * r1;
    const y1 = cy + Math.sin(angle) * r1;
    const x2 = cx + Math.cos(angle) * r2;
    const y2 = cy + Math.sin(angle) * r2;
    lines.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${(0.3+Math.random()*0.7).toFixed(2)}" opacity="0.22"/>`);
  }
  return `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">${lines.join('')}</svg>`;
}

// ── Scena domyślna (fallback) ──────────────────────────────────
function defaultScene(d, c) {
  // Spróbuj dopasować na podstawie emoji
  const emojiScenes = {
    '🍚':'taberu','🥤':'nomu','😴':'neru','☀️':'okiru',
    '🌸':'ageru','🎁':'morau','🔍':'sagasu',
    '❤️':'suki da','💡':'wakaru','🧠':'shiru',
    '😂':'warau','😭':'naku','🎤':'utau',
  };
  if (emojiScenes[d.e] && WORD_SCENES[emojiScenes[d.e]]) {
    return WORD_SCENES[emojiScenes[d.e]](c);
  }
  // Fallback kategoria
  const moodByCat = {
    cz1:'excited', cz2:'happy', cz3:'firm', cz4:'thinking',
    cz5:'calm', cz6:'blush', dom1:'calm', dom2:'happy',
    nat1:'dreamy', nat2:'dreamy', zw1:'happy', zw2:'excited',
    ani1:'heroic', ani2:'heroic', ani3:'excited', extra:'thinking',
  };
  const eyesByCat = {
    cz1:'sparkle', cz2:'sparkle', cz3:'sharp', cz4:'closed',
    cz5:'normal', cz6:'hearts', dom1:'normal', dom2:'sparkle',
    nat1:'closed', nat2:'sparkle', zw1:'sparkle', zw2:'sparkle',
    ani1:'sharp', ani2:'sharp', ani3:'sparkle', extra:'closed',
  };
  const mood = moodByCat[d.cat] || 'happy';
  const eyes = eyesByCat[d.cat] || 'sparkle';
  return `${akemiChibi(c, mood === 'firm' ? 'firm' : mood === 'blush' ? 'open' : 'smile', eyes, 40, 48, 0.85)}
    <text x="70" y="42" font-size="22">${d.e}</text>
    <text x="14" y="22" font-family="serif" font-size="12" fill="${c}" opacity=".55" font-weight="bold">${d.r.slice(0,2)}</text>`;
}

// ── Główna funkcja: buduje SVG sceny ──────────────────────────
function buildSceneSVG(d) {
  const c = CAT_COLORS[d.cat] || '#9333ea';
  const sceneFn = WORD_SCENES[d.r.toLowerCase()];
  const inner = sceneFn ? sceneFn(c) : defaultScene(d, c);
  return `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style="display:block">${inner}</svg>`;
}

// ── Tworzenie karty manga ──────────────────────────────────────
function makeMangaCard(d) {
  const ci = catInfo(d.cat);
  const catColor = CAT_COLORS[d.cat] || '#9333ea';
  const sfx = CAT_SFX[d.cat] || 'NANI?!';
  const isFav = favs.has(d.r);

  const card = document.createElement('div');
  card.className = 'manga-card';
  card.style.setProperty('--cat-color', catColor);

  card.innerHTML = `
    <div class="manga-panel manga-panel-main">
      ${speedlinesSVG(catColor)}

      <div class="manga-sfx">${sfx}</div>

      <!-- Ilustracja sceny -->
      <div class="manga-scene-wrap">
        ${buildSceneSVG(d)}
      </div>

      <!-- Słowo + tłumaczenia -->
      <div class="manga-word-wrap">
        <div class="manga-speech-bubble">
          <div class="manga-bubble-content">
            <span class="manga-word-jp">${d.r}</span>
          </div>
          <div class="manga-bubble-tail"></div>
        </div>
        <div class="manga-word-pl">${d.pl}</div>
        <div class="manga-word-en">${d.en}</div>
        <div class="manga-emoji-badge">${d.e}</div>
      </div>

      <!-- Przyciski akcji -->
      <div class="manga-actions">
        <button class="manga-act-btn" onclick="event.stopPropagation();speakTextLoud('${d.r}')" title="Wymów">🔊</button>
        <button class="manga-act-btn ${isFav ? 'faved' : ''}" onclick="event.stopPropagation();toggleFav('${d.r}',this);this.classList.toggle('faved')" title="Skarbiec">⭐</button>
      </div>

      <!-- Stempel kategorii -->
      <div class="manga-cat-stamp" style="color:${catColor};border-color:${catColor}">${ci.label.split(':')[0]}</div>

      <div class="manga-click-hint">▼ kliknij</div>
    </div>

    <!-- PANEL 2: Rozwinięcie -->
    <div class="manga-panel manga-panel-detail" style="display:none">
      <div class="manga-panel-inner">
        <div class="manga-detail-header">
          <span class="manga-detail-sfx">HIMITSU!</span>
          <span class="manga-detail-title">秘密</span>
        </div>

        <div class="manga-detail-grid">
          <div class="manga-detail-bubble ety">
            <div class="manga-detail-label">📜 Etymologia</div>
            <div class="manga-detail-val">${d.ety || 'Pradawny rdzeń japoński.'}</div>
          </div>

          <div class="manga-detail-bubble ex">
            <div class="manga-detail-label">💬 Przykład</div>
            <div class="manga-ex-jp">${d.ex || '—'}</div>
            <div class="manga-ex-pl">${d.expl || ''}</div>
            ${d.ex ? `<button class="manga-speak-btn" onclick="event.stopPropagation();speakTextLoud('${(d.ex||'').replace(/'/g,"\\'")}')">🔊 Wymów</button>` : ''}
          </div>

          <div class="manga-detail-bubble fun">
            <div class="manga-detail-label">✨ Sekret Akemi</div>
            <div class="manga-detail-val">${d.fun || 'Sekrety tej runy czekają na odkrycie...'}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  card.addEventListener('click', function(e) {
    if (e.target.closest('button')) return;
    const detail = this.querySelector('.manga-panel-detail');
    const hint = this.querySelector('.manga-click-hint');
    const isOpen = detail.style.display !== 'none';
    detail.style.display = isOpen ? 'none' : 'block';
    hint.textContent = isOpen ? '▼ kliknij' : '▲ zwiń';
    this.classList.toggle('manga-card-open', !isOpen);
  });

  return card;
}

// ── speakTextLoud — zawsze pełna głośność, niezależnie od tła ──
function speakTextLoud(t, lang = 'ja-JP') {
  if (!window.speechSynthesis || !t) return;
  window.speechSynthesis.cancel();

  const doSpeak = () => {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) {
      setTimeout(doSpeak, 200);
      return;
    }

    const jpVoices = voices.filter(v => v.lang.startsWith('ja'));
    let chosenVoice = null;
    let textToSpeak = t;
    let chosenLang = lang;

    if (jpVoices.length) {
      const jpFemaleNames = ['haruka','nanami','ayumi','kyoko','sayaka','mizuki','otoya','female','woman','google 日本語'];
      const jpMaleNames = ['ichiro','hattori','male','man'];
      chosenVoice = jpVoices.find(v => jpFemaleNames.some(k => v.name.toLowerCase().includes(k)))
                 || jpVoices.find(v => !jpMaleNames.some(k => v.name.toLowerCase().includes(k)))
                 || jpVoices[0];
      chosenLang = chosenVoice.lang;
      // Konwertuj romaji → kana jeśli dostępna funkcja
      if (typeof toKana === 'function') textToSpeak = toKana(t);
    } else {
      const femaleKw = ['female','woman','zira','hazel','susan','samantha','victoria','kate','karen','allison','paulina','zosia','alice','anna','julia','tessa','fiona','moira','google polski','google english'];
      chosenVoice = voices.find(v => femaleKw.some(k => v.name.toLowerCase().includes(k))) || voices[0];
      textToSpeak = t.toLowerCase();
      chosenLang = chosenVoice ? chosenVoice.lang : 'en-US';
    }

    const u = new SpeechSynthesisUtterance(textToSpeak);
    if (chosenVoice) u.voice = chosenVoice;
    u.lang = chosenLang;
    u.rate = 0.8;
    u.pitch = 1.1;
    u.volume = 1.0;   // ← zawsze maksymalna głośność TTS, niezależnie od tła
    speechSynthesis.speak(u);
  };

  doSpeak();
}

// ── Grid manga ─────────────────────────────────────────────────
function renderMangaGrid(filtered) {
  const gridContainer = document.getElementById('grid-container');
  gridContainer.innerHTML = '';

  if (filtered.length === 0) {
    gridContainer.innerHTML = '<div style="padding:40px;text-align:center;color:var(--parchment3);font-style:italic;">Żaden zwój nie pasuje do zaklęcia...</div>';
    return;
  }

  const grouped = {};
  filtered.forEach(d => {
    const label = catInfo(d.cat).label;
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(d);
  });

  for (const [catName, items] of Object.entries(grouped)) {
    const header = document.createElement('h3');
    header.className = 'lexicon-category-title manga-cat-header';
    header.innerHTML = `<span class="manga-cat-bracket">【</span>${catName}<span class="manga-cat-bracket">】</span>`;
    gridContainer.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'manga-grid';
    items.forEach(d => grid.appendChild(makeMangaCard(d)));
    gridContainer.appendChild(grid);
  }
}

// ── Toggle trybu ───────────────────────────────────────────────
function toggleMangaMode() {
  mangaMode = !mangaMode;
  const btn = document.getElementById('manga-toggle-btn');
  const subtitle = document.querySelector('#page-slownik .section-subtitle');

  if (mangaMode) {
    btn.classList.add('manga-btn-active');
    btn.innerHTML = '📖 Tryb Manga: ON';
    if (subtitle) subtitle.textContent = 'Każde słówko ożywa w swojej scenie. Kliknij kartę, by odkryć sekret!';
    document.getElementById('grid-container').classList.add('manga-mode-active');
  } else {
    btn.classList.remove('manga-btn-active');
    btn.innerHTML = '📖 Tryb Manga';
    if (subtitle) subtitle.textContent = 'Antyczne glify poszeregowane wedle przeznaczenia. Kliknij kartę, aby rozwinąć jej sekrety!';
    document.getElementById('grid-container').classList.remove('manga-mode-active');
  }

  renderGrid();
}

// ── Patch renderGrid() ─────────────────────────────────────────
const _originalRenderGrid = renderGrid;
renderGrid = function() {
  if (!mangaMode) {
    _originalRenderGrid();
    return;
  }
  const q = document.getElementById('search').value.toLowerCase();
  let filtered = ALL_WORDS.filter(d => {
    if (d.cat === 'extra' && activeCat !== 'extra' && activeCat !== 'all') return false;
    const mc = activeCat === 'all' || d.cat === activeCat;
    const mq = !q || d.pl.toLowerCase().includes(q) || d.r.toLowerCase().includes(q);
    return mc && mq;
  });
  document.getElementById('stats-line').textContent = `Zwoje w zasięgu wzroku: ${filtered.length}`;
  renderMangaGrid(filtered);
};
