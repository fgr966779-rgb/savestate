@echo off
title SaveState APK Builder

set JAVA_HOME=C:\jdk17\jdk-17.0.11+9
set ANDROID_HOME=C:\Android
set ANDROID_SDK_ROOT=C:\Android
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%

echo.
echo [1/3] Copying latest gradle.properties...
copy /Y "D:\Скарбничка мрії\gamevault\android\gradle.properties" "C:\gamevault\android\gradle.properties"

echo.
echo [2/3] Building APK (arm64, NDK 26)...
cd /d C:\gamevault\android
call gradlew.bat assembleDebug -PndkVersion=26.1.10909125

echo.
if exist "C:\gamevault\android\app\build\outputs\apk\debug\app-debug.apk" (
    echo [3/3] SUCCESS! Copying APK to Desktop...
    copy /Y "C:\gamevault\android\app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Desktop\SaveState-debug.apk"
    echo.
    echo APK saved to Desktop as SaveState-debug.apk
    echo Install it on your phone!
) else (
    echo BUILD FAILED! Check errors above.
)

echo.
pause
