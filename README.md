# 📜 Wielka Biblioteka Arkanów

> *Mroczna platforma do nauki języka japońskiego osadzona w estetyce dark fantasy / isekai.*

<p align="center">
  <strong>秘 · Nihongo Arcana Codex · 秘</strong><br>
  <em>"Każde słowo to zaklęcie. Każda partykuła to runa. Każdy uczeń to adept."</em>
</p>

---

## ✦ O Projekcie

**Wielka Biblioteka Arkanów** to interaktywna aplikacja webowa do nauki japońskiego, która łączy klasyczną metodologię językową (słownictwo, gramatyka, wymowa, immersja) z gamifikacją w klimacie mrocznej magii i światów isekai.

Projekt powstał jako próba odpowiedzi na pytanie: **czy nauka języka może być przygodą, a nie obowiązkiem?**

W odróżnieniu od typowych aplikacji w stylu Duolingo, każdy moduł jest osadzony w spójnym świecie narracyjnym — Mistrzyni Akemi prowadzi adepta przez Bibliotekę, oceniając jego postępy i odkrywając kolejne zwoje wiedzy.

---

## 🎴 Funkcjonalności

Aplikacja składa się z **dziesięciu modułów funkcjonalnych**:

| Moduł | Opis |
|-------|------|
| 📚 **Leksykon Słów** | Baza 238 słówek z wyszukiwarką, kategoriami, etymologią i ciekawostkami |
| 🗺️ **Mapa Świata** | Interaktywna mapa SVG z 7 regionami i progresją bohatera |
| ✦ **Księga Arkanów** | Animowana księga 3D z trzema rozdziałami gramatyki |
| ⚔️ **Próba Dojo** | 4 tryby quizów + tryb Hardcore z 3 życiami |
| 🗡️ **Kiai (Wymowa)** | Trening wymowy z Web Speech API (3 poziomy trudności) |
| ✏️ **Stół Alchemiczny** | Konstruktor zdań ze schematem SOV i sprawdzaniem składni |
| 🎴 **Zwoje Mądrości** | Krótkie historie isekai z klikalnymi słowami |
| 🎭 **Sceny Roleplay** | Dialogi immersyjne z postaciami NPC (Gemini API) |
| 🔮 **Mistrzyni Akemi** | AI Chatbot z trzystopniowym fallbackiem (Gemini → RAG → lokalny) |
| 🏛️ **Gildia Adepta** | Karta gildii, SRS, dashboard, system klas, skarbiec |

---

## 🛠️ Stos Technologiczny

### Frontend
- **Vanilla JavaScript** (bez frameworków) — ~9500 linii kodu
- **CSS3** z animacjami 3D, custom properties, motywami
- **Web Speech API** (rozpoznawanie mowy + TTS)
- **localStorage** do persystencji stanu

### Backend (opcjonalny)
- **Flask + Python** — serwer RAG
- **ChromaDB** — baza wektorowa do osadzeń
- **Ollama (Llama 3)** — lokalny model językowy
- **Google Gemini 2.5 Flash** — alternatywa cloudowa

---

## ⚠️ Ważne: Tryby Działania

Aplikacja działa w **trzech trybach** w zależności od konfiguracji:

### Tryb 1: GitHub Pages (publiczny demo)
✅ **Działa od razu, bez instalacji:**
- Wszystkie moduły wizualne i interaktywne
- Leksykon, Dojo, Kiai, Mapa, Księga, Zwoje, Gildia
- Lokalna magia Akemi (heurystyki słownikowe)

❌ **Nie działa bez konfiguracji:**
- Pełny chat z Akemi (RAG) — wymaga lokalnego serwera Pythona
- Sceny Roleplay — wymagają klucza Gemini API

### Tryb 2: Z kluczem Gemini API (zalecane dla recenzji)
✅ **Wszystko z trybu 1 + dodatkowo:**
- Pełny chat z Akemi przez Oko Wyroczni
- Sceny Roleplay z odpowiedziami NPC
- Naturalne odpowiedzi po polsku i japońsku

📝 **Klucz uzyskasz za darmo na:** [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Tryb 3: Pełny lokalny (developerski)
✅ **Wszystko z trybu 2 + dodatkowo:**
- Lokalny RAG z ChromaDB i Ollamą
- Działa offline (poza Gemini API)
- Pełna kontrola nad modelem

---

## 🚀 Instalacja i Uruchomienie

### Opcja A: Tylko frontend (najszybsza)

```bash
git clone https://github.com/TWOJ-USERNAME/wielka-biblioteka-arkanow.git
cd wielka-biblioteka-arkanow
```

Otwórz `index.html` w przeglądarce **Chrome** lub **Edge** (Web Speech API nie działa w Firefox/Safari).

> 💡 **Wskazówka:** Możesz też uruchomić lokalny serwer:
> ```bash
> python -m http.server 8000
> ```
> Następnie otwórz `http://localhost:8000` w przeglądarce.

### Opcja B: Z serwerem RAG (pełna funkcjonalność)

**Wymagania:**
- Python 3.9+
- [Ollama](https://ollama.com/) z pobranym modelem `llama3`

**Kroki:**

1. Zainstaluj zależności Pythona:
```bash
pip install flask flask-cors chromadb requests
```

2. Pobierz model Llama 3 przez Ollamę:
```bash
ollama pull llama3
```

3. Uruchom serwer RAG (w osobnym terminalu):
```bash
python rag_server.py
```

4. Otwórz `index.html` w przeglądarce.

> 🔮 Jeśli serwer RAG działa, frontend automatycznie wykryje go na `http://localhost:5000` i przekieruje do niego zapytania chatu.

### Opcja C: Z kluczem Gemini API (kompromis)

1. Otwórz `index.html` w przeglądarce.
2. Przejdź do zakładki **🔮 Mistrzyni**.
3. Kliknij **🔑 Klucz API** na pasku Oka Wyroczni.
4. Wklej klucz Gemini API (zaczyna się od `AIza...`).
5. Włącz Oko Wyroczni — gotowe.

> 🔒 **Bezpieczeństwo:** Klucz zapisuje się tylko w `localStorage` Twojej przeglądarki. Nie jest wysyłany nigdzie poza endpointami Google Gemini.

---

## 📂 Struktura Projektu

```
wielka-biblioteka-arkanow/
├── index.html              # Główny szkielet aplikacji (10 widoków)
├── style.css               # Styl (motywy, animacje 3D, particle effects)
├── app.js                  # Logika modułów (~4100 linii, ~173 funkcje)
├── data.js                 # Dane (słówka, kategorie, sceny, zwoje)
├── manga.js                # Tryb manga dla leksykonu
├── rag_server.py           # Serwer RAG (Flask + ChromaDB + Ollama)
├── The_Keeper_s_Ledger.mp3 # Muzyka ambient
├── filmik.mp4              # Wideo Mistrzyni (slajd powitalny)
├── filmik2.mp4             # Wideo Mistrzyni (chat)
├── grok-video-*.mp4        # Wideo intro
└── ocena.html              # Recenzja projektu (osobny dokument)
```

---

## 🎯 Wymagania Przeglądarki

| Funkcja | Chrome / Edge | Firefox | Safari |
|---------|:-------------:|:-------:|:------:|
| Wszystkie moduły wizualne | ✅ | ✅ | ✅ |
| TTS (Mistrzyni czyta) | ✅ | ✅ | ⚠️ |
| Web Speech API (Kiai, Echo) | ✅ | ❌ | ❌ |
| Animacje 3D | ✅ | ✅ | ✅ |

> ⚔️ **Zalecana przeglądarka:** Chrome lub Edge na komputerze.

---

## 📊 Statystyki Kodu

```
index.html       710 linii   — szkielet 10 widoków
style.css      2,975 linii   — estetyka i animacje
app.js         4,119 linii   — logika modułów
data.js          712 linii   — baza słownictwa
manga.js       1,015 linii   — tryb manga
rag_server.py    186 linii   — backend RAG
─────────────────────────────────
ŁĄCZNIE        9,717 linii kodu
```

---

## 🎨 Filozofia Projektu

Każda decyzja projektowa była podporządkowana trzem zasadom:

1. **Spójność estetyczna** — od wrót zamku przez świeczniki po krawędzie kart, wszystko służy jednej wizji.
2. **Komplementarność modułów** — każdy moduł pokrywa inny aspekt nauki języka (słownictwo, gramatyka, wymowa, immersja, retencja).
3. **Honest disclosure** — aplikacja sama informuje o ograniczeniach (brak Web Speech API, RAG offline, niepoprawny klucz API).

---

## 🔮 Roadmap

- [ ] Próg podobieństwa w ChromaDB (filtrowanie po `distances`)
- [ ] Walidacja długości wiadomości czatu
- [ ] Konfiguracja modelu Ollamy w `.env`
- [ ] Testy responsywności mobilnej (`@media (max-width:600px)`)
- [ ] Per-user historia konwersacji w RAG
- [ ] Smoke testy (pytest + Jest)
- [ ] Eksport postępów do pliku JSON

---

## 📜 Licencja

Projekt edukacyjny. Wszystkie teksty, ilustracje i muzyka stworzone na potrzeby pracy.

Materiały zewnętrzne:
- **Google Fonts** (Cinzel, Cormorant Garamond, Noto Serif JP, JetBrains Mono)
- **Font Awesome 6.5** (ikonografia)
- **Pollinations.ai** (generowane tła hero)

---

## 👤 Autor

**Maciek** — Student psychologii, IV rok, Polska.

Projekt zrealizowany w ramach zainteresowań na styku UI/UX, edukacji językowej i AI.

---

<p align="center">
  <strong>完</strong><br>
  <em>"Wiedza jest mocą. Mistrzostwo jest zaklęciem."</em>
</p>
