@echo off
:: Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed on your system.
    echo Please download and install it from: https://nodejs.org/
    pause
    exit /b
)

:: Check if package.json exists
if not exist "package.json" (
    echo package.json is missing. Please make sure it is present in the directory.
    pause
    exit /b
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo Dependencies are not installed.
    set /p INSTALL_DEPS="Do you want to install the dependencies? (yes/no): "
    if /i "%INSTALL_DEPS%"=="yes" (
        echo Installing dependencies...
        npm install
        if %errorlevel% neq 0 (
            echo Failed to install dependencies.
            pause
            exit /b
        )
    ) else (
        echo Dependencies must be installed to proceed.
        pause
        exit /b
    )
)

:: Check if .env exists
if not exist ".env" (
    echo .env file is missing. I will create a new one.
    echo Please enter the following information:
    echo Bottoken can be found at https://discord.com/developers/applications
    echo Guild ID can be found by right-clicking on your server icon and selecting "Copy ID"

    :: Ask for Bot Token
    set /p DISCORD_TOKEN="Please enter your bot token: "

    :: Ask for Guild ID
    set /p DISCORD_GUILD="Please enter your guild ID: "

    :: Create .env file
    echo DISCORD_TOKEN=%DISCORD_TOKEN%> .env
    echo DISCORD_GUILD=%DISCORD_GUILD%>> .env
    echo .env file has been created.
) else (
    echo .env file already exists.
)

:: Start the bot
echo Starting the bot...
node bot.js

:: If an error occurs, display a message
if %errorlevel% neq 0 (
    echo Failed to start the bot.
    pause
    exit /b
)

pause