@echo off
cd /d "D:\Obsidian coffres\quartz"

echo 🔨 1/5 - Génération du site...
npx quartz build

echo 📁 2/5 - Préparation du dossier docs...
if exist docs rmdir /s /q docs
rename public docs

echo 📤 3/5 - Ajout des fichiers modifiés...
git add -A

echo 💾 4/5 - Enregistrement des changements...
git commit -m "Nouvel article - %date% %time%"

echo 🚀 5/5 - Envoi vers GitHub...
git push origin v4

echo.
echo ✅ Terminé ! Flux RSS : https://wassimel.github.io/quartz/index.xml
echo.
pause