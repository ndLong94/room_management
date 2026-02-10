# Build backend with Java 17. Use this if your default JAVA_HOME is not JDK 17.
# Usage: .\build.ps1   or   .\build.ps1 -SkipTests
$ErrorActionPreference = "Stop"
$jdksDir = Join-Path $env:USERPROFILE ".jdks"
$jdk17 = $null
if (Test-Path $jdksDir) {
  $folders = Get-ChildItem -Directory $jdksDir -ErrorAction SilentlyContinue
  $jdk17 = $folders | Where-Object { $_.Name -match "corretto-17|openjdk-17|temurin-17|17\.|jdk-17" } | Select-Object -First 1
}
if ($jdk17) {
  $env:JAVA_HOME = $jdk17.FullName
  Write-Host "Using JAVA_HOME=$env:JAVA_HOME"
}
$mvnArgs = @("clean", "install", "-q")
if ($args -contains "-SkipTests") { $mvnArgs += "-DskipTests" }
& mvn @mvnArgs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
