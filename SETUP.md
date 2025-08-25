# Setup Guide - Generic Kiosk Frontend

This guide provides step-by-step instructions for setting up the Generic Kiosk frontend application.

## System Requirements

### Minimum Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher  
- **Memory**: 4GB RAM minimum
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

### Recommended Setup
- **Node.js**: v20.17.0 LTS
- **npm**: v10.0.0 or higher
- **Memory**: 8GB RAM or more
- **OS**: macOS, Linux, or Windows 10/11

## Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd frontend
```

### Step 2: Check Node.js Version

```bash
node --version
# Should output v18.0.0 or higher
```

If you need to install or update Node.js:
- **Option A**: Download from [nodejs.org](https://nodejs.org/)
- **Option B**: Use nvm (Node Version Manager)
  ```bash
  nvm install 20
  nvm use 20
  ```

### Step 3: Create Configuration File

**⚠️ This step is required - the application will not work without it!**

```bash
# Copy the sample configuration
cp src/assets/config.sample.yaml src/assets/config.yaml
```

Now edit `src/assets/config.yaml` to configure:

1. **Environment Setting**:
   ```yaml
   app:
     environment: "development"  # or "staging" or "production"
   ```

2. **Uneeq Persona Keys** (if you have your own):
   ```yaml
   personas:
     en:
       cloud:
         key: "your-persona-key-here"
   ```

3. **Backend Connection** (if not using defaults):
   ```yaml
   backend:
     host: "localhost"  # or your backend server IP/domain
     ports:
       http: 3000       # HTTP API port
       ws: 3001         # WebSocket port
   ```

### Step 4: Install Dependencies

```bash
npm install
```

If you see warnings about engine compatibility, ensure you're using Node.js v20+.

### Step 5: Start the Backend Service

**The frontend requires a backend service to function properly.**

In a new terminal window:

```bash
# Navigate to the backend project
cd ../backend  # Adjust path as needed

# Install backend dependencies (first time only)
npm install

# Start the backend
npm run dev
```

The backend should start:
- HTTP API on `http://localhost:3000`
- WebSocket on `ws://localhost:3001`

### Step 6: Start the Frontend

Back in the frontend directory:

```bash
npm run dev
```

You should see:
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 7: Open the Application

Open your browser and navigate to: `http://localhost:5173`

## Verifying Your Setup

### ✅ Successful Setup Indicators

When everything is working correctly, you should see:

1. **On the Start Screen**:
   - Uneeq Script: **Ready** (green)
   - WebSocket: **Connected** (green)
   - Session ID: A generated UUID
   - Start Button: **Enabled** (clickable)

2. **In the Browser Console** (F12):
   - No red error messages
   - Messages like "Uneeq initialized"
   - WebSocket connection established

### ❌ Common Issues and Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Config not found** | Blank page or errors about config | Create `config.yaml` from sample (Step 3) |
| **WebSocket disconnected** | Red "Disconnected" status | Start the backend service (Step 5) |
| **Start button disabled** | Button is grayed out | Check both WebSocket and Uneeq status |
| **Port already in use** | Error when starting dev server | Change port: `npm run dev -- --port 5174` |
| **Node version error** | Build/install failures | Update to Node.js v20+ |

## Project Structure

Understanding the key directories:

```
frontend/
├── src/
│   ├── assets/
│   │   ├── config.sample.yaml  # Template configuration
│   │   └── config.yaml         # Your configuration (created by you)
│   ├── pages/
│   │   ├── kiosk/             # Main kiosk interface
│   │   └── remote/            # Mobile remote control
│   ├── hooks/                 # React hooks (WebSocket, Uneeq, etc.)
│   └── contexts/              # Global state management
├── public/                    # Static assets
└── package.json              # Dependencies and scripts
```

## Development Workflow

### Making Changes

1. Edit source files in `src/`
2. Vite will hot-reload changes automatically
3. Check browser console for errors

### Useful Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# View documentation
npm run docs
```

### Debug Mode

In development environment, you'll have access to:
- Performance monitoring overlay
- Debug panel (if configured)
- Detailed console logging
- React Developer Tools

## Next Steps

1. **Test the Application**:
   - Click "Start Experience" to begin
   - Try different language options
   - Test with mobile remote control

2. **Customize Configuration**:
   - Add your own Uneeq persona keys
   - Configure languages and render modes
   - Adjust backend endpoints

3. **Read Documentation**:
   - [Architecture Overview](https://interface-149017.gitlab.io/#/pages/main)
   - [Configuration Guide](https://interface-149017.gitlab.io/#/pages/core/configuration)
   - [Development Guide](https://interface-149017.gitlab.io/#/pages/kiosk/overview)

## Getting Help

If you encounter issues:

1. Check the browser console (F12) for error messages
2. Verify all services are running (frontend + backend)
3. Ensure configuration file exists and is valid YAML
4. Check that ports 3000, 3001, and 5173 are not blocked
5. Review the troubleshooting section in the main README

---

*Last updated: November 2024*