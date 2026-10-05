@echo off
echo Instalando dependencias necesarias (si faltan)...
call npm install --silent
node setup.js
pause
