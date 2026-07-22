## 🚀 Arrr-Dash App

<img width="2419" height="1840" alt="arrr-dash" src="https://github.com/user-attachments/assets/a6044001-592f-4e77-9805-95943784ee73" />


## 🚀 Arrr-Dash

Nowoczesny, przejrzysty i responsywny pulpit nawigacyjny (Dashboard) do monitorowania stanu opóźnień ping, statusu usług oraz statystyk w czasie rzeczywistym dla Twojego domowego serwera (Sonarr, Radarr, Jellyfin, Prowlarr, Bazarr, qBittorrent, Transmission, Sabnzbd i innych).

---

## 💾 Trwały Zapis Konfiguracji (Brak utraty danych po `git pull`)

Aplikacja **automatycznie zapisuje wszystkie Twoje wprowdzone adresy IP, porty oraz klucze API** na dysku w pliku `data/config.json`.

* **Trwałość danych:** Katalog `data/` jest dodany do `.gitignore`, dzięki czemu wykonanie zlecenia `git pull` aktualizuje kod aplikacji, **nie nadpisując i nie kasując Twoich prywatnych ustawień!**
* **Kopia Zapasowa JSON:** W panelu (Ustawienia -> Kopia Zapasowa Konfiguracji) możesz w dowolnym momencie kliknąć **Pobierz Backup JSON** lub **Wgraj Backup JSON**, aby przenieść lub odtworzyć konfigurację na innym serwerze jednym kliknięciem.

---

## 🛠️ Jak to działa lokalnie w sieci domowej?

Aplikacja posiada własny serwer Node.js (Express), który wykonuje rzeczywiste testy HTTP i ping bezpośrednio do Twoich lokalnych adresów IP (np. `192.168.1.150:8096`).
Gdy uruchomisz ten projekt lokalnie w swojej sieci (np. w kontenerze Proxmox LXC lub Docker), serwer uzyska natychmiastowy i bezpośredni dostęp do wszystkich Twoich urządzeń domowych!

---

## 📦 Szybka instalacja na Proxmox LXC / Linux (Dla początkujących)

Możesz uruchomić panel na dwa proste sposoby: **przez Docker Compose (Zalecane)** lub **bezpośrednio w Node.js**.

---

### Metoda 1: Docker Compose (Najprostsza & Zalecana)

Jeśli na swoim kontenerze Proxmox LXC masz zainstalowany Docker:

1. **Pobierz repozytorium z GitHub:**
   ```bash
   git clone https://github.com/gacorek/Arrr-Dash.git
   cd Arrr-Dash
   ```

2. **Uruchom kontener:**
   ```bash
   docker compose up -d
   ```

3. **Gotowe!** Panel jest dostępny w przeglądarce pod adresem:
   `http://IP_TWOJEGO_PROXMOX_LXC:3000`

---

### Metoda 2: Bezpośrednio przez Node.js (Lokalnie w kontenerze LXC)

Jeśli wolisz czysty kontener Debian/Ubuntu w Proxmox bez Dockera:

1. **Zainstaluj Node.js (wersja 18 lub wyższa) oraz Git:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt-get install -y nodejs git
   ```

2. **Pobierz projekt:**
   ```bash
   git clone https://github.com/gacorek/Arrr-Dash.git
   cd Arrr-Dash
   ```

3. **Zainstaluj zależności i zbuduj aplikację:**
   ```bash
   npm install
   npm run build
   ```

4. **Uruchom serwer:**
   ```bash
   npm start
   ```

5. **Aplikacja działa pod adresem:** `http://IP_TWOJEGO_LXC:3000`

---

## 🔄 Automatyczny autostart po restarcie Proxmox (systemd)

Jeśli chcesz, aby aplikacja w Metodzie 2 włączała się sama po uruchomieniu LXC:

1. Utwórz plik usługi:
   ```bash
   nano /etc/systemd/system/arrr-dash.service
   ```

2. Wklej poniższą konfigurację (zastąp `/root/Arrr-Dash` ścieżką do Twojego folderu):
   ```ini
   [Unit]
   Description=Arrr-Dash Dashboard
   After=network.target

   [Service]
   Type=simple
   User=root
   WorkingDirectory=/root/Arrr-Dash
   ExecStart=/usr/bin/npm start
   Restart=always
   Environment=NODE_ENV=production PORT=3000

   [Install]
   WantedBy=multi-user.target
   ```

3. Włącz i uruchom usługę:
   ```bash
   systemctl daemon-reload
   systemctl enable --now arrr-dash
   ```

---

## ⚡ Bezpieczna Aktualizacja do najnowszej wersji z GitHub

Ponieważ Twoja konfiguracja i zapisane adresy IP znajdują się w bezpiecznym pliku `data/config.json` (wykluczonym z Gita), zaktualizujesz projekt bez utraty danych:

* **Dla Dockera:**
  ```bash
  git pull
  docker compose up -d --build
  ```

* **Dla Node.js:**
  ```bash
  git pull
  npm install
  npm run build
  systemctl restart arrr-dash
  ```

---


##   🔐 Wystawianie panelu na internet (NGINX Proxy Manager – Basic Auth)


Arrr‑Dash można bezpiecznie wystawić na internet, korzystając z NGINX Proxy Manager (NPM).
Panel zawiera adresy IP, porty i klucze API, dlatego nie wolno wystawiać go bez zabezpieczeń.

✔️ 1. Dodaj nowy Proxy Host
W NPM:

Hosts → Proxy Hosts → Add Proxy Host

Domain Names: dash.twojadomena.pl

Scheme: http

Forward Hostname/IP: 192.168.1.xx

Forward Port: 3000

Zaznacz:

✔️ Block Common Exploits

✔️ Websockets Support

✔️ 2. Włącz HTTPS (Let’s Encrypt)
W zakładce SSL:

Request a new SSL Certificate

✔️ Force SSL

✔️ HTTP/2 Support

✔️ HSTS (opcjonalnie)

✔️ 3. Dodaj logowanie (Access List – Basic Auth)
W NPM:

Access List → Add Access List

Dodaj użytkownika:

Login: admin

Hasło: mocne hasło

Następnie przypisz Access List do Proxy Host.

Dzięki temu panel wymaga logowania przed wejściem.

✔️ 4. Zablokuj dostęp do API z internetu
W Proxy Host → Advanced → Custom Nginx Configuration:

 ```bash
  location /api {
    allow 192.168.0.0/16;
    allow 127.0.0.1;
    deny all;
}
  ```
Panel działa normalnie, ale API Sonarr/Radarr/Jellyfin jest dostępne tylko lokalnie.

✔️ 5. Opcjonalnie: Cloudflare Firewall
Jeśli domena jest pod Cloudflare:

DDoS protection

Bot protection

Geo‑block

Rate limiting

---

##   🗺️ Roadmap / Plany na przyszłość


[ ] Logowanie użytkowników (admin / kids)

[ ] Tryb dziecięcy – uproszczony panel tylko dla Sonarr/Radarr/Lidarr

[ ] Oddzielny layout dla dzieci (bez statystyk serwera, bez konfiguracji)

[ ] Historia opóźnień (wykresy ping)

[ ] Integracja z Bazarr API

[ ] Tryb jasny (Light Mode)

[ ] Widget mini‑statusu

[ ] Poprawka modala – test IP nie zamyka okna

[ ] Logowanie przez Google / Discord (opcjonalnie)

---

##  🐞 Znane błędy


Test IP w oknie dodawania usługi zamyka modal (poprawka w toku)

---

## 🎨 Funkcje
* 🟢 **Monitorowanie statusu w czasie rzeczywistym** – sprawdzanie opóźnień ping i dostępności serwerów.
* 💾 **Trwały zapis na serwerze (data/config.json)** – bez utraty danych po restarcie i aktualizacji z Git.
* 📥 **Export / Import kopii zapasowej JSON** – łatwe pobieranie i wgrywanie pełnej konfiguracji.
* 🚀 **Integracje Live API** – rzeczywiste statystyki aktywnej kolejki pobierania Sonarr/Radarr/Prowlarr oraz aktywnych użytkowników Jellyfin.
* 🛎️ **Powiadomienia Discord** – integracja z webhookami dla alertów awarii.
* 🔊 **Sygnały dźwiękowe** – ostrzeżenia przy spadkach dostępności serwerów.
* 🛠️ **Zarządzanie kartami** – dodawanie, edycja, usuwanie i filtrowanie usług.
* 🌗 **Nowoczesny UI** – przejrzysty, ciemny interfejs stworzony w Tailwind CSS i React.

