# KI-Scripte

Dies ist ein Discord-Bot-Projekt, das verschiedene Funktionen bietet, einschließlich der Verwaltung von Chatverläufen und der Anpassung der Bot-Persönlichkeit.

## Installation (Empfohlen)

1. Starte [start_bot.bat](http://_vscodecontentref_/2)-Skript um einfach und schnell den bot einzurichten und zu Starten.

## Installation

1. Stelle sicher, dass [Node.js](https://nodejs.org/) auf deinem System installiert ist.
2. Klone das Repository und navigiere in das Projektverzeichnis.
3. Installiere die Abhängigkeiten mit dem folgenden Befehl:

    ```sh
    npm install
    ```

## Konfiguration

1. Erstelle eine [.env](http://_vscodecontentref_/1)-Datei im Projektverzeichnis und füge deinen Discord-Bot-Token und die Guild-ID hinzu:

    ```properties
    DISCORD_TOKEN=Dein_Discord_Bot_Token
    DISCORD_GUILD=Deine_Guild_ID
    ```

2. Alternativ kannst du den [start_bot.bat](http://_vscodecontentref_/2)-Skript ausführen, der dich durch die Erstellung der [.env](http://_vscodecontentref_/3)-Datei führt.

## Starten des Bots

Um den Bot zu starten, führe den folgenden Befehl aus:

```sh
node bot.js
```