# Instagram-Verbindung einrichten

Diese Anleitung zeigt dir, wie du die Instagram Business Login Integration für InstaAI konfigurierst.

> **WICHTIG**: InstaAI nutzt die neue **Instagram Business Login API** (nicht Facebook Login). 
> Dein Instagram-Account muss ein **Business-** oder **Creator-Account** sein!

## 📋 Voraussetzungen

- Eine Meta Developer Account
- Ein Instagram **Business-** oder **Creator-Account** (KEIN privater Account!)
- Zugriff auf die Meta Developer Console

---

## 🚀 Schritt 1: Meta/Facebook App erstellen

### 1.1 Developer Account erstellen
1. Gehe zu [Meta for Developers](https://developers.facebook.com/)
2. Melde dich mit deinem Facebook-Account an
3. Falls noch nicht geschehen, registriere dich als Developer

### 1.2 Neue App erstellen
1. Klicke auf **"Meine Apps"** → **"App erstellen"**
2. Wähle als App-Typ: **"Business"**
3. App-Name: z.B. `InstaAI` (oder dein gewünschter Name)
4. App-Kontakt-E-Mail: Deine E-Mail-Adresse
5. Klicke auf **"App erstellen"**

---

## 🔧 Schritt 2: Facebook Login konfigurieren

### 2.1 Facebook Login for Business hinzufügen
1. Im App-Dashboard unter **"Füge Produkte zu deiner App hinzu"**
2. Finde **"Facebook Login for Business"**
3. Klicke auf **"Einrichten"**

### 2.2 Redirect-URL konfigurieren

**WICHTIG**: Ersetze `https://deine-domain.com` mit deiner tatsächlichen Domain!

#### Für Production:
```
https://deine-domain.com/api/auth/callback/instagram
```

#### Beispiel:
```
https://instaai.trendzone.tech/api/auth/callback/instagram
```

#### Für lokale Entwicklung:
```
http://localhost:3000/api/auth/callback/instagram
```

### 2.3 OAuth-Einstellungen
Gehe zu **Facebook Login** → **Einstellungen** und konfiguriere:

✅ **Gültige OAuth-Redirect-URIs**: 
```
https://deine-domain.com/api/auth/callback/instagram
```

✅ **Client-OAuth-Anmeldung**: **EIN** (aktivieren)

✅ **Web-OAuth-Anmeldung**: **EIN** (aktivieren)

✅ **HTTPS erzwingen**: **EIN** (aktivieren)

✅ **Eingebettete Browser-OAuth-Anmeldung**: **AUS** (deaktivieren)

Klicke auf **"Änderungen speichern"**

---

## 🔑 Schritt 3: App-Credentials kopieren

### 3.1 App-ID und App-Secret finden
1. Gehe zu **Einstellungen** → **Allgemein**
2. Kopiere die **App-ID**
3. Klicke bei **App-Geheimcode** auf **"Anzeigen"**
4. Kopiere das **App-Secret**

### 3.2 Environment Variables setzen

**Für Coolify/Docker:**

Füge diese Environment Variables in deinem Deployment hinzu:

```bash
INSTAGRAM_CLIENT_ID=deine-app-id-hier
INSTAGRAM_CLIENT_SECRET=dein-app-secret-hier
```

**Für lokale Entwicklung:**

Füge in `.env.local` hinzu:
```bash
INSTAGRAM_CLIENT_ID=deine-app-id-hier
INSTAGRAM_CLIENT_SECRET=dein-app-secret-hier
```

---

## 📱 Schritt 4: Berechtigungen beantragen (für Production)

Für die Veröffentlichung deiner App brauchst du folgende Berechtigungen:

Gehe zu **App-Überprüfung** → **Berechtigungen und Funktionen**

Beantrage:
- ✅ `instagram_basic` - Grundlegende Instagram-Daten
- ✅ `instagram_content_publish` - Posts veröffentlichen
- ✅ `pages_show_list` - Facebook-Seiten anzeigen
- ✅ `pages_read_engagement` - Seiten-Engagement lesen
- ✅ `business_management` - Business-Account-Verwaltung

**Hinweis**: Für die Entwicklung/Testphase kannst du deine eigenen Accounts ohne App-Review nutzen!

---

## ✅ Schritt 5: Testen

### 5.1 App neustarten
Starte deine App neu, damit die Environment Variables geladen werden.

**Für Coolify:**
- Deployment neu starten über Coolify Dashboard

**Für lokale Entwicklung:**
```bash
npm run dev
```

### 5.2 Instagram verbinden
1. Gehe zu: `https://deine-domain.com/dashboard/settings/instagram`
2. Klicke auf **"Mit Instagram verbinden"**
3. Du wirst zu Facebook weitergeleitet
4. Melde dich bei Facebook an
5. Wähle die Facebook-Seiten aus, die du verbinden möchtest
6. Erlaube den Zugriff auf deine Instagram Business-Accounts
7. Du wirst zurück zur App weitergeleitet
8. Deine Instagram-Accounts sollten nun verbunden sein! 🎉

---

## 🔒 Sicherheitshinweise

- ✅ Speichere **niemals** App-Credentials in Git/Code
- ✅ Verwende immer Environment Variables
- ✅ Access Tokens werden **verschlüsselt** in der Datenbank gespeichert
- ✅ Verwende **HTTPS** für Production
- ✅ Setze **HTTPS erzwingen** in Facebook Login auf EIN

---

## 🐛 Troubleshooting

### "Instagram OAuth ist noch nicht konfiguriert"
- ✅ Prüfe ob `INSTAGRAM_CLIENT_ID` und `INSTAGRAM_CLIENT_SECRET` gesetzt sind
- ✅ Starte die App neu nach dem Setzen der Variables

### "Invalid App ID" Fehler
- ✅ Prüfe ob die App-ID korrekt kopiert wurde
- ✅ Stelle sicher, dass **Facebook Login for Business** aktiviert ist
- ✅ Prüfe ob die App im **Live-Modus** oder **Entwicklungsmodus** ist

### "Redirect URI mismatch"
- ✅ Die Redirect-URI in Facebook muss **exakt** übereinstimmen
- ✅ Achte auf `http` vs `https`
- ✅ Achte auf Trailing Slashes

### "Keine Instagram Business-Accounts gefunden"
- ✅ Stelle sicher, dass dein Instagram ein **Business** oder **Creator**-Account ist
- ✅ Verknüpfe deinen Instagram mit einer Facebook-Seite
- ✅ Du brauchst **Admin-Rechte** auf der Facebook-Seite

### Token abgelaufen
- ✅ Long-lived Tokens halten 60 Tage
- ✅ Die App erneuert Tokens automatisch beim Refresh
- ✅ Bei Ablauf: Einfach Account neu verbinden

---

## 📚 Weitere Ressourcen

- [Instagram Graph API Dokumentation](https://developers.facebook.com/docs/instagram-api/)
- [Facebook Login Dokumentation](https://developers.facebook.com/docs/facebook-login/)
- [Instagram Business Account erstellen](https://help.instagram.com/502981923235522)
- [Mit Facebook-Seite verknüpfen](https://www.facebook.com/business/help/898752960195806)

---

## 🎯 Quick Reference

### Redirect URI Format:
```
https://DEINE-DOMAIN/api/auth/callback/instagram
```

### Benötigte Environment Variables:
```bash
INSTAGRAM_CLIENT_ID=<deine-facebook-app-id>
INSTAGRAM_CLIENT_SECRET=<dein-facebook-app-secret>
```

### Instagram Settings Seite:
```
https://DEINE-DOMAIN/dashboard/settings/instagram
```

---

**Letzte Aktualisierung**: 10. Dezember 2025
