# MajsterAssistance 🛠️

> **Aplikacja webowa wspomagająca wycenę prac remontowo-budowlanych, łącząca LLM (Google Gemini) z deterministycznymi stawkami wykonawcy.**
> *Projekt pracy inżynierskiej*

---

## 📌 O projekcie

System wspomagający niezależnych wykonawców (majstrów) oraz amatorów budowlanych w szybkiej estymacji i kosztorysowaniu robót. Aplikacja łączy niedeterministyczną wiedzę generatywnej sztucznej inteligencji (LLM) z deterministycznymi danymi o stawkach i kosztach robocizny przechowywanymi w relacyjnej bazie danych.

### Kluczowe funkcjonalności

**Strefa Publiczna (dla Amatorów):**
- Czat z Asystentem Technicznym — na podstawie opisu prac generuje szczegółową checklistę zadań, szacowany czas realizacji oraz listę potrzebnych materiałów.

**Strefa Autoryzowana (dla Profesjonalistów):**
- Rejestracja i logowanie (JWT).
- Personalizacja stawek robocizny (stawka godzinowa i narzut na materiały, osobno dla każdej kategorii prac).
- Generator kosztorysów — hybrydowa estymacja łącząca wynik AI z własnymi stawkami.
- Pełna edycja pozycji kosztorysu (ręczna korekta godzin, stawki, kosztu materiału) z automatycznym przeliczaniem sumy.
- Workflow statusu kosztorysu (szkic / wysłany / zaakceptowany / odrzucony).
- Ciemny i jasny motyw interfejsu.

---

## 🧠 Warstwa inżynierska (serce pracy)

- **Prompt Engineering & JSON Mode** — model Gemini zwraca dane wyłącznie w ustrukturyzowanym formacie JSON, zgodnym z zdefiniowanym schematem (`responseSchema`), co eliminuje potrzebę parsowania swobodnego tekstu.
- **Walidacja danych z AI** — zanim wynik trafi do bazy, serwer sprawdza, czy liczby zwrócone przez model mieszczą się w rozsądnym zakresie (np. godziny, ceny materiałów), co chroni przed błędami modelu i próbami manipulacji treścią zapytania (prompt injection).
- **Hybrydowa Estymacja Kosztów** — serce aplikacji: `koszt_robocizny = godziny_oszacowane_przez_AI × stawka_godzinowa_majstra`, `koszt_materiału = ilość × cena_jednostkowa × (1 + narzut_majstra%)`. Estymacja AI (niedeterministyczna) jest zawsze mnożona przez dane z relacyjnej bazy SQLite (deterministyczne).
- **BYOK (Bring Your Own Key)** — klucz API użytkownika nigdy nie jest zapisywany po stronie serwera ani logowany; przechodzi przez backend wyłącznie w ramach pojedynczego żądania.

---

## 🛠️ Stack technologiczny

- **Frontend:** HTML5, Vanilla JavaScript (SPA z własnym routerem opartym o hash), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Baza danych:** SQLite (wbudowany moduł `node:sqlite` — zero zależności natywnych)
- **Integracja AI:** Google Gemini API (`@google/generative-ai`), tryb BYOK

## 🔒 Bezpieczeństwo

- Hasła hashowane przez `crypto.scrypt` (wbudowany moduł Node, bez natywnych zależności).
- Autoryzacja przez JWT, rate limiting na endpointach logowania i generowania AI.
- Nagłówki bezpieczeństwa (CSP, itd.) przez `helmet`.
- Każdy użytkownik ma dostęp wyłącznie do własnych stawek i kosztorysów (weryfikacja własności na poziomie API).

---

## 🚀 Uruchomienie lokalne

```bash
npm install
cp .env.example .env    # uzupełnij JWT_SECRET własną losową wartością
npm run dev
```

Aplikacja wystartuje na **http://localhost:3000**. Do korzystania z Asystenta i generatora kosztorysów potrzebny jest własny, darmowy klucz API Gemini ([aistudio.google.com/apikey](https://aistudio.google.com/apikey)).

## 📁 Struktura projektu

```
src/
  config/      — konfiguracja bazy danych
  models/      — zapytania SQL (warstwa dostępu do danych)
  services/    — logika biznesowa (w tym hybrydowa estymacja i integracja z AI)
  controllers/ — obsługa żądań HTTP
  routes/      — definicje endpointów API
  middleware/  — autoryzacja, rate limiting, obsługa błędów
database/
  schema.sql   — schemat bazy SQLite
public/
  index.html   — jedyna powłoka SPA
  js/dashboard/ — router, widoki i logika frontendu
```

---

## 👤 Autor
* *Filip Ochał*
* *Promotor: dr hab. inż. Krzysztof Pancerz*
