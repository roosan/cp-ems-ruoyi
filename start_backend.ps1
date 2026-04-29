$ErrorActionPreference = "Stop"
Write-Host "Starting CP-EMS Backend..."
Set-Location "D:\workspace\EMS\cp-ems-ruoyi"

# Check if Redis is running (optional check)
$redisPort = Get-NetTCPConnection -LocalPort 6379 -ErrorAction SilentlyContinue
if (-not $redisPort) {
    Write-Warning "Redis (Port 6379) is NOT listening. Please start Redis server first!"
    # We don't exit here to allow user to start it in parallel or if check is false positive
}

# Run the jar
# Using start-process to run in new window or keep it here?
# User wants to see logs probably.
java -jar cp-ems-admin/target/cp-ems-admin.jar
