@echo off
echo Attempting to add Firewall Rule for Port 3000...
netsh advfirewall firewall add rule name="Allow NestJS 3000" dir=in action=allow protocol=TCP localport=3000
echo.
echo Rule added (if Admin). Check above for "Ok".
echo.
pause
