# How-to Guide: Error Boundary Usage

This guide explains how ErrorBoundary is implemented and used in this kiosk application to provide resilient error handling.

## 🎯 Our Implementation

**App-Level Protection**
We use ErrorBoundary as a top-level safety net that wraps the entire application, catching any React component errors and preventing the kiosk from becoming unusable.

**Current Setup:** Located in `main.tsx` - protects the entire app including routing, lazy-loaded pages, and all components.

## 🚀 How We Use ErrorBoundary

### **1. Application-Level Protection**
```typescript
// main.tsx - Wraps the entire app
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ConfigLoader>
        <LanguageProvider>
          <BrowserRouter>
            <Routes> 
              <Route path="/" element={<KioskPage />} />
              <Route path="/remote/:kioskConnectionId" element={<RemotePage />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </ConfigLoader>
    </QueryClientProvider>
  </ErrorBoundary>
)
```

### **2. Development Testing**
```typescript
// KioskPage.tsx - ErrorTester for development
<ErrorTester show={config?.app?.environment === 'development'} />
```

### **3. Themed Error UI**
Our ErrorBoundary provides:
- Branded error page with theme variables
- "Try Again" button to reset the error state
- "Refresh Page" button for complete recovery
- Development error details in non-production environments

## ⚡ What ErrorBoundary Catches

**✅ Catches:** React component lifecycle errors (render, constructor, lifecycle methods)
**❌ Does NOT Catch:** Event handler errors, async operations, server-side errors

Use ErrorTester component to verify which errors are caught vs. handled separately.

## 🎯 Alternative Approaches

While we use app-level protection, ErrorBoundary can also be used for:

### **Component-Level Protection**
```typescript
// Isolate specific components
<ErrorBoundary>
  <RiskyThirdPartyComponent />
</ErrorBoundary>
```

### **Custom Error Handling**
```typescript
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom logging/reporting
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## 🔧 Available Props

| Prop | Type | Purpose |
|------|------|---------|
| `children` | ReactNode | Components to protect |
| `fallback` | ReactNode | Custom error UI |
| `onError` | Function | Error callback for logging/reporting |
| `resetOnPropsChange` | boolean | Reset error when children change |

## 🐛 Development Testing

**ErrorTester Component**
Use the included ErrorTester to verify ErrorBoundary behavior during development:

```typescript
// KioskPage.tsx - Already implemented
<ErrorTester show={config?.app?.environment === 'development'} />
```

The ErrorTester allows you to trigger different error types to verify:
- **Render errors**: Caught by ErrorBoundary ✅  
- **Async errors**: Not caught, handle with try-catch ❌
- **Event errors**: Not caught, handle with try-catch ❌

## 🎉 Summary

**Our Implementation:**
- **App-level protection** catches all React component errors
- **Themed recovery UI** maintains brand consistency
- **Development testing** via ErrorTester component
- **Console logging** for debugging support

**Key Benefit**: Prevents kiosk crashes while providing clear recovery options for users and detailed debugging information for developers.
