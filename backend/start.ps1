# Load environment variables
Get-Content .env | ForEach-Object {
    $line = $_.Trim()

    if ($line -and !$line.StartsWith("#")) {
        $parts = $line -split "=", 2

        [Environment]::SetEnvironmentVariable(
            $parts[0].Trim(),
            $parts[1].Trim(),
            "Process"
        )
    }
}

# Start Spring Boot
mvn spring-boot:run