@echo off
title Entrega de Equipo - PWA
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  py server.py
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  python server.py
  goto :eof
)

echo.
echo ==========================================================
echo No se encontro Python en este equipo.
echo Para instalar la PWA debes publicar esta carpeta por HTTPS,
echo o instalar Python y volver a ejecutar INICIAR_PWA.bat.
echo ==========================================================
echo.
pause
