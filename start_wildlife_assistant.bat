@echo off
setlocal

title Wildlife Safari Assistant

echo ============================================
echo   WILDLIFE SAFARI ASSISTANT
echo ============================================
echo.

REM =========================================================
REM PROJECT PATHS
REM =========================================================

set "WILDLIFE_PROJECT=C:\Users\Public\bootcamp_projects\Wildlife-Safari-Assistant"
set "SAFARI_PROJECT=C:\Users\Public\bootcamp_projects\SAFARI_GUIDE_CHATBOT"

set "WILDLIFE_PYTHON=%WILDLIFE_PROJECT%\venv\Scripts\python.exe"
set "SAFARI_PYTHON=%SAFARI_PROJECT%\venv\Scripts\python.exe"


REM =========================================================
REM CHECK REQUIRED FILES
REM =========================================================

if not exist "%WILDLIFE_PYTHON%" (
    echo ERROR: Wildlife Safari Assistant virtual environment not found.
    echo.
    echo Expected:
    echo %WILDLIFE_PYTHON%
    echo.
    pause
    exit /b 1
)


if not exist "%SAFARI_PYTHON%" (
    echo ERROR: Safari Guide virtual environment not found.
    echo.
    echo Expected:
    echo %SAFARI_PYTHON%
    echo.
    pause
    exit /b 1
)


if not exist "%SAFARI_PROJECT%\api.py" (
    echo ERROR: Safari Guide api.py was not found.
    echo.
    pause
    exit /b 1
)


if not exist "%WILDLIFE_PROJECT%\backend\main.py" (
    echo ERROR: Wildlife Safari Assistant backend was not found.
    echo.
    pause
    exit /b 1
)


REM =========================================================
REM START SAFARI GUIDE API
REM =========================================================

echo [1/3] Checking Safari Guide API on port 8504...
echo.

powershell -NoProfile -Command ^
    "if ((Test-NetConnection 127.0.0.1 -Port 8504 -WarningAction SilentlyContinue).TcpTestSucceeded) { exit 0 } else { exit 1 }"


if %errorlevel%==0 (

    echo Safari Guide is already running.

) else (

    echo Starting Safari Guide in background...

    REM -----------------------------------------------------
    REM IMPORTANT:
    REM Start from the Safari Guide directory.
    REM This prevents its 'data' package from being confused
    REM with Wildlife-Safari-Assistant\data.
    REM -----------------------------------------------------

    pushd "%SAFARI_PROJECT%"

    start "" /B ^
        "%SAFARI_PYTHON%" ^
        -m uvicorn api:app ^
        --host 127.0.0.1 ^
        --port 8504

    popd
)


REM =========================================================
REM WAIT FOR SAFARI GUIDE API
REM =========================================================

echo.
echo [2/3] Waiting for Safari Guide API...

set /a attempts=0


:check_safari

set /a attempts+=1


powershell -NoProfile -Command ^
    "try { $r = Invoke-RestMethod 'http://127.0.0.1:8504/api/health' -TimeoutSec 2; if ($r.status -eq 'ok') { exit 0 } else { exit 1 } } catch { exit 1 }"


if %errorlevel%==0 goto safari_ready


if %attempts% GEQ 20 goto safari_failed


timeout /t 1 /nobreak >nul

goto check_safari


:safari_failed

echo.
echo ============================================
echo ERROR: SAFARI GUIDE FAILED TO START
echo ============================================
echo.
echo The Wildlife Assistant was not started
echo because the Safari Guide API is unavailable.
echo.
pause
exit /b 1


:safari_ready

echo Safari Guide API is ONLINE.
echo.


REM =========================================================
REM CHECK WILDLIFE ASSISTANT PORT
REM =========================================================

echo [3/3] Checking Wildlife Safari Assistant...
echo.


powershell -NoProfile -Command ^
    "if ((Test-NetConnection 127.0.0.1 -Port 8001 -WarningAction SilentlyContinue).TcpTestSucceeded) { exit 0 } else { exit 1 }"


if %errorlevel%==0 (

    echo Wildlife Safari Assistant is already running.
    echo.
    echo Opening application...

    start "" "http://127.0.0.1:8001/"

    echo.
    echo ============================================
    echo   APPLICATION READY
    echo ============================================
    echo.
    echo Wildlife Assistant:
    echo http://127.0.0.1:8001/
    echo.
    echo Safari Guide API:
    echo http://127.0.0.1:8504/api/health
    echo.
    pause
    exit /b 0
)


REM =========================================================
REM OPEN BROWSER AFTER SERVER STARTS
REM =========================================================

start "" powershell -NoProfile -WindowStyle Hidden -Command ^
    "Start-Sleep -Seconds 5; Start-Process 'http://127.0.0.1:8001/'"


REM =========================================================
REM START WILDLIFE SAFARI ASSISTANT
REM =========================================================

echo Starting Wildlife Safari Assistant...
echo.
echo ============================================
echo   APPLICATION READY
echo ============================================
echo.
echo Wildlife Assistant:
echo http://127.0.0.1:8001/
echo.
echo Safari Guide API:
echo http://127.0.0.1:8504/api/health
echo.
echo Keep this window open while using the app.
echo.
echo Press CTRL+C to stop the Wildlife Assistant.
echo ============================================
echo.


cd /d "%WILDLIFE_PROJECT%"


"%WILDLIFE_PYTHON%" ^
    -m uvicorn backend.main:app ^
    --host 127.0.0.1 ^
    --port 8001


REM =========================================================
REM END
REM =========================================================

echo.
echo Wildlife Safari Assistant stopped.
echo.

endlocal

pause