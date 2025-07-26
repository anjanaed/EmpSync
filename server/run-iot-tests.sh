#!/usr/bin/env bash

# IoT Hardware Integration Test Runner
# This script runs all IoT hardware integration test suites

echo "🚀 Starting IoT Hardware Integration Test Suite"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test files to run
TESTS=(
  "src/test/iot-hardware/iot-hardware-integration.service.spec.ts"
  "src/test/iot-hardware/esp32-connectivity.service.spec.ts"
  "src/test/iot-hardware/r307-sensor-functionality.service.spec.ts"
  "src/test/iot-hardware/device-calibration.service.spec.ts"
)

# Function to run individual test suite
run_test_suite() {
  local test_file=$1
  local test_name=$(basename "$test_file" .spec.ts)
  
  echo -e "${BLUE}📋 Running: $test_name${NC}"
  echo "----------------------------------------"
  
  if npm run test -- "$test_file" --verbose; then
    echo -e "${GREEN}✅ $test_name: PASSED${NC}"
    return 0
  else
    echo -e "${RED}❌ $test_name: FAILED${NC}"
    return 1
  fi
}

# Function to run all tests
run_all_tests() {
  local passed=0
  local failed=0
  local total=${#TESTS[@]}
  
  echo -e "${YELLOW}🔍 Running $total IoT Hardware test suites...${NC}"
  echo ""
  
  for test_file in "${TESTS[@]}"; do
    if run_test_suite "$test_file"; then
      ((passed++))
    else
      ((failed++))
    fi
    echo ""
  done
  
  # Summary
  echo "================================================"
  echo -e "${BLUE}📊 Test Results Summary${NC}"
  echo "================================================"
  echo -e "Total Test Suites: $total"
  echo -e "${GREEN}Passed: $passed${NC}"
  echo -e "${RED}Failed: $failed${NC}"
  
  if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 All IoT Hardware tests passed!${NC}"
    return 0
  else
    echo -e "${RED}⚠️  Some tests failed. Please check the output above.${NC}"
    return 1
  fi
}

# Function to run specific test categories
run_test_category() {
  local category=$1
  
  case $category in
    "integration")
      echo -e "${YELLOW}🔧 Running Integration Tests${NC}"
      run_test_suite "src/test/iot-hardware/iot-hardware-integration.service.spec.ts"
      ;;
    "connectivity")
      echo -e "${YELLOW}📡 Running Connectivity Tests${NC}"
      run_test_suite "src/test/iot-hardware/esp32-connectivity.service.spec.ts"
      ;;
    "sensor")
      echo -e "${YELLOW}🔍 Running Sensor Tests${NC}"
      run_test_suite "src/test/iot-hardware/r307-sensor-functionality.service.spec.ts"
      ;;
    "calibration")
      echo -e "${YELLOW}⚙️ Running Calibration Tests${NC}"
      run_test_suite "src/test/iot-hardware/device-calibration.service.spec.ts"
      ;;
    *)
      echo -e "${RED}❌ Unknown category: $category${NC}"
      echo "Available categories: integration, connectivity, sensor, calibration"
      exit 1
      ;;
  esac
}

# Function to show test coverage
show_coverage() {
  echo -e "${BLUE}📈 Generating Test Coverage Report${NC}"
  echo "================================================"
  npm run test:cov -- --testPathPattern="src/test/iot-hardware" --coverageDirectory=coverage/iot-hardware
}

# Function to show help
show_help() {
  echo "IoT Hardware Integration Test Runner"
  echo ""
  echo "Usage: $0 [OPTION]"
  echo ""
  echo "Options:"
  echo "  all          Run all IoT hardware test suites (default)"
  echo "  integration  Run only integration tests"
  echo "  connectivity Run only ESP32 connectivity tests"
  echo "  sensor       Run only R307 sensor tests"
  echo "  calibration  Run only device calibration tests"
  echo "  coverage     Generate test coverage report"
  echo "  help         Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0                    # Run all tests"
  echo "  $0 all               # Run all tests"
  echo "  $0 connectivity      # Run only connectivity tests"
  echo "  $0 coverage          # Generate coverage report"
}

# Main script logic
main() {
  local command=${1:-"all"}
  
  # Ensure we're in the correct directory
  if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
  fi
  
  # Check if test directory exists
  if [ ! -d "src/test/iot-hardware" ]; then
    echo -e "${RED}❌ Error: IoT hardware test directory not found.${NC}"
    exit 1
  fi
  
  case $command in
    "all")
      run_all_tests
      ;;
    "integration"|"connectivity"|"sensor"|"calibration")
      run_test_category "$command"
      ;;
    "coverage")
      show_coverage
      ;;
    "help"|"-h"|"--help")
      show_help
      ;;
    *)
      echo -e "${RED}❌ Unknown command: $command${NC}"
      echo ""
      show_help
      exit 1
      ;;
  esac
}

# Run main function with all arguments
main "$@"
