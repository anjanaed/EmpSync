# IoT Hardware Integration Test Runner (PowerShell)
# This script runs all IoT hardware integration test suites

param(
    [Parameter(Position=0)]
    [ValidateSet("all", "integration", "connectivity", "sensor", "calibration", "coverage", "help")]
    [string]$Command = "all"
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

# Test files to run
$Tests = @(
    "src/test/iot-hardware/iot-hardware-integration.service.spec.ts",
    "src/test/iot-hardware/esp32-connectivity.service.spec.ts",
    "src/test/iot-hardware/r307-sensor-functionality.service.spec.ts",
    "src/test/iot-hardware/device-calibration.service.spec.ts"
)

function Write-ColorText {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Colors[$Color]
}

function Run-TestSuite {
    param([string]$TestFile)
    
    $TestName = [System.IO.Path]::GetFileNameWithoutExtension($TestFile) -replace "\.service\.spec$", ""
    
    Write-ColorText "📋 Running: $TestName" "Blue"
    Write-Host "----------------------------------------"
    
    try {
        $result = npm run test -- $TestFile --verbose
        if ($LASTEXITCODE -eq 0) {
            Write-ColorText "✅ $TestName`: PASSED" "Green"
            return $true
        } else {
            Write-ColorText "❌ $TestName`: FAILED" "Red"
            return $false
        }
    }
    catch {
        Write-ColorText "❌ $TestName`: ERROR - $($_.Exception.Message)" "Red"
        return $false
    }
}

function Run-AllTests {
    $passed = 0
    $failed = 0
    $total = $Tests.Count
    
    Write-ColorText "🔍 Running $total IoT Hardware test suites..." "Yellow"
    Write-Host ""
    
    foreach ($testFile in $Tests) {
        if (Run-TestSuite $testFile) {
            $passed++
        } else {
            $failed++
        }
        Write-Host ""
    }
    
    # Summary
    Write-Host "================================================"
    Write-ColorText "📊 Test Results Summary" "Blue"
    Write-Host "================================================"
    Write-Host "Total Test Suites: $total"
    Write-ColorText "Passed: $passed" "Green"
    Write-ColorText "Failed: $failed" "Red"
    
    if ($failed -eq 0) {
        Write-ColorText "🎉 All IoT Hardware tests passed!" "Green"
        return $true
    } else {
        Write-ColorText "⚠️  Some tests failed. Please check the output above." "Red"
        return $false
    }
}

function Run-TestCategory {
    param([string]$Category)
    
    switch ($Category) {
        "integration" {
            Write-ColorText "🔧 Running Integration Tests" "Yellow"
            Run-TestSuite "src/test/iot-hardware/iot-hardware-integration.service.spec.ts"
        }
        "connectivity" {
            Write-ColorText "📡 Running Connectivity Tests" "Yellow"
            Run-TestSuite "src/test/iot-hardware/esp32-connectivity.service.spec.ts"
        }
        "sensor" {
            Write-ColorText "🔍 Running Sensor Tests" "Yellow"
            Run-TestSuite "src/test/iot-hardware/r307-sensor-functionality.service.spec.ts"
        }
        "calibration" {
            Write-ColorText "⚙️ Running Calibration Tests" "Yellow"
            Run-TestSuite "src/test/iot-hardware/device-calibration.service.spec.ts"
        }
        default {
            Write-ColorText "❌ Unknown category: $Category" "Red"
            Write-Host "Available categories: integration, connectivity, sensor, calibration"
            exit 1
        }
    }
}

function Show-Coverage {
    Write-ColorText "📈 Generating Test Coverage Report" "Blue"
    Write-Host "================================================"
    npm run test:cov -- --testPathPattern="src/test/iot-hardware" --coverageDirectory=coverage/iot-hardware
}

function Show-Help {
    Write-Host "IoT Hardware Integration Test Runner (PowerShell)"
    Write-Host ""
    Write-Host "Usage: .\run-iot-tests.ps1 [OPTION]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  all          Run all IoT hardware test suites (default)"
    Write-Host "  integration  Run only integration tests"
    Write-Host "  connectivity Run only ESP32 connectivity tests"
    Write-Host "  sensor       Run only R307 sensor tests"
    Write-Host "  calibration  Run only device calibration tests"
    Write-Host "  coverage     Generate test coverage report"
    Write-Host "  help         Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\run-iot-tests.ps1                    # Run all tests"
    Write-Host "  .\run-iot-tests.ps1 all               # Run all tests"
    Write-Host "  .\run-iot-tests.ps1 connectivity      # Run only connectivity tests"
    Write-Host "  .\run-iot-tests.ps1 coverage          # Generate coverage report"
}

# Main script logic
function Main {
    Write-ColorText "🚀 Starting IoT Hardware Integration Test Suite" "Blue"
    Write-Host "================================================"
    
    # Ensure we're in the correct directory
    if (-not (Test-Path "package.json")) {
        Write-ColorText "❌ Error: package.json not found. Please run this script from the project root." "Red"
        exit 1
    }
    
    # Check if test directory exists
    if (-not (Test-Path "src/test/iot-hardware")) {
        Write-ColorText "❌ Error: IoT hardware test directory not found." "Red"
        exit 1
    }
    
    switch ($Command) {
        "all" {
            Run-AllTests
        }
        { $_ -in @("integration", "connectivity", "sensor", "calibration") } {
            Run-TestCategory $Command
        }
        "coverage" {
            Show-Coverage
        }
        "help" {
            Show-Help
        }
        default {
            Write-ColorText "❌ Unknown command: $Command" "Red"
            Write-Host ""
            Show-Help
            exit 1
        }
    }
}

# Run main function
Main
