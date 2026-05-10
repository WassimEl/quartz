@echo off
cd /d "D:\Obsidian coffres\quartz"
npx quartz build
if exist docs rmdir /s /q docs
rename public docs
git add -A
git commit -m "Nouvel article - %date%"
git push origin v4
echo ✅ Article publié ! https://wassimel.github.io/quartz/index.xml
pause