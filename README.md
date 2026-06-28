# Projekt: TaskBoard - System zarządzania zadaniami

## 1. Opis aplikacji
TaskBoard to aplikacja do zarządzania zadaniami w zespole (wzorowana na rozwiązaniach typu Kanban)[cite: 1]. Celem projektu było stworzenie wieloplatformowego systemu, który pozwala na dodawanie, przeglądanie i usuwanie zadań. Aplikacja zapewnia spójny interfejs oraz działanie na wielu platformach, z uwzględnieniem natywnych funkcji urządzeń mobilnych[cite: 1].

## 2. Architektura systemu
System został zaprojektowany w architekturze klient-serwer i składa się z trzech głównych modułów[cite: 1]:
*   **Backend (REST API):** Serwer centralny komunikujący się z bazą danych i autoryzujący zapytania[cite: 1].
*   **PWA (Frontend):** Aplikacja webowa dostępna z poziomu przeglądarki, wyposażona w mechanizmy Service Worker umożliwiające podstawowe działanie offline[cite: 1].
*   **Aplikacja mobilna cross-platform:** Natywna aplikacja zapewniająca dostęp do systemu z poziomu smartfona oraz wykorzystująca wbudowany moduł GPS[cite: 1].

## 3. Wybrana technologia
Wybór stosu technologicznego podyktowany był optymalizacją czasu developmentu oraz wymogami projektu[cite: 1]:
*   **Backend:** Python + FastAPI. Wybrano FastAPI ze względu na szybkość działania oraz łatwą integrację z bibliotekami do walidacji danych (Pydantic) i autoryzacji (JWT).
*   **Baza danych:** SQLite. Idealnie sprawdza się w środowisku deweloperskim i projektach semestralnych, nie wymagając skomplikowanej konfiguracji serwera bazy danych[cite: 1].
*   **PWA:** HTML, CSS, JavaScript (Vanilla). 
*   **Mobile:** React Native (środowisko Expo). Umożliwia szybkie budowanie interfejsów i eksport plików `.apk`[cite: 1].
*   **Wdrożenie (Deploy):** Backend utrzymywany na darmowym serwerze Render, PWA wdrożone na GitHub Pages, a Mobile zbudowane przez chmurę EAS (Expo)[cite: 1].

## 4. Opis API (REST)
Backend udostępnia następujące endpointy dla obu klientów[cite: 1]:
*   `POST /token` - Logowanie użytkownika (zwraca token JWT).
*   `GET /tasks` - Pobieranie listy zadań przypisanych do użytkownika.
*   `POST /tasks` - Tworzenie nowego zadania.
*   `DELETE /tasks/{id}` - Usuwanie zadania o konkretnym ID.

## 5. Design system
System korzysta ze spójnego, minimalistycznego interfejsu graficznego[cite: 1]. 
*   **Kolorystyka:** Dominujące kolory to biel (tła kart), odcienie jasnej szarości (`#f4f6f8` - tło aplikacji) oraz akcenty niebieskiego (`#0056b3`) i czerwonego (przyciski destrukcyjne).
*   **Typografia:** Czytelne czcionki bezszeryfowe, wyraźnie oddzielone nagłówki od opisów[cite: 1].
*   **Komponenty:** W PWA i aplikacji mobilnej zastosowano identyczny układ kart zadań z podziałem na tytuł, opis i status[cite: 1].

## 6. Opis funkcjonalności
System realizuje następujące funkcje[cite: 1]:
*   **CRUD Zadań:** Dodawanie, wyświetlanie i usuwanie zadań.
*   **Uwierzytelnianie:** Wspólny system logowania dla PWA i Mobile[cite: 1] (Domyślne konto: `admin` / `haslo123`).
*   **Tryb offline:** Aplikacja PWA posiada Service Worker cachujący zasoby[cite: 1].
*   **Geolokalizacja:** Aplikacja mobilna posiada natywną funkcję odczytu współrzędnych GPS z urządzenia fizycznego[cite: 1].
*   **Synchronizacja:** Zmiany wprowadzone na telefonie są widoczne w przeglądarce[cite: 1].

## 7. Zabezpieczenia
*   **Uwierzytelnianie JWT:** Wszystkie endpointy modyfikujące i pobierające zadania wymagają w nagłówku autoryzacji ważnego tokena dostępu (JSON Web Token)[cite: 1].
*   **HTTPS:** Połączenie z serwerem Render odbywa się za pomocą szyfrowanego protokołu SSL.
*   **Ochrona endpointów:** API rzuca błędy autoryzacji (401), jeśli próbuje się wykonać akcję bez logowania[cite: 1].

## 8. Testowanie
Przeprowadzono testy integracyjne łączące frontend z backendem[cite: 1]:
*   Weryfikacja poprawnego przyznawania i przechowywania tokenów JWT (AsyncStorage w mobile).
*   Testy zachowania aplikacji przy wygaszonym tokenie.
*   Manualne testy logiki dodawania i usuwania na symulatorze przeglądarkowym (PWA) oraz wygenerowanym pliku `.apk`[cite: 1].

## 9. Zrzuty ekranu
*Zrzuty ekranu ukazujące działanie PWA i aplikacji mobilnej znajdują się w folderze `docs/` w repozytorium.*[cite: 1]

## 10. Instrukcja uruchomienia
**Backend:**
1. Przejdź do folderu `backend`.
2. Uruchom `pip install -r requirements.txt`.
3. Uruchom serwer testowy: `uvicorn main:app --reload`.

**Frontend (PWA):**
1. Przejdź do folderu `pwa`.
2. Uruchom plik `index.html` przy użyciu rozszerzenia Live Server (w środowisku dev) lub wejdź na wdrożony link GitHub Pages.

**Mobile:**
1. Zainstaluj na telefonie wygenerowany plik `.apk` z repozytorium.
2. Opcjonalnie do celów deweloperskich: w folderze `mobile` uruchom `npx expo start -c` i wciśnij klawisz `w`, aby uruchomić podgląd webowy.

## 11. Napotkane problemy (Historia wdrożenia)
W trakcie budowania aplikacji natrafiono na szereg problemów, które z powodzeniem rozwiązano[cite: 1]:
*   **Agresywny cache Service Workera (PWA):** Przeglądarka ignorowała nowy kod JS zawierający panel logowania, uparcie wczytując starą wersję offline. Rozwiązanie: Ręczne wymuszenie "Clear site data" w zakładce Application w DevTools.
*   **Błąd 404 w bibliotekach JWT na produkcji:** Serwer na platformie Render nie rozpoznawał endpointu `/token`, ponieważ plik `requirements.txt` nie zawierał dopisanych później bibliotek `python-jose[cryptography]` i `python-multipart`. Po aktualizacji pliku z zależnościami, wdrożenie powiodło się.
*   **Błędy Expo Go i narzucony system routingu (Mobile):** Najnowszy szablon `create-expo-app` wymuszał architekturę nawigacyjną Expo Router (`_layout.tsx`), co powodowało konflikty ("Element type is invalid") przy próbie załadowania prostego pliku. Rozwiązanie: Usunięto zbędne pliki i foldery `(tabs)` z `src/app/`, zostawiając czysty plik `index.tsx`, po czym wyczyszczono cache (`npx expo start -c`).
*   **Błąd konfiguracji EAS Build przy budowaniu APK:** Plik `eas.json` zawierał zdublowaną sekcję `"preview"`, co uniemożliwiało kompilację w chmurze. Poprawiono strukturę JSON, wymuszając atrybut `"buildType": "apk"`, co pozwoliło wygenerować plik instalacyjny.

## 12. Możliwości rozwoju
W przyszłości aplikację można rozbudować o następujące funkcjonalności[cite: 1]:
*   Dodanie powiadomień Push (np. przez Firebase) przypominających o zaległych zadaniach[cite: 1].
*   Zastosowanie WebSockets do automatycznego, natychmiastowego odświeżania listy zadań na wszystkich urządzeniach bez konieczności przeładowywania aplikacji[cite: 1].
*   Implementacja trybu ciemnego (Dark Mode) opartego na ustawieniach systemu operacyjnego[cite: 1].