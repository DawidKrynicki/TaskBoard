# Projekt: TaskBoard - System zarządzania zadaniami

## 1. Opis aplikacji
TaskBoard to system wspierający pracę zespołową, umożliwiający zarządzanie zadaniami w modelu Kanban. Aplikacja pozwala na dodawanie, przeglądanie i usuwanie zadań. Celem projektu jest zapewnienie spójnego interfejsu na różnych platformach.

## 2. Architektura systemu
System składa się z trzech współpracujących warstw:
- [cite_start]**Backend**: API REST oparte na Python (FastAPI + SQLAlchemy + SQLite)[cite: 13, 21].
- [cite_start]**PWA (Frontend)**: Aplikacja webowa z funkcją offline (Service Worker)[cite: 14, 30].
- [cite_start]**Mobile**: Aplikacja cross-platform (React Native / Expo)[cite: 15, 35].

## 3. Wybrana technologia
Wybrano stos technologiczny oparty na języku JavaScript (frontend/mobile) oraz Python (backend), co zapewnia szybki czas developmentu. [cite_start]Baza danych SQLite została wybrana ze względu na prostotę wdrożenia w projekcie semestralnym[cite: 20, 21].

## 4. Opis API (główne endpointy)
- `GET /tasks` - pobranie listy zadań (wymaga tokena JWT).
- `POST /tasks` - utworzenie nowego zadania.
- `PUT /tasks/{id}` - aktualizacja statusu zadania.
- `DELETE /tasks/{id}` - usunięcie zadania.
- [cite_start]`POST /token` - logowanie użytkownika i pobranie tokena[cite: 27, 29].

## 5. Design system
[cite_start]Zastosowano spójny design system: paleta kolorów oparta na odcieniach niebieskiego i szarości, czytelna typografia bezszeryfowa, oraz ujednolicone komponenty formularzy i kart zadań w PWA i wersji mobilnej[cite: 41, 76].

## 6. Opis funkcjonalności
- Obsługa CRUD dla zadań.
- [cite_start]System uwierzytelniania oparty na JWT[cite: 29].
- Tryb offline w PWA.
- [cite_start]Funkcja natywna: pobieranie lokalizacji GPS w aplikacji mobilnej[cite: 32, 39].

## 7. Zabezpieczenia
- [cite_start]Zastosowano mechanizm JWT (JSON Web Token) do autoryzacji zapytań[cite: 94].
- Zabezpieczono endpointy przed dostępem osób nieupoważnionych (wymagany `Authorization: Bearer <token>`).
- [cite_start]Walidacja danych wejściowych po stronie backendu[cite: 95].

## 8. Testowanie
Przeprowadzono testy funkcjonalne API (via Postman) oraz testy integracyjne połączenia aplikacji mobilnej z backendem. [cite_start]Aplikacja przechodzi pozytywnie testy logowania oraz operacji CRUD[cite: 102, 103].

