#!/usr/bin/env bash
# Shared color definitions and print functions for scripts

# Colors for output
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[1;33m'
readonly COLOR_BLUE='\033[0;34m'
readonly COLOR_NC='\033[0m'

print_info() { echo -e "${COLOR_BLUE}[INFO]${COLOR_NC} $1"; }
print_success() { echo -e "${COLOR_GREEN}[SUCCESS]${COLOR_NC} $1"; }
print_warning() { echo -e "${COLOR_YELLOW}[WARNING]${COLOR_NC} $1"; }
print_error() { echo -e "${COLOR_RED}[ERROR]${COLOR_NC} $1"; }
