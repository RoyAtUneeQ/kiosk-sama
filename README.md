# Generic Kiosk - Frontend

Digital human kiosk experience with remote mobile control capabilities. Users interact with an AI-powered digital human (UneeQ) on the main kiosk display, while remote users can connect via mobile devices to send messages and control the conversation.

## 📖 Documentation

**Complete documentation is available at:**
- **[View Online Documentation](https://interface-149017.gitlab.io/#/)** - Complete online documentation
- **[Quick Start Guide](https://interface-149017.gitlab.io/#/pages/main)** - System overview and architecture

### Key Features

- **🤖 Digital Human Avatar** - AI-powered conversations using Uneeq SDK
- **📱 Remote Control** - Mobile interface for remote interaction
- **🎤 Voice Input** - Real-time speech-to-text via Deepgram
- **🔄 Auto-Discovery** - Extensible triggers and event listeners
- **⚡ Real-time Communication** - WebSocket-based messaging
- **🎯 Centralized State** - Zustand-based shared state management

### Architecture

- **Frontend Framework**: React + TypeScript
- **State Management**: Zustand with shared interaction states
- **Real-time Communication**: WebSocket with auto-reconnection
- **Speech Recognition**: Deepgram streaming API
- **Build Tool**: Vite

## 📋 Prerequisites

- **Node.js**: v20.0.0 or higher (v20+ recommended)
- **Backend Service**: This frontend requires the companion backend service running
  - WebSocket server on port 3001
  - HTTP API on port 3000
  - See [Backend Repository](https://websocket-api-75b4d0.gitlab.io/#/) for setup instructions 

## 🚀 Quick Start

### 1. Configuration Setup

**Important:** Before running the application, you must create a configuration file:

```bash
# Copy the sample configuration to create your config file
cp src/assets/config.sample.yaml src/assets/config.yaml

# Edit the config file to match your environment
# - Update backend host/ports if different from defaults
# - Configure Uneeq persona keys and endpoints
# - Set appropriate environment (development/staging/production)
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install
```

### 3. Start Backend Services

**The backend services must be running before starting the frontend:**

```bash
# In a separate terminal, navigate to the backend project
# cd ../backend  # adjust path as needed
# npm install
# npm run dev
```

### 4. Start Frontend Development Server

```bash
# Start the frontend development server
npm run dev

# The application will be available at http://localhost:5173
```

### 5. Verify Setup

Once running, you should see:
- ✅ **Uneeq Script**: Ready
- ✅ **WebSocket**: Connected (if backend is running)
- ✅ **Session ID**: Generated
- ✅ **Start Button**: Enabled (when both services are ready)

## 🔧 Configuration

The `config.yaml` file controls:

- **Application Settings**
  - Environment mode (development/staging/production)
  - Application name

- **Persona Configuration**
  - Multiple language support (en, fr, etc.)
  - Render modes (cloud, miniprem)
  - Uneeq CDN URLs and API keys

- **Backend Connection**
  - WebSocket server URL and port
  - HTTP API server URL and port
  - Authentication keys

Example configuration structure:
```yaml
app:
  name: "Your Kiosk Name"
  environment: "development"

personas:
  en:
    cloud:
      CDN: "https://cdn-eu.uneeq.io/..."
      API: "https://api-eu.uneeq.io"
      key: "your-persona-key"

backend:
  host: "localhost"
  ports:
    http: 3000
    ws: 3001
  key: "your-backend-key"
```

## 🏗️ Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Analyze build performance and get optimization recommendations
./optimize-build.js
```

### 📊 Build Analysis & Optimization

The `optimize-build.js` script provides detailed analysis of your production build:

```bash
# Run after building to get performance insights
npm run build
./optimize-build.js
```

**What it analyzes:**
- **Bundle sizes**: Identifies large JavaScript/CSS files that need code splitting
- **Asset fingerprinting**: Verifies Vite's content hashing for optimal caching
- **Performance recommendations**: Suggests image optimization, lazy loading, etc.
- **Cache strategy**: Provides CloudFront/CDN cache header recommendations

**Output includes:**
- 📦 Build summary with file counts and sizes
- 🚀 JavaScript bundle analysis with size warnings
- 💾 Cache configuration recommendations
- 💡 Specific optimization suggestions
- 📁 Saves detailed report to `build-analysis.json`

**Integration with deployment:**
The deployment script (`./deploy-to-aws.sh`) will optionally run this analysis before deploying, giving you a chance to optimize before going live.

## 📚 Documentation Structure

- **[Core System](https://interface-149017.gitlab.io/#/pages/main)** - Foundation and configuration
  - [Performance & Monitoring](https://interface-149017.gitlab.io/#/pages/core/performance-monitoring) - Development metrics and optimization
  - [Configuration System](https://interface-149017.gitlab.io/#/pages/core/configuration) - Application and persona configuration
  - [Error Boundary](https://interface-149017.gitlab.io/#/pages/core/error-boundary) - Error handling and recovery
  - [Language Support](https://interface-149017.gitlab.io/#/pages/core/language-support) - Multi-language and internationalization
- **[Kiosk (Main Display)](https://interface-149017.gitlab.io/#/pages/kiosk/overview)** - Primary interface architecture
  - [State Management](https://interface-149017.gitlab.io/#/pages/kiosk/states) - Session lifecycle and state flows
  - [Event System](https://interface-149017.gitlab.io/#/pages/kiosk/events) - UneeQ and WebSocket event handling
  - [UI Architecture](https://interface-149017.gitlab.io/#/pages/kiosk/ui) - Component composition and rendering
- **[Remote (Mobile Interface)](https://interface-149017.gitlab.io/#/pages/remote/overview)** - Mobile control interface
  - [Connection Flow](https://interface-149017.gitlab.io/#/pages/remote/connection) - Device pairing and WebSocket setup
  - [Message System](https://interface-149017.gitlab.io/#/pages/remote/messaging) - Text and voice communication
  - [UI Architecture](https://interface-149017.gitlab.io/#/pages/remote/ui) - Mobile-first responsive design

## 🏗️ Development

The codebase follows **simple, standardized, and extensible** patterns:

- **Auto-Discovery**: Triggers and event listeners are automatically registered
- **Shared State**: UI interaction states managed centrally
- **Type Safety**: TypeScript with enums for better type checking
- **Modular Components**: Self-contained, reusable components

For detailed implementation guides and architectural decisions, see the comprehensive documentation linked above.

## ❗ Troubleshooting

### Start Button Disabled
- **Cause**: WebSocket connection not established
- **Solution**: Ensure backend services are running on the correct ports

### WebSocket Connection Refused
- **Cause**: Backend WebSocket server not running
- **Solution**: Start the backend service (default port 3001)

### Config File Not Found
- **Cause**: Missing `src/assets/config.yaml`
- **Solution**: Copy from `config.sample.yaml` as shown in setup

### Node Version Issues
- **Cause**: Node.js version < 18
- **Solution**: Use Node.js v20+ (recommend v20 LTS)

## 📝 Notes

- The frontend and backend are separate projects that work together
- Configuration is required before first run (no default config.yaml)
- Both services must be running for full functionality
- Development mode includes performance monitoring and debug panels

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License

```
MIT License

Copyright (c) 2024 UneeQ

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
