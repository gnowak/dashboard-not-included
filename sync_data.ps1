# Create target directory if not present
New-Item -ItemType Directory -Force -Path ".\public\data" | Out-Null

# Copy game json files from the Klei Oxygen Not Included DataDump directory
Copy-Item -Path "$HOME\Documents\Klei\OxygenNotIncluded\DataDump\*.json" -Destination ".\public\data\" -Force

Write-Host "Game data synced successfully!" -ForegroundColor Green
