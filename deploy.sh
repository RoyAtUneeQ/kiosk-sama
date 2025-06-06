#!/bin/bash

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fixed values - no longer interactive
BUCKET_NAME="deutsche-telekom-kiosk"
REGION="eu-central-1"
AWS_PROFILE="admin-access-722136182380"
BUILD_COMMAND="npm run build"
BUILD_DIR="dist"

# Function to check if AWS CLI is installed and profile is working
check_aws_cli() {
  echo -e "${BLUE}Checking AWS CLI installation...${NC}"
  if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first:${NC}"
    echo "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
  fi
  
  echo -e "${BLUE}Checking AWS session with profile ${YELLOW}$AWS_PROFILE${NC}..."
  if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &> /dev/null; then
    echo -e "${RED}AWS session not found or invalid with profile ${YELLOW}$AWS_PROFILE${NC}."
    echo -e "${YELLOW}Please run 'aws sso login --profile $AWS_PROFILE' to refresh your session.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}AWS session is active with profile ${YELLOW}$AWS_PROFILE${NC}.${NC}"
}

# Function to ensure the S3 bucket exists and is configured for static website hosting
ensure_bucket_exists_and_configure() {
  echo -e "${BLUE}Checking if bucket '${YELLOW}$BUCKET_NAME${NC}' exists...${NC}"
  # Check if bucket exists quietly
  if ! aws s3api head-bucket --bucket "$BUCKET_NAME" --profile "$AWS_PROFILE" 2>/dev/null; then
    echo -e "${YELLOW}Bucket '${YELLOW}$BUCKET_NAME${NC}' not found. Creating...${NC}"
    # Create bucket
    if aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" --create-bucket-configuration LocationConstraint="$REGION" --profile "$AWS_PROFILE"; then
      echo -e "${GREEN}Bucket '${YELLOW}$BUCKET_NAME${NC}' created successfully.${NC}"
    else
      echo -e "${RED}Failed to create bucket '${YELLOW}$BUCKET_NAME${NC}'. Exiting.${NC}"
      exit 1
    fi
    
    echo -e "${BLUE}Configuring bucket for static website hosting...${NC}"
    # Configure static website hosting
    aws s3api put-bucket-website --bucket "$BUCKET_NAME" --profile "$AWS_PROFILE" --website-configuration '{
      "IndexDocument": {
        "Suffix": "index.html"
      },
      "ErrorDocument": {
        "Key": "index.html"
      }
    }'
    
    echo -e "${BLUE}Setting public read bucket policy...${NC}"
    # Set public read bucket policy
    aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --profile "$AWS_PROFILE" --policy '{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": "*",
          "Action": "s3:GetObject",
          "Resource": "arn:aws:s3:::'"$BUCKET_NAME"'/*"
        }
      ]
    }'
    
    echo -e "${GREEN}Bucket configuration complete.${NC}"
  else
    echo -e "${GREEN}Bucket '${YELLOW}$BUCKET_NAME${NC}' already exists.${NC}"
  fi
}

# Function to build the frontend application
build_frontend() {
  echo -e "${BLUE}Building frontend application...${NC}"
  $BUILD_COMMAND
  
  if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}Build directory '$BUILD_DIR' not found.${NC}"
    echo "Please check your build configuration."
    exit 1
  fi
  
  echo -e "${GREEN}Frontend built successfully.${NC}"
}

# Function to deploy files to S3
deploy_to_s3() {
  echo -e "${BLUE}Deploying frontend to S3 bucket '${YELLOW}$BUCKET_NAME${NC}'...${NC}"
  
  # Deploy HTML files with no cache to ensure environment variables are always fresh
  echo -e "${BLUE}Uploading HTML files (no cache)...${NC}"
  aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME" \
    --delete \
    --region "$REGION" \
    --exclude "*" \
    --include "*.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --profile "$AWS_PROFILE"
  
  # Deploy JS/CSS files with short cache for development, longer for production
  echo -e "${BLUE}Uploading JS/CSS files (short cache)...${NC}"
  aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME" \
    --region "$REGION" \
    --exclude "*" \
    --include "*.js" \
    --include "*.css" \
    --cache-control "max-age=300" \
    --profile "$AWS_PROFILE"
  
  # Deploy static assets with longer cache
  echo -e "${BLUE}Uploading static assets...${NC}"
  aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME" \
    --region "$REGION" \
    --exclude "*.html" \
    --exclude "*.js" \
    --exclude "*.css" \
    --cache-control "max-age=3600" \
    --profile "$AWS_PROFILE"
    
  echo -e "${GREEN}S3 sync successful.${NC}"

  # Check if CloudFront distribution ID is properly set
  if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ] && [ "$CLOUDFRONT_DISTRIBUTION_ID" != "YOUR_DISTRIBUTION_ID_HERE" ]; then
    echo -e "${BLUE}Invalidating CloudFront cache for distribution '${YELLOW}$CLOUDFRONT_DISTRIBUTION_ID${NC}'...${NC}"
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
      --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
      --paths "/*" \
      --profile "$AWS_PROFILE" \
      --query 'Invalidation.Id' \
      --output text)
    echo -e "${GREEN}CloudFront invalidation request sent with ID: ${YELLOW}$INVALIDATION_ID${NC}"
    echo -e "${YELLOW}Note: CloudFront invalidation may take 5-15 minutes to complete.${NC}"
  else
    echo -e "${YELLOW}⚠️  CloudFront invalidation skipped!${NC}"
    echo -e "${YELLOW}   To enable CloudFront cache invalidation:${NC}"
    echo -e "${YELLOW}   1. Find your CloudFront distribution ID in AWS Console${NC}"
    echo -e "${YELLOW}   2. Update CLOUDFRONT_DISTRIBUTION_ID in this script${NC}"
    echo -e "${YELLOW}   3. Without this, cached content may take hours to update!${NC}"
  fi
    
  # Add deployment timestamp
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')
  echo -e "${GREEN}Deployment successful at ${YELLOW}$TIMESTAMP${NC}!"
  echo -e "${GREEN}Your website is available at:${NC}"
  echo -e "${YELLOW}http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com${NC}"
  
  # Additional cache-busting advice
  echo ""
  echo -e "${BLUE}💡 Cache-busting tips:${NC}"
  echo -e "${YELLOW}   • HTML files now have no-cache headers${NC}"
  echo -e "${YELLOW}   • Hard refresh browser: Ctrl+F5 (Cmd+Shift+R on Mac)${NC}"
  echo -e "${YELLOW}   • Open browser in incognito/private mode${NC}"
  echo -e "${YELLOW}   • Clear browser cache if changes still not visible${NC}"
}

# Function to deploy with no cache (for urgent deployments)
deploy_no_cache() {
  echo -e "${BLUE}🚀 URGENT DEPLOYMENT: Deploying with NO CACHE...${NC}"
  echo -e "${YELLOW}This will ensure immediate visibility of changes but may impact performance.${NC}"
  
  aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME" \
    --delete \
    --region "$REGION" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --profile "$AWS_PROFILE"
    
  echo -e "${GREEN}No-cache deployment successful.${NC}"

  if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ] && [ "$CLOUDFRONT_DISTRIBUTION_ID" != "YOUR_DISTRIBUTION_ID_HERE" ]; then
    echo -e "${BLUE}Invalidating CloudFront cache...${NC}"
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
      --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
      --paths "/*" \
      --profile "$AWS_PROFILE" \
      --query 'Invalidation.Id' \
      --output text)
    echo -e "${GREEN}CloudFront invalidation request sent with ID: ${YELLOW}$INVALIDATION_ID${NC}"
  fi
}

# Main function
main() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}   Kiosk Frontend S3 Deployment        ${NC}"
  echo -e "${BLUE}========================================${NC}"
  
  # Check AWS CLI
  check_aws_cli
  
  # Ensure bucket exists and is configured
  ensure_bucket_exists_and_configure
  
  # Summary before deployment
  echo ""
  echo -e "${BLUE}--- Deployment Summary ---${NC}"
  echo -e "Target S3 Bucket: ${YELLOW}$BUCKET_NAME${NC}"
  echo -e "AWS Region: ${YELLOW}$REGION${NC}"
  echo -e "AWS Profile: ${YELLOW}$AWS_PROFILE${NC}"
  echo -e "${BLUE}--------------------------${NC}"
  echo ""
  
  # Ask for deployment type
  echo -e "${BLUE}Choose deployment type:${NC}"
  echo -e "1) ${GREEN}Normal deployment${NC} (optimized caching)"
  echo -e "2) ${YELLOW}No-cache deployment${NC} (immediate visibility, slower performance)"
  echo ""
  read -p "Enter choice (1 or 2): " deploy_type
  
  if [ "$deploy_type" != "1" ] && [ "$deploy_type" != "2" ]; then
    echo -e "${RED}Invalid choice. Please enter 1 or 2.${NC}"
    exit 1
  fi
  
  # Ask for confirmation
  read -p "Do you want to build and deploy? (y/n): " confirm_deploy
  if [ "$confirm_deploy" != "y" ] && [ "$confirm_deploy" != "Y" ]; then
    echo -e "${RED}Deployment cancelled by user.${NC}"
    exit 1
  fi
  
  # Build first
  build_frontend
  
  # Deploy based on choice
  if [ "$deploy_type" = "1" ]; then
    deploy_to_s3
  else
    deploy_no_cache
  fi
}

# Run the main function
main 