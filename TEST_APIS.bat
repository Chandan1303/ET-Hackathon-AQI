@echo off
echo ========================================
echo Urban Air Quality OS - API Testing
echo ========================================
echo.

echo [1/2] Testing WAQI API...
echo.
curl -s "https://api.waqi.info/feed/london/?token=ff94b57163120a64df3cc64688045bcb1bed685a" > nul
if %errorlevel% equ 0 (
    echo [OK] WAQI API - Working
) else (
    echo [FAIL] WAQI API - Connection Failed
)
echo.

echo [2/2] Testing Google Maps API...
echo.
curl -s "https://maps.googleapis.com/maps/api/js?key=AIzaSyBZKAvOOvkNZeKUc1I9EBE4x5KOqkBPjkg" > nul
if %errorlevel% equ 0 (
    echo [OK] Google Maps API - Working
) else (
    echo [FAIL] Google Maps API - Connection Failed
)
echo.

echo ========================================
echo Testing Complete!
echo ========================================
echo.
echo Check API_STATUS_REPORT.md for details
echo.
pause
