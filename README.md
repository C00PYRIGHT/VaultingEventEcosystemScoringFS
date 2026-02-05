

# VaultX – Vaulting Scoring App

**Thesis Project**

- **Student:** Bence Dániel
- **Class:** Computer Science (Programmer Informatics)

## Project Description
VaultX is a scoring system for vaulting, which combines elements of riding, gymnastics, and dance. Vaulters perform Compulsory, Freestyle, and Technical Freestyle routines on the back of a horse being led on a lunge line. The sport is regulated by the FEI (Fédération Equestre Internationale), which defines the rules and supervises their enforcement, and also determines the course of competitions and the judges' evaluation criteria and system.

The scoring is complex and based on multiple criteria:
- **Horse performance and movement quality** (For all competition types)
- **Technical execution of exercises** (For Freestyle and Technical Freestyle)
- **Quality of artistic elements during the competition** (For Freestyle and Technical Freestyle)
- **Exercise presentation quality** (For Compulsory)

This complexity is increased by the fact that the regulations allow for different categories and multiple types of competitors within them. These types are mainly Individual, Team, Pas-de-Deux (Duo), and all of these include Compulsory, Freestyle, and Technical Freestyle events.

### Purpose of the Bachelor's Thesis Project
Within the project, an application has been developed that organizes and accelerates the work of judges, scribes, and competition office staff.
- **Digitalized scoresheet entry interfaces** following FEI regulations
- **Instant score calculation and display**
- **Clear and simple data entry interfaces** to minimize human errors
- **Enables long-term data analysis**

The **VaultX ecosystem** will consist of multiple competition support software, but the bachelor's thesis project demonstrates the scoring system and its implementation.

## Scoring Module Requirements
The scoring module must support:
- Multiple categories (Individual, Team, Pas-de-Deux)
- Multiple tests (Compulsory, Free Test, Technical Test)
- Different judge roles (Horse score, Exercise score, Artistic score)
- Real-time calculation and publication of results
- Rule-based weighting (e.g., Compulsory: Horse 25%, Exercise 75%)
- Error-free data entry
- Exportable data for FEI reports

## Technology Stack
- **Node.js + Express** (application server)
- **MongoDB + Mongoose** (database)
- **EJS + express-ejs-layouts** (server-side user interface)
- **Bootstrap 5 + Bootstrap Icons** (UI styling)
- **Winston** (structured logging)
- **JWT + Sessions** (authentication and session management)

## Project Structure
```
.
├── app.js                 # Entry point
├── config/                # Configuration constants
├── controllers/           # Controller layer
├── DataServices/          # Database access
├── LogicServices/         # Scoring and calculation logic
├── middleware/            # Authentication, error handling logic
├── models/                # Mongoose models
├── routes/                # Express routes
├── static/                # Static assets (CSS, JS, images)
├── views/                 # EJS templates
├── logger.js              # Winston logging configuration
└── database/              # DB connection setup
```

## Environment Variables
The following variables are required in the `.env` file or Docker configuration:
- `MONGODB_URI` – MongoDB connection string
- `PORT` – HTTP port
- `SECRET_ACCESS_TOKEN` – JWT signing key
- `SECRET_API_KEY` – Session secret key
- `SECURE_MODE` – `true|false` (cookie security)
- `TESTDB` – `true|false` (test database switch)

## Notes
- The application uses global middleware to inject **selected event**, **alerts**, and **version** information into views.
- Logging is centralized using Winston with environment-dependent logging levels.
- EJS templates use a common layout in the `views/layouts/layout.ejs` file.

---

# VaultX – Vaulting Scoring App

**Szakdolgozati projekt**

- **Tanuló:** Bence Dániel
- **Szak:** Computer Science (Programtervező Informatikus)

## Projekt leírása
VaultX egy pontozási rendszer a vaulting (lovastorna) szakághoz amely ötvözi a lovaglás, gimnasztika és a tánc elemeit. A lovastornászok egy futószáron vezetett ló hátán bemutatnak Compulsory(kötelező), Freestyle(kűr), Techical freestyle (Technikai kűr) elemeket. A sportág az FEI (Fédération Equestre Internationale) által ellenőrzött, amely meghatározza a szabályokat és felügyeli azok betartását, továbbá a meghatározzák a verseny menetét és a bírák értékelési szempontjait és ennek rendszerét.

A pontozás komplex és több kritériumon alapul:
- **Ló teljesítmény és mozgási kép** (Minden versenyszám esetén) 
- **Technikai végrehajtása a gyakorlatoknak** (Kűr és Technikai kűr esetén)
- **Művészi elemek minősége a versenyszám alatt** (Kűr és Technikai kűr esetén)
- **Gyakorlat bemutatási minősége** (Kötelező versenyszám esetén)

Ennek a komplexitását növeli, hogy különböző kategóriák és ezekben is több típusú induló versenyzését teszi lehetővé a szabályzat. Ezeknek a típusai főként Egyéni, Csapat, Páros (Pas-de-Deux), ezeken belül valamennyi versenyszám megtalálható Kötelező, Kűr, Technikai kűr.

### Célja a szakdolgozat projektnek
A projekten belül fejlesztésre került egy applikáció amely rendezi és felgyorsítja a bírók, írnokok, versenyirodai dolgozók munkáját.
- **Digitalizált pontozólap beviteli felületek** FEI szabályzatot követve
- **Azonnali pont eredmény számítás és kijelzés** 
- **Egyértelmű és egyszerű adatbeviteli felületek** az emberi hibák minimalizálása érdekében
- **Lehetővé teszi az adatok elemzését hosszútávúan** 

A **VaultX ecosystem**, több versenytámogató szoftverből fog felépülni, de a szakdolgozati projekt a pontozási rendszer és annak a megvalósítását mutatja meg.

## Pontozó modul követelményei
A pontozó modulnak támogatnia kell:  
- Több kategóriát (Egyéni, Csapat, Pas‑de‑Deux)  
- Több tesztet (Kötelező, Szabad Teszt, Technikai Teszt)  
- Különböző bírói szerepeket (Ló pontszám, Gyakorlat pontszám, Művészi pontszám)  
- Eredmények valós idejű számítását és közzétételét  
- Szabályalapú súlyozásokat (pl. Kötelező: Ló 25%, Gyakorlat 75%)  
- Hibamentes adatbevitelt  
- Exportálható adatok az FEI jelentésekhez  

## Technológiai stack
- **Node.js + Express** (alkalmazásszerver)  
- **MongoDB + Mongoose** (adatbázis)  
- **EJS + express-ejs-layouts** (szerveroldali felhasználói felület)  
- **Bootstrap 5 + Bootstrap Icons** (UI stílus)  
- **Winston** (strukturált naplózás)  
- **JWT + Sessions** (hitelesítés és munkamenet-kezelés)  

## Projekt struktúra
```
.
├── app.js                 # Belépési pont
├── config/                # Configuration constants
├── controllers/           # Kontroller réteg
├── DataServices/          # Adatbázis hozzáférések
├── LogicServices/         # Pontozási és számolási logika
├── middleware/            # Azonosítás, hibakezelési logika
├── models/                # Mongoose modellek
├── routes/                # Express útvonalak
├── static/                # Statikus elemek (CSS, JS, képek)
├── views/                 # EJS minták
├── logger.js              # Winston logolás beállításai
└── database/              # DB csatlakozás beállítása
```


## Környezeti változók
A következő változók szükségesek a `.env` fájlban vagy Docker konfigurációban:  
- `MONGODB_URI` – MongoDB kapcsolat string  
- `PORT` – HTTP port  
- `SECRET_ACCESS_TOKEN` – JWT aláíró kulcs  
- `SECRET_API_KEY` – Munkamenet titkos kulcs  
- `SECURE_MODE` – `true|false` (cookie biztonság)  
- `TESTDB` – `true|false` (teszt adatbázis kapcsoló)

## Megjegyzések
- Az alkalmazás globális middleware-t használ a **kiválasztott esemény**, **értesítések** és **verzió** információk nézetekbe történő injektálásához.  
- A naplózás centralizált a Winston segítségével, környezetfüggő naplózási szintekkel.  
- Az EJS sablonok közös layout-ot használnak a `views/layouts/layout.ejs` fájlban.