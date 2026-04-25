# SaveState APK Builder
# Run this script from PowerShell as: .\build-apk.ps1

$env:JAVA_HOME = "C:\jdk17\jdk-17.0.11+9"
$env:ANDROID_HOME = "C:\Android"
$env:ANDROID_SDK_ROOT = "C:\Android"
$env:PATH = "C:\jdk17\jdk-17.0.11+9\bin;C:\Android\platform-tools;$env:PATH"

Write-Host "Copying latest files to C:\gamevault..." -ForegroundColor Cyan
Copy-Item "D:\Скарбничка мрії\gamevault\android\gradle.properties" "C:\gamevault\android\gradle.properties" -Force

Write-Host "Cleaning previous build cache..." -ForegroundColor Cyan
& "C:\gamevault\android\gradlew.bat" --stop 2>$null

Write-Host "Building APK (arm64 only)..." -ForegroundColor Cyan
Set-Location "C:\gamevault\android"
& ".\gradlew.bat" assembleDebug -PndkVersion=26.1.10909125 2>&1 | Tee-Object -Variable buildOutput

$apk = "C:\gamevault\android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apk) {
    Write-Host "`nSUCCESS! APK built at:" -ForegroundColor Green
    Write-Host $apk -ForegroundColor Yellow
    Write-Host "`nCopying APK to Desktop..." -ForegroundColor Cyan
    Copy-Item $apk "$env:USERPROFILE\Desktop\SaveState-debug.apk" -Force
    Write-Host "APK saved to Desktop as SaveState-debug.apk" -ForegroundColor Green
} else {
    Write-Host "`nBUILD FAILED. Last 30 lines:" -ForegroundColor Red
    $buildOutput | Select-Object -Last 30
}
