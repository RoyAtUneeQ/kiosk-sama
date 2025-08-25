#!/bin/bash

# Standalone config environment verification script
# This script checks if the config.yaml environment setting is appropriate for deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

verify_config_environment() {
    local config_file="src/assets/config.yaml"
    
    log_info "Checking config environment setting..."
    
    if [ ! -f "$config_file" ]; then
        log_warning "config.yaml not found at $config_file"
        return 0
    fi
    
    # Try to extract environment setting from YAML
    local environment=""
    if command -v python3 &> /dev/null && python3 -c "import yaml" &> /dev/null; then
        log_info "Using Python3 to parse YAML..."
        environment=$(python3 -c "import yaml; data=yaml.safe_load(open('$config_file')); print(data.get('app', {}).get('environment', 'not-set'))" 2>/dev/null)
    elif command -v node &> /dev/null; then
        log_info "Using Node.js to parse YAML..."
        environment=$(node -e "
            const fs = require('fs');
            const yaml = require('js-yaml');
            try {
                const data = yaml.load(fs.readFileSync('$config_file', 'utf8'));
                console.log(data.app?.environment || 'not-set');
            } catch(e) {
                console.log('parse-error');
            }
        " 2>/dev/null)
    else
        log_info "Using grep fallback to parse YAML..."
        # Fallback: simple grep approach
        environment=$(grep -E "^\s*environment\s*:" "$config_file" | sed 's/.*environment\s*:\s*["\x27]*\([^"\x27]*\)["\x27]*.*/\1/' | tr -d ' ')
    fi
    
    log_info "Raw environment value: '$environment' (length: ${#environment})"
    
    if [ -z "$environment" ] || [ "$environment" = "not-set" ] || [ "$environment" = "parse-error" ]; then
        log_warning "Could not detect environment setting in config.yaml"
        return 0
    fi
    
    log_info "Detected environment in config.yaml: $environment"
    
    # Check if it's a development-like environment
    case "$environment" in
        development|dev|staging|test|local)
            echo
            log_warning "⚠️  Environment Check"
            echo "Your config.yaml is set to environment: '$environment'"
            echo "This may not be appropriate for production deployment."
            echo
            echo "Common production settings:"
            echo "  - environment: 'production'"
            echo "  - Update API URLs to production endpoints"
            echo "  - Use production API keys and CDN URLs"
            echo
            read -p "Continue with '$environment' environment? (y/N): " continue_env
            if [[ ! $continue_env =~ ^[Yy]$ ]]; then
                log_error "Deployment cancelled by user. Please update config.yaml and try again."
                echo
                echo "To fix:"
                echo "1. Edit src/assets/config.yaml"
                echo "2. Change 'environment: $environment' to 'environment: production'"
                echo "3. Update any development URLs/keys to production values"
                echo "4. Re-run the deployment script"
                return 1
            fi
            ;;
        production|prod)
            log_success "✅ Environment set to '$environment' - good for production deployment"
            ;;
        *)
            log_info "Environment set to '$environment' - proceeding with deployment"
            ;;
    esac
    
    echo
    log_success "Config environment check completed successfully"
    return 0
}

# Main execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    echo "🔍 Config Environment Verification"
    echo "=================================="
    echo
    
    verify_config_environment
    exit_code=$?
    
    echo
    if [ $exit_code -eq 0 ]; then
        echo "✅ Verification passed - environment is acceptable"
    else
        echo "❌ Verification failed - environment needs attention"
    fi
    
    exit $exit_code
fi