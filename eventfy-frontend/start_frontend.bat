@echo off
echo Installation des dependances et demarrage du frontend React Eventfy...
echo.

cd /d "%~dp0"

echo Installation des dependances npm...
npm install

echo.
echo Demarrage du serveur de developpement React sur http://localhost:3000
echo Le serveur se rechargera automatiquement lors des modifications
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
npm start
