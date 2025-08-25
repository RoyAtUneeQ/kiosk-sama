#!/bin/bash

# AWS S3 + CloudFront Deployment Script
# Builds React app and deploys to AWS with CloudFront distribution

set -e  # Exit on any error

# Configuration
STACK_NAME="kiosk-frontend-stack"
S3_REGION="us-east-2"  # Default S3 region (can be changed)
CF_REGION="us-east-1"  # CloudFront region (required for certificates)
BUILD_DIR="dist"
CONFIG_FILE="deployment-config.json"

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

# Check requirements
check_requirements() {
    log_info "Checking requirements..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI not found. Please install: https://aws.amazon.com/cli/"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Please install Node.js v20+"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Run: aws configure"
        exit 1
    fi
    
    # Check if in project root
    if [ ! -f "package.json" ]; then
        log_error "Must run from project root directory"
        exit 1
    fi
    
    log_success "All requirements met"
}

# Parse bucket input to separate bucket name and prefix
parse_bucket_input() {
    local input="$1"
    
    if [[ "$input" == *"/"* ]]; then
        # Extract bucket name (everything before first /)
        PARSED_BUCKET_NAME="${input%%/*}"
        # Extract prefix (everything after first /, clean up slashes)
        PARSED_BUCKET_PREFIX="${input#*/}"
        # Remove trailing slash if present
        PARSED_BUCKET_PREFIX="${PARSED_BUCKET_PREFIX%/}"
        # Remove any double slashes
        PARSED_BUCKET_PREFIX="${PARSED_BUCKET_PREFIX//\/\//\/}"
        USES_EXISTING_BUCKET=true
    else
        # Just a bucket name, no prefix
        PARSED_BUCKET_NAME="$input"
        PARSED_BUCKET_PREFIX=""
        USES_EXISTING_BUCKET=false
    fi
    
    log_info "Parsed bucket: '$PARSED_BUCKET_NAME', prefix: '${PARSED_BUCKET_PREFIX:-<root>}'"
}

# Check if bucket exists
check_bucket_exists() {
    local bucket_name="$1"
    
    if aws s3api head-bucket --bucket "$bucket_name" --region "$S3_REGION" 2>/dev/null; then
        return 0  # Bucket exists
    else
        return 1  # Bucket doesn't exist
    fi
}

# Load or create deployment configuration
load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        log_info "Loading existing deployment configuration..."
        BUCKET_NAME=$(jq -r '.bucketName // empty' "$CONFIG_FILE")
        BUCKET_PREFIX=$(jq -r '.bucketPrefix // empty' "$CONFIG_FILE")
        USES_EXISTING_BUCKET=$(jq -r '.usesExistingBucket // false' "$CONFIG_FILE")
        STACK_NAME=$(jq -r '.stackName // "kiosk-frontend-stack"' "$CONFIG_FILE")
        S3_REGION=$(jq -r '.s3Region // "us-east-2"' "$CONFIG_FILE")
        CF_REGION=$(jq -r '.cfRegion // "us-east-1"' "$CONFIG_FILE")
        DOMAIN_NAME=$(jq -r '.domainName // empty' "$CONFIG_FILE")
        SSL_CERT_ARN=$(jq -r '.sslCertificateArn // empty' "$CONFIG_FILE")
    else
        log_info "Creating new deployment configuration..."
        create_config
    fi
}

# Create deployment configuration
create_config() {
    echo
    echo "=== Deployment Configuration ==="
    
    # Stack name
    read -p "Enter CloudFormation stack name [$STACK_NAME]: " input
    STACK_NAME=${input:-$STACK_NAME}
    
    # S3 Region
    read -p "Enter S3 region [$S3_REGION]: " input
    S3_REGION=${input:-$S3_REGION}
    
    # CloudFront region (always us-east-1)
    echo "CloudFront region: $CF_REGION (required for SSL certificates)"
    
    # Bucket name or bucket/prefix
    echo
    echo "S3 Bucket Configuration:"
    echo "  - For new bucket: 'my-kiosk-bucket' (will be created)"
    echo "  - For existing bucket: 'existing-bucket/frontend/app' (will use subfolder)"  
    echo "  - Leave empty to auto-generate a new bucket name"
    echo "  - Type 'list' to see your existing buckets"
    echo
    read -p "Enter S3 bucket name or bucket/path: " BUCKET_INPUT
    
    # Handle special 'list' command
    if [ "$BUCKET_INPUT" = "list" ]; then
        echo
        log_info "Your existing S3 buckets:"
        aws s3 ls --region "$S3_REGION" 2>/dev/null || aws s3 ls
        echo
        read -p "Enter S3 bucket name or bucket/path (e.g. 'my-bucket/my-path', do not include s://): " BUCKET_INPUT
    fi
    
    if [ -n "$BUCKET_INPUT" ]; then
        parse_bucket_input "$BUCKET_INPUT"
        BUCKET_NAME="$PARSED_BUCKET_NAME"
        BUCKET_PREFIX="$PARSED_BUCKET_PREFIX"
        
        # Check if bucket exists when prefix is used
        if [ "$USES_EXISTING_BUCKET" = true ]; then
            if check_bucket_exists "$BUCKET_NAME"; then
                log_success "Existing bucket '$BUCKET_NAME' found, will deploy to prefix: $BUCKET_PREFIX"
            else
                log_warning "Bucket '$BUCKET_NAME' not found. Will create it and use prefix: $BUCKET_PREFIX"
            fi
        else
            BUCKET_NAME="$BUCKET_INPUT"
            BUCKET_PREFIX=""
        fi
    else
        BUCKET_NAME=""
        BUCKET_PREFIX=""
    fi
    
    # Custom domain (optional)
    read -p "Enter custom domain name (optional): " DOMAIN_NAME
    
    if [ -n "$DOMAIN_NAME" ]; then
        read -p "Enter SSL certificate ARN for $DOMAIN_NAME: " SSL_CERT_ARN
    fi
    
    # Save configuration
    cat > "$CONFIG_FILE" <<EOF
{
  "stackName": "$STACK_NAME",
  "s3Region": "$S3_REGION",
  "cfRegion": "$CF_REGION",
  "bucketName": "$BUCKET_NAME",
  "bucketPrefix": "$BUCKET_PREFIX",
  "usesExistingBucket": $USES_EXISTING_BUCKET,
  "domainName": "$DOMAIN_NAME",
  "sslCertificateArn": "$SSL_CERT_ARN"
}
EOF
    
    log_success "Configuration saved to $CONFIG_FILE"
}

# Build the application
build_app() {
    log_info "Building application..."
    
    # Check if config.yaml exists
    if [ ! -f "src/assets/config.yaml" ]; then
        log_warning "config.yaml not found, copying from sample..."
        cp src/assets/config.sample.yaml src/assets/config.yaml
        log_warning "Please update src/assets/config.yaml with production settings"
        read -p "Press Enter to continue after updating config.yaml..."
    fi
    
    # Install dependencies and build
    npm ci --silent
    npm run build
    
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build failed - $BUILD_DIR directory not found"
        exit 1
    fi
    
    log_success "Build completed"
}

# Verify config.yaml environment setting
verify_config_environment() {
    local config_file="src/assets/config.yaml"
    
    if [ ! -f "$config_file" ]; then
        log_warning "config.yaml not found at $config_file"
        return 0
    fi
    
    # Try to extract environment setting from YAML
    local environment=""
    if command -v python3 &> /dev/null && python3 -c "import yaml" &> /dev/null; then
        environment=$(python3 -c "import yaml; data=yaml.safe_load(open('$config_file')); print(data.get('app', {}).get('environment', 'not-set'))" 2>/dev/null)
    elif command -v node &> /dev/null; then
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
        # Fallback: simple grep approach
        environment=$(grep -E "^\s*environment\s*:" "$config_file" | sed 's/.*environment\s*:\s*["\x27]*\([^"\x27]*\)["\x27]*.*/\1/' | tr -d ' ')
    fi
    
    if [ -z "$environment" ] || [ "$environment" = "not-set" ] || [ "$environment" = "parse-error" ]; then
        log_info "Could not detect environment setting in config.yaml"
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
                log_info "Deployment cancelled. Please update config.yaml and try again."
                echo
                echo "To fix:"
                echo "1. Edit src/assets/config.yaml"
                echo "2. Change 'environment: $environment' to 'environment: production'"
                echo "3. Update any development URLs/keys to production values"
                echo "4. Re-run the deployment script"
                exit 1
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
}

# Run optional build analysis
run_build_analysis() {
    echo
    echo "📊 Build Analysis & Optimization"
    echo "=================================="
    echo "The build analysis tool can help optimize your deployment by:"
    echo "• Identifying large bundles that need code splitting"
    echo "• Verifying asset fingerprinting for optimal caching" 
    echo "• Providing performance recommendations"
    echo "• Generating cache strategy suggestions"
    echo
    read -p "Run build analysis before deployment? (Y/n): " run_analysis
    
    if [[ $run_analysis =~ ^[Nn]$ ]]; then
        log_info "Skipping build analysis"
        return 0
    fi
    
    log_info "Running build analysis..."
    
    if [ ! -f "optimize-build.js" ]; then
        log_warning "optimize-build.js not found, skipping analysis"
        return 0
    fi
    
    if ! node optimize-build.js; then
        log_warning "Build analysis completed with warnings - check the output above"
        echo
        read -p "Continue with deployment despite warnings? (Y/n): " continue_deploy
        if [[ $continue_deploy =~ ^[Nn]$ ]]; then
            log_info "Deployment cancelled. Address the warnings and try again."
            exit 1
        fi
    else
        log_success "Build analysis passed - no issues found"
    fi
    
    echo
}

# Deploy CloudFormation stack
deploy_stack() {
    log_info "Deploying CloudFormation stack..."
    
    # Prepare parameters
    PARAMS="ParameterKey=BucketName,ParameterValue=$BUCKET_NAME"
    PARAMS="$PARAMS ParameterKey=S3Region,ParameterValue=$S3_REGION"
    PARAMS="$PARAMS ParameterKey=BucketPrefix,ParameterValue=$BUCKET_PREFIX"
    PARAMS="$PARAMS ParameterKey=UseExistingBucket,ParameterValue=$USES_EXISTING_BUCKET"
    
    if [ -n "$DOMAIN_NAME" ]; then
        PARAMS="$PARAMS ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME"
    fi
    
    if [ -n "$SSL_CERT_ARN" ]; then
        PARAMS="$PARAMS ParameterKey=SSLCertificateArn,ParameterValue=$SSL_CERT_ARN"
    fi
    
    # Deploy CloudFormation stack to S3 region (not CF region)
    log_info "Deploying CloudFormation stack to S3 region: $S3_REGION"
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$S3_REGION" &>/dev/null; then
        log_info "Updating existing stack..."
        
        # Capture the update command output and error
        if update_output=$(aws cloudformation update-stack \
            --stack-name "$STACK_NAME" \
            --template-body file://cloudformation-template.yaml \
            --parameters $PARAMS \
            --region "$S3_REGION" \
            --capabilities CAPABILITY_IAM 2>&1); then
            # Update succeeded, monitor it
            monitor_stack_deployment
        else
            # Check if it's the "no updates" error
            if echo "$update_output" | grep -q "No updates are to be performed"; then
                log_success "✅ Stack is already up-to-date - no changes needed"
            else
                # It's a real error
                log_error "Stack update failed: $update_output"
                return 1
            fi
        fi
    else
        log_info "Creating new stack..."
        aws cloudformation create-stack \
            --stack-name "$STACK_NAME" \
            --template-body file://cloudformation-template.yaml \
            --parameters $PARAMS \
            --region "$S3_REGION" \
            --capabilities CAPABILITY_IAM
        
        # Monitor stack deployment with interactive feedback
        monitor_stack_deployment
    fi
    
    log_success "Stack deployment completed"
}

# Monitor CloudFormation stack deployment with interactive feedback
monitor_stack_deployment() {
    local max_wait=900  # 15 minutes max
    local wait_interval=15  # Check every 15 seconds
    local elapsed=0
    local last_status=""
    local start_time=$(date +%s)
    
    log_info "Monitoring stack deployment progress..."
    echo "AWS Console: https://$S3_REGION.console.aws.amazon.com/cloudformation/home?region=$S3_REGION#/stacks/stackinfo?stackId=$STACK_NAME"
    echo
    
    # Quick initial check - stack might already be complete
    local initial_status=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$S3_REGION" \
        --query 'Stacks[0].StackStatus' \
        --output text 2>/dev/null)
    
    case "$initial_status" in
        CREATE_COMPLETE|UPDATE_COMPLETE)
            log_success "Stack is already complete with status: $initial_status"
            return 0
            ;;
        *FAILED|*ROLLBACK*|UPDATE_ROLLBACK_COMPLETE)
            log_warning "Stack is in failed state: $initial_status"
            echo "Cannot proceed with deployment - CloudFormation failed"
            return 1
            ;;
    esac
    
    while [ $elapsed -lt $max_wait ]; do
        # Get current status
        local status=$(aws cloudformation describe-stacks \
            --stack-name "$STACK_NAME" \
            --region "$S3_REGION" \
            --query 'Stacks[0].StackStatus' \
            --output text 2>/dev/null)
        
        if [ $? -ne 0 ]; then
            log_error "Failed to get stack status. Check your AWS credentials and region."
            return 1
        fi
        
        # Show status if it changed
        if [ "$status" != "$last_status" ]; then
            local current_time=$(date '+%H:%M:%S')
            echo "[$current_time] Stack Status: $status"
            last_status="$status"
        fi
        
        # Check for completion states
        case "$status" in
            CREATE_COMPLETE|UPDATE_COMPLETE)
                log_success "Stack deployment completed with status: $status"
                return 0
                ;;
            *FAILED|*ROLLBACK*|UPDATE_ROLLBACK_COMPLETE)
                log_error "Stack deployment failed with status: $status"
                echo
                echo "To investigate:"
                echo "1. Check AWS Console: https://$S3_REGION.console.aws.amazon.com/cloudformation/home?region=$S3_REGION#/stacks/stackinfo?stackId=$STACK_NAME"
                echo "2. Run: aws cloudformation describe-stack-events --stack-name '$STACK_NAME' --region '$S3_REGION'"
                echo
                read -p "Continue with deployment anyway? (y/N): " continue_anyway
                if [[ $continue_anyway =~ ^[Yy]$ ]]; then
                    log_warning "Continuing deployment despite stack failure"
                    return 0
                else
                    return 1
                fi
                ;;
            *IN_PROGRESS)
                # Still deploying, show progress
                local progress_dots=$((elapsed / wait_interval % 4))
                printf "\r[%s] Still deploying" "$(date '+%H:%M:%S')"
                for i in $(seq 1 $progress_dots); do printf "."; done
                printf "   "
                ;;
        esac
        
        sleep $wait_interval
        elapsed=$((elapsed + wait_interval))
        
        # Show timeout warning
        if [ $elapsed -gt 600 ] && [ $((elapsed % 60)) -eq 0 ]; then
            local remaining=$((max_wait - elapsed))
            echo
            log_warning "Stack still deploying after $((elapsed/60)) minutes. Timeout in $((remaining/60)) minutes."
            echo "You can:"
            echo "  1. Wait here (script will continue monitoring)"
            echo "  2. Press Ctrl+C to exit and monitor in AWS Console"
            echo "  3. The deployment will continue in AWS regardless"
            echo
        fi
    done
    
    # Timeout reached
    echo
    log_warning "Timeout reached after $((max_wait/60)) minutes"
    echo
    echo "The CloudFormation deployment is still running in AWS."
    echo "You can:"
    echo "  1. Monitor progress: https://$S3_REGION.console.aws.amazon.com/cloudformation/home?region=$S3_REGION#/stacks/stackinfo?stackId=$STACK_NAME"
    echo "  2. Check status: aws cloudformation describe-stacks --stack-name '$STACK_NAME' --region '$S3_REGION'"
    echo
    read -p "Continue with rest of deployment? (y/N): " continue_deploy
    if [[ $continue_deploy =~ ^[Yy]$ ]]; then
        log_warning "Continuing deployment - please verify stack completed manually"
        return 0
    else
        log_info "Exiting. Re-run script when CloudFormation completes."
        exit 1
    fi
}

# Get stack outputs
get_stack_outputs() {
    log_info "Retrieving stack outputs..."
    
    STACK_OUTPUTS=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$S3_REGION" \
        --query 'Stacks[0].Outputs' \
        --output json)
    
    BUCKET_NAME=$(echo "$STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey=="BucketName") | .OutputValue')
    DISTRIBUTION_ID=$(echo "$STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey=="DistributionId") | .OutputValue')
    WEBSITE_URL=$(echo "$STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey=="WebsiteURL") | .OutputValue')
    
    log_success "Stack outputs retrieved"
}


# Upload files to S3
upload_to_s3() {
    local s3_path="s3://$BUCKET_NAME"
    if [ -n "$BUCKET_PREFIX" ]; then
        s3_path="s3://$BUCKET_NAME/$BUCKET_PREFIX/"
        log_info "Uploading files to S3 bucket: $BUCKET_NAME (prefix: $BUCKET_PREFIX/)"
    else
        log_info "Uploading files to S3 bucket: $BUCKET_NAME"
    fi
    
    # Upload static assets with long cache headers and Intelligent Tiering
    aws s3 sync "$BUILD_DIR/" "$s3_path" \
        --region "$S3_REGION" \
        --delete \
        --storage-class INTELLIGENT_TIERING \
        --cache-control "public,max-age=31536000,immutable" \
        --exclude "*.html" \
        --exclude "*.json" \
        --exclude "config.yaml"
    
    # Upload HTML and config files with no-cache headers and Intelligent Tiering
    aws s3 sync "$BUILD_DIR/" "$s3_path" \
        --region "$S3_REGION" \
        --storage-class INTELLIGENT_TIERING \
        --cache-control "public,max-age=0,must-revalidate" \
        --include "*.html" \
        --include "*.json"
    
    # Upload config.yaml specifically (if it exists in build) with Intelligent Tiering
    if [ -f "$BUILD_DIR/config.yaml" ]; then
        aws s3 cp "$BUILD_DIR/config.yaml" "${s3_path}config.yaml" \
            --region "$S3_REGION" \
            --storage-class INTELLIGENT_TIERING \
            --cache-control "public,max-age=300"  # 5 minute cache for config
    fi
    
    log_success "Files uploaded successfully"
}

# Invalidate CloudFront cache
invalidate_cache() {
    log_info "Invalidating CloudFront cache..."
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    log_info "Invalidation created with ID: $INVALIDATION_ID"
    log_info "Waiting for invalidation to complete..."
    
    aws cloudfront wait invalidation-completed \
        --distribution-id "$DISTRIBUTION_ID" \
        --id "$INVALIDATION_ID"
    
    log_success "Cache invalidation completed"
}

# Update deployment configuration
update_config() {
    cat > "$CONFIG_FILE" <<EOF
{
  "stackName": "$STACK_NAME",
  "s3Region": "$S3_REGION",
  "cfRegion": "$CF_REGION",
  "bucketName": "$BUCKET_NAME",
  "bucketPrefix": "$BUCKET_PREFIX",
  "usesExistingBucket": $USES_EXISTING_BUCKET,
  "distributionId": "$DISTRIBUTION_ID",
  "websiteUrl": "$WEBSITE_URL",
  "domainName": "$DOMAIN_NAME",
  "sslCertificateArn": "$SSL_CERT_ARN",
  "lastDeployment": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
}

# Show deployment summary
show_summary() {
    echo
    echo "======================================"
    echo "🚀 Deployment Summary"
    echo "======================================"
    echo "Stack Name: $STACK_NAME"
    echo "Stack Region: $S3_REGION (CloudFormation deployed here)"
    echo "S3 Region: $S3_REGION"
    echo "CloudFront Region: Global (SSL certs from us-east-1)"
    if [ -n "$BUCKET_PREFIX" ]; then
        echo "S3 Location: $BUCKET_NAME/$BUCKET_PREFIX"
    else
        echo "S3 Bucket: $BUCKET_NAME"
    fi
    echo "CloudFront Distribution: $DISTRIBUTION_ID"
    echo "Website URL: $WEBSITE_URL"
    echo "======================================"
    echo
    log_success "Deployment completed successfully!"
    echo
    echo "Your React application is now live at:"
    echo "🌐 $WEBSITE_URL"
    echo
    
    if [ -n "$DOMAIN_NAME" ]; then
        echo "Custom domain: https://$DOMAIN_NAME"
        echo "Note: DNS propagation may take up to 48 hours"
        echo
    fi
    
    echo "Next steps:"
    echo "1. Add the URL above to your Allowed Domains within UneeQ Admin portal"
    echo "2. Test your application at the URL above"
    echo "3. Update your backend CORS settings if needed"
    echo "4. Set up monitoring and alerts"
}

# Clean up function
cleanup() {
    if [ $? -ne 0 ]; then
        log_error "Deployment failed!"
        echo
        echo "Common issues:"
        echo "- AWS credentials not configured"
        echo "- Insufficient AWS permissions"
        echo "- CloudFormation template syntax error"
        echo "- S3 bucket name already taken"
        echo
        echo "Check the error messages above for details."
    fi
}

# Main deployment flow
main() {
    trap cleanup EXIT
    
    echo "🚀 AWS S3 + CloudFront Deployment Script"
    echo "========================================"
    
    # Check if this is a forced redeploy
    if [ "$1" == "--force-config" ]; then
        rm -f "$CONFIG_FILE"
        log_info "Forcing configuration recreation"
    fi
    
    check_requirements
    load_config
    build_app
    verify_config_environment
    run_build_analysis
    deploy_stack
    get_stack_outputs
    upload_to_s3
    invalidate_cache
    update_config
    show_summary
}

# Help function
show_help() {
    echo "AWS S3 + CloudFront Deployment Script"
    echo
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --help          Show this help message"
    echo "  --force-config  Force recreation of deployment configuration"
    echo
    echo "Features:"
    echo "  - Interactive configuration for S3 buckets and CloudFront"
    echo "  - Support for existing buckets with folder organization"
    echo "  - Optional build analysis and optimization recommendations"
    echo "  - Intelligent Tiering for S3 storage cost optimization"
    echo "  - Real-time CloudFormation deployment monitoring"
    echo
    echo "Environment Variables:"
    echo "  AWS_PROFILE     AWS profile to use (optional)"
    echo "  AWS_REGION      AWS region override (optional)"
    echo
    echo "Files created:"
    echo "  $CONFIG_FILE     Deployment configuration"
    echo "  build-analysis.json       Build optimization report (optional)"
    echo "  cloudformation-template.yaml  CloudFormation template"
    echo
    echo "Prerequisites:"
    echo "  - AWS CLI installed and configured"
    echo "  - Node.js v20+ installed"
    echo "  - Appropriate AWS permissions for S3, CloudFront, CloudFormation"
}

# Handle command line arguments
case "${1:-}" in
    --help)
        show_help
        exit 0
        ;;
    --force-config)
        main "$1"
        ;;
    "")
        main
        ;;
    *)
        echo "Unknown option: $1"
        show_help
        exit 1
        ;;
esac