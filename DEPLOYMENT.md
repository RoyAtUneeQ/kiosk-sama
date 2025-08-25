# AWS S3 + CloudFront Deployment Guide

This guide provides instructions for deploying the React application to AWS S3 with CloudFront distribution for HTTPS access.

## Prerequisites

1. **AWS CLI** installed and configured with appropriate permissions
2. **Node.js** v20+
3. **AWS Account** with permissions for:
   - S3 (bucket creation, object management)
   - CloudFront (distribution creation, invalidation)
   - CloudFormation (stack management)
   - IAM (role creation for CloudFront)

## Manual Deployment Steps

### 1. Build the Application

```bash
# Install dependencies
npm install

# Ensure config.yaml exists (copy from sample if needed)
cp src/assets/config.sample.yaml src/assets/config.yaml

# Build for production
npm run build
```

The build creates optimized files in the `dist/` directory with:
- Minified JavaScript and CSS
- Asset fingerprinting (Vite automatically adds content hashes)
- Tree-shaken dependencies
- Optimized images and assets

### 2. Create S3 Bucket (Manual)

```bash
# Create bucket (replace with your chosen name)
aws s3 mb s3://your-kiosk-app-bucket

# Enable static website hosting
aws s3 website s3://your-kiosk-app-bucket \
  --index-document index.html \
  --error-document index.html

# Upload built files with Intelligent Tiering
aws s3 sync dist/ s3://your-kiosk-app-bucket \
  --delete \
  --storage-class INTELLIGENT_TIERING \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "*.html" \
  --exclude "*.json"

# Upload HTML files with shorter cache (for SPA routing)
aws s3 sync dist/ s3://your-kiosk-app-bucket \
  --delete \
  --storage-class INTELLIGENT_TIERING \
  --cache-control "public,max-age=0,must-revalidate" \
  --include "*.html" \
  --include "*.json"
```

### 3. Set Bucket Policy for Public Read

```bash
# Apply public read policy
aws s3api put-bucket-policy \
  --bucket your-kiosk-app-bucket \
  --policy file://s3-bucket-policy.json
```

### 4. Create CloudFront Distribution (Manual)

```bash
# Create distribution using CloudFormation template
aws cloudformation create-stack \
  --stack-name kiosk-cloudfront \
  --template-body file://cloudfront-template.yaml \
  --parameters ParameterKey=S3BucketName,ParameterValue=your-kiosk-app-bucket
```

## Automated Deployment

Use the provided deployment script for automated deployment:

```bash
# Make script executable
chmod +x deploy-to-aws.sh

# Run deployment (will prompt for configuration on first run)
./deploy-to-aws.sh

# Force reconfiguration
./deploy-to-aws.sh --force-config
```

### Deployment Configuration

The script creates and manages a `deployment-config.json` file to store your deployment settings:

```json
{
  "stackName": "kiosk-frontend-stack",
  "s3Region": "us-east-2", 
  "cfRegion": "us-east-1",
  "bucketName": "my-kiosk-bucket-12345",
  "bucketPrefix": "frontend/kiosk/",
  "distributionId": "E1234567890ABC",
  "websiteUrl": "https://d1234567890abc.cloudfront.net",
  "domainName": "kiosk.mycompany.com",
  "sslCertificateArn": "arn:aws:acm:us-east-1:123456789:certificate/abc-123",
  "awsProfile": "my-sso-profile",
  "lastDeployment": "2025-01-20T10:30:00Z"
}
```

**Configuration Options:**
- **stackName**: CloudFormation stack name
- **s3Region**: AWS region for S3 bucket (i.e. us-east-2)
- **cfRegion**: CloudFront region (always us-east-1 for SSL certificates)
- **bucketName**: S3 bucket name (auto-generated if empty, or existing bucket)
- **bucketPrefix**: S3 prefix/folder path within bucket (for organized deployments)
- **domainName**: Custom domain (optional)
- **sslCertificateArn**: ACM certificate for custom domain
- **awsProfile**: AWS CLI profile for SSO/enterprise accounts

**Flexible S3 Deployment Options:**
The script supports both new and existing S3 buckets with optional folder organization:

1. **New Bucket**: `my-new-kiosk-bucket`
   - Creates a new dedicated bucket
   - Files deployed to bucket root

2. **Existing Bucket (Root)**: `my-existing-bucket`
   - Uses existing bucket
   - Files deployed to bucket root

3. **Existing Bucket (Subfolder)**: `my-existing-bucket/frontend/kiosk`
   - Uses existing bucket with organized folder structure
   - Files deployed to specified prefix
   - Perfect for multi-project buckets

**Simplified Regional Architecture:**
The deployment keeps everything organized in your chosen region:
- **S3 Region** (default: us-east-2): Where your static files are stored
- **CloudFormation Stack**: Deployed in the same region as S3 for consistency
- **CloudFront Distribution**: Global CDN (SSL certificates handled automatically in us-east-1)

This approach allows you to:
- Store assets in your preferred region (lower latency, compliance) 
- Use CloudFront's global CDN with proper SSL certificate support
- Maintain cost efficiency by avoiding cross-region data transfer

**AWS SSO Support:**
```bash
# Set profile before deployment
export AWS_PROFILE=your-sso-profile
./deploy-to-aws.sh

# Or configure it interactively during first run
```

The script will:
1. Build the application
2. Create or use existing S3 bucket  
3. Upload built files with appropriate caching headers
4. Create or update CloudFront distribution
5. Invalidate CloudFront cache
6. Save deployment configuration for future runs
7. Provide the final HTTPS URL

## Asset Fingerprinting

Vite automatically handles asset fingerprinting:
- JavaScript and CSS files get content-based hashes (e.g., `app.a1b2c3d4.js`)
- Static assets (images, fonts) are fingerprinted when imported in code
- `index.html` references are automatically updated with hashed filenames

This ensures:
- Browser cache invalidation when content changes
- Long-term caching for unchanged assets
- Optimal performance and cache efficiency

## S3 Storage Optimization

All assets are uploaded using **S3 Intelligent Tiering** storage class:

- **Automatic cost optimization**: Objects automatically move between access tiers
- **No performance impact**: Same retrieval performance as Standard storage
- **No retrieval fees**: Unlike other tiering options (IA, Glacier)
- **Monitoring included**: Built-in access pattern analysis
- **Cost savings**: Up to 40% savings for infrequently accessed files

**Benefits for static websites:**
- Frequently accessed assets (JS/CSS) stay in Standard tier
- Older deployments automatically move to cheaper tiers
- No manual lifecycle management required

## Cache Strategy

The deployment uses a two-tier caching strategy:

### S3 Cache Headers
- **Static Assets** (JS/CSS/images): `max-age=31536000,immutable` (1 year)
- **HTML/JSON files**: `max-age=0,must-revalidate` (no cache)

### CloudFront Behaviors
- **Default** (`/*`): Cache based on S3 headers, with SPA fallback to `index.html`
- **API paths** (`/api/*`): No caching, forward to backend if configured

## Environment Considerations

### Configuration Management
The `config.yaml` file contains environment-specific settings. For production:

1. Update backend URLs to production endpoints
2. Set environment to "production"
3. Use production API keys and CDN URLs

### CORS and Security
CloudFront provides:
- HTTPS enforcement
- Geographic distribution
- DDoS protection
- Custom security headers via response headers policy

## Monitoring and Maintenance

### Cache Invalidation
After deployment, the script automatically invalidates:
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Health Checks
Monitor:
- CloudFront distribution status
- S3 bucket access logs
- Application error rates via browser console
- WebSocket connection success (backend dependency)

## Troubleshooting

### Common Issues

1. **404 on SPA Routes**: Ensure CloudFront custom error pages redirect to `index.html`
2. **CORS Errors**: Check backend CORS settings for CloudFront domain
3. **Config Loading Errors**: Verify `config.yaml` exists and has correct structure
4. **WebSocket Failures**: Update backend URLs in production config

### Rollback Strategy
```bash
# Deploy previous version
aws s3 sync previous-build/ s3://your-bucket --delete
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
```

### Clean Up Failed Deployments
```bash
# Delete a failed CloudFormation stack
aws cloudformation delete-stack --stack-name your-stack-name --region us-east-2

# Clean up deployment config to start fresh
rm deployment-config.json
```

## Cost Optimization

- Use CloudFront's free tier (1TB transfer, 10M requests/month)
- Enable gzip compression
- S3 Intelligent Tiering automatically optimizes storage costs
- Monitor S3 storage costs
- Set lifecycle policies for old deployments if storing multiple versions

## File Management

### Generated Files
The deployment process creates several files:

- **`deployment-config.json`**: Your deployment settings (auto-generated, not in git)
- **`deployment-config.sample.json`**: Example configuration template
- **`build-analysis.json`**: Build optimization report (optional)

### Git Ignore
These files are automatically ignored by git:
```gitignore
# Deployment configuration (contains AWS account info)
deployment-config.json
build-analysis.json
```

**Important**: Never commit `deployment-config.json` as it may contain sensitive AWS information.

## Security Best Practices

1. **S3 Bucket**: Block public write access
2. **CloudFront**: Use security headers policy
3. **Configuration**: Never commit deployment config or API keys
4. **HTTPS**: Enforce HTTPS-only via CloudFront
5. **Origin Access**: Use CloudFront Origin Access Control (OAC)
6. **AWS Profile**: Use SSO profiles for enterprise accounts