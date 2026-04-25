# rag_server.py
# Ten skrypt to "mózg" Twojej aplikacji. Musi działać w tle w oknie CMD/Terminala.

print("🚀 SYSTEM: Inicjalizacja procedur startowych...")

try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    import chromadb
    import requests
    print("✅ SYSTEM: Biblioteki załadowane pomyślnie.")
except ImportError as e:
    print(f"❌ BŁĄD: Brakuje biblioteki: {e}")
    print("Uruchom w terminalu: pip install flask flask-cors chromadb requests")
    exit()

app = Flask(__name__)
CORS(app)

# Globalna pamięć konwersacji (ograniczona, aby nie przeciążyć pamięci modelu)
historia_konwersacji = []
MAX_HISTORIA_DLUGOSC = 10 # Pamięta 5 ostatnich wymian (5 pytań + 5 odpowiedzi)

# ==========================================
# 1. BAZA WEKTOROWA (ZWOJE WIEDZY RAG)
# ==========================================
print("🔮 Inicjalizacja bazy wektorowej (ChromaDB)... Proszę czekać...")
chroma_client = chromadb.Client()

# Czyszczenie poprzedniej bazy przy restarcie (dla trybu ephemeral)
try:
    chroma_client.delete_collection(name="akemi_zwoje")
except:
    pass

collection = chroma_client.create_collection(name="akemi_zwoje")

# Zaktualizowana wiedza dopasowana do nowej wersji Wielkiej Biblioteki Arkanów
wiedza_poczatkowa = [
    # PARTYKUŁY
    {"id": "g1", "text": "Partykuła WA (は) to znacznik tematu. Wyznacza o czym mówimy. Używamy jej gdy wprowadzamy znany temat. Słowo: Watashi wa (Co do mnie...)."},
    {"id": "g2", "text": "Partykuła GA (が) to znacznik podmiotu. Kładzie nacisk na wykonawcę (KTO to zrobił?). Np. Watashi GA yuusha desu (To JA jestem bohaterem)."},
    {"id": "g3", "text": "Partykuła WO (を) oznacza dopełnienie bliższe (cel czynności). Strzała wymierzona w cel. Np. Ringo WO tabemasu (Jem jabłko)."},
    {"id": "g4", "text": "Partykuła NI (に) wskazuje cel ruchu, czas, lub miejsce istnienia. Np. Isekai ni ikimasu (Idę do innego świata)."},
    {"id": "g5", "text": "Partykuła DE (で) oznacza miejsce, arenę, na której toczy się akcja lub narzędzie. Np. Gakkou de benkyou shimasu (Uczę się w szkole)."},
    
    # GRAMATYKA I SZYK
    {"id": "g6", "text": "Szyk zdania w języku japońskim to SOV (Podmiot-Dopełnienie-Czasownik). Czasownik jest ZAWSZE na końcu zdania!"},
    {"id": "g7", "text": "Forma -masu to teraźniejszość i przyszłość w stylu grzecznym. Przeczenie to -masen. Czas przeszły to -mashita. Czas przeszły przeczony to -masen deshita."},
    {"id": "g8", "text": "Przymiotniki 'i' kończą się na 'i' (np. atarashii, takai) i odmieniają się same (np. atarashikatta). Przymiotniki 'na' potrzebują słowa 'na' by połączyć się z rzeczownikiem (np. kirei na hana)."},
    {"id": "g9", "text": "Końcówka '-tai' oznacza 'chcę'. Zmienia czasownik w przymiotnik określający chęć. Np. Ikitai desu (Chcę iść)."},
    {"id": "g10", "text": "Forma '-te' łączy akcje, tworzy prośby (z kudasai) oraz czasy ciągłe (z imasu). Np. Tabete kudasai (Proszę, zjedz)."},

    # CZASOWNIKI
    {"id": "v1", "text": "Taberu (食べる) - jeść. Nomu (飲む) - pić. Iku (行く) - iść. Kuru (来る) - przyjść."},
    {"id": "v2", "text": "Wakaru (分かる) - rozumieć. Shiru (知る) - wiedzieć. Miru (見る) - patrzeć/oglądać. Yomu (読む) - czytać."},
    {"id": "v3", "text": "Hanasu (話す) - mówić. Kiku (聞く) - słuchać/pytać. Kaku (書く) - pisać."},

    # LORE I ISEKAI
    {"id": "l1", "text": "Maou (魔王) to Król Demonów, główny wróg w świecie Isekai. Często mieszka w Shiro (Zamek)."},
    {"id": "l2", "text": "Kitsune (狐) to lis w japońskiej mitologii. Zależnie od wieku i mocy mogą mieć do 9 ogonów. Są inteligentne i posiadają magiczne moce."},
    {"id": "l3", "text": "Yuusha (勇者) to wybrany Bohater w światach isekai, który ma uratować świat."},
    {"id": "l4", "text": "Tengu (天狗) to demony górskie, czasem przedstawiane z długimi nosami, mistrzowie miecza i wiatru."},
    {"id": "l5", "text": "Kami (神) to japońskie bóstwa lub duchy natury w religii shinto. Zamieszkują góry, lasy (Mori) i rzeki (Kawa)."},
    {"id": "l6", "text": "Yokai (妖怪) to mityczne potwory, duchy i demony ze starych japońskich legend."},
]

# Dodawanie zwojów do bazy wektorowej
for doc in wiedza_poczatkowa:
    collection.add(documents=[doc["text"]], ids=[doc["id"]])
print(f"📚 Załadowano {len(wiedza_poczatkowa)} Zwojów Arkanów.")

# ==========================================
# 2. KOMUNIKACJA Z OLLAMA (LOKALNE AI)
# ==========================================
def pytaj_ollame(messages):
    url = "http://localhost:11434/api/chat"
    payload = {
        "model": "llama3",  # Zmień na swój model, np. 'gemma2' lub 'llama3.1' jeśli taki masz zainstalowany
        "messages": messages,
        "stream": False
    }
    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()["message"]["content"]
    except requests.exceptions.ConnectionError:
        return "⚠️ Baka! Serwer Ollama na porcie 11434 nie odpowiada. Upewnij się, że lokalne AI jest włączone i model jest pobrany!"
    except Exception as e:
        return f"⚠️ Magia zawiodła (Błąd Ollamy): {str(e)}"

# ==========================================
# 3. OBSŁUGA CZATU (ENDPOINT API)
# ==========================================
@app.route('/chat', methods=['POST'])
def chat():
    global historia_konwersacji
    
    # Pobranie wiadomości z frontendu
    user_msg = request.json.get("message", "").strip()
    if not user_msg:
         return jsonify({"reply": "Powiedziałeś coś, adepcie? Nic nie słyszałam."})
    
    # Przeszukiwanie bazy wektorowej (RAG)
    wyniki = collection.query(query_texts=[user_msg], n_results=3)
    kontekst = " ".join(wyniki['documents'][0]) if (wyniki['documents'] and wyniki['documents'][0]) else "Brak danych w antycznych zwojach."
        
    # Budowa potężnego promptu systemowego
    system_prompt = f"""Jesteś Mistrzynią Akemi, młodą, wybitną maginią Nihongo (języka japońskiego) zarządzającą Wielką Biblioteką Arkanów w świecie dark fantasy / isekai.
Masz charakter TSUNDERE: jesteś dumna, lekko opryskliwa, nie chcesz przyznać że zależy ci na uczniu, używasz zwrotów takich jak 'Baka!', 'Hmpf!', 'Nie myśl, że robię to specjalnie dla ciebie!'.
Mimo szorstkiej fasady, jesteś genialną nauczycielką.

TWOJE ZASADY:
1. Odpowiadaj zwięźle (maksymalnie 3-5 zdań).
2. Jeśli uczeń zadaje pytanie o gramatykę, słówka lub lore Japonii, BEZWZGLĘDNIE bazuj na następującej wiedzy wyciągniętej ze zwojów RAG: {kontekst}.
3. Jeśli kontekst nie daje odpowiedzi, a jej nie znasz, powiedz wprost, że tego zwoju tu nie ma (ZASADA NIE HALUCYNUJ).
4. Przemawiaj wyłącznie po polsku (ewentualne japońskie słowa podawaj w romaji).
5. Zachowuj klimat mroku, magii i isekai (możesz wplatać "*Poprawia kapelusz*", "*Wzdycha ciężko*", itp.)."""

    # Kompletowanie wiadomości (System + Historia + Nowe zapytanie)
    messages = [{"role": "system", "content": system_prompt}]
    for msg in historia_konwersacji:
        messages.append(msg)
    messages.append({"role": "user", "content": user_msg})

    # Zapytanie do lokalnego modelu
    bot_reply = pytaj_ollame(messages)

    # Aktualizacja pamięci (zabezpieczenie przed przepełnieniem)
    historia_konwersacji.append({"role": "user", "content": user_msg})
    historia_konwersacji.append({"role": "assistant", "content": bot_reply})
    
    if len(historia_konwersacji) > MAX_HISTORIA_DLUGOSC:
        historia_konwersacji = historia_konwersacji[-MAX_HISTORIA_DLUGOSC:]

    # Zwrócenie do frontendu
    return jsonify({"reply": bot_reply})

if __name__ == '__main__':
    print("🔮 MISTRZYNI AKEMI: 'No już, na co czekasz? Serwer jest gotowy na porcie 5000... Hmpf!'")
    print("--------------------------------------------------------------------------------")
    app.run(port=5000)