@echo off
setlocal
cd /d "%~dp0"

echo.
echo LiZa Memories Photography - Galerie Bilder importieren
echo -----------------------------------------------------
echo.

if not exist "node_modules\sharp" (
  echo Technische Abhaengigkeiten fehlen. Installiere einmalig...
  call npm install
  if errorlevel 1 (
    echo.
    echo Installation fehlgeschlagen. Bitte npm install manuell pruefen.
    pause
    exit /b 1
  )
)

node scripts\import-gallery-images.mjs
echo.
pause
