# React Router Setup

This application now has full routing configured with React Router v6.

## 🛣️ Available Routes

### Authentication Routes (No Layout)
- **`/`** - Redirects to `/login`
- **`/login`** - Login page (Landing page)
- **`/signup`** - Sign up page

### Application Routes (With Layout)
- **`/home`** - Home page (after login)
- **`/about`** - About page

### Fallback
- **`*`** (any other route) - Redirects to `/login`

## 📂 File Structure

```
src/
├── App.jsx                 # Main app with routing configuration
├── pages/
│   ├── Login.jsx          # Login page with navigation
│   ├── SignUp.jsx         # Sign up page with navigation
│   ├── Home.jsx           # Home page (protected)
│   └── About.jsx          # About page (protected)
└── components/
    └── layout/
        ├── Layout.jsx     # Layout wrapper with Header/Footer
        └── Header.jsx     # Header with navigation links
```

## 🔄 Navigation Flow

1. **App Loads** → User lands on `/login`
2. **Login Success** → Navigates to `/home`
3. **Sign Up Link** → Navigates to `/signup`
4. **Sign Up Success** → Navigates back to `/login`
5. **Logout** → Navigates to `/login`

## 🎯 Key Features

### Programmatic Navigation
Both Login and SignUp pages use `useNavigate()` hook:

```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/home'); // After successful login
navigate('/login'); // After signup or logout
```

### Link Components
All navigation links use React Router's `Link` component:

```jsx
import { Link } from 'react-router-dom';

<Link to="/signup">Sign Up</Link>
<Link to="/login">Log In</Link>
```

### Layout Protection
Authentication pages (Login/SignUp) are displayed without the header/footer, while app pages (Home/About) include the full layout:

```jsx
// Auth routes - no layout
<Route path="/login" element={<Login />} />

// App routes - with layout
<Route path="/home" element={<Layout><Home /></Layout>} />
```

## 🚀 Usage

### Starting the App
```bash
npm run dev
```

The app will start and automatically redirect to the login page.

### Navigation Example

**From Login Page:**
```jsx
// After successful login
navigate('/home');
```

**From Any Page:**
```jsx
import { Link } from 'react-router-dom';

<Link to="/about">Go to About</Link>
```

## 🔐 Future Enhancements

To add authentication protection:

1. **Create Protected Route Component:**
```jsx
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = // check your auth state
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};
```

2. **Wrap Protected Routes:**
```jsx
<Route 
  path="/home" 
  element={
    <ProtectedRoute>
      <Layout><Home /></Layout>
    </ProtectedRoute>
  } 
/>
```

## 📦 Dependencies

- **react-router-dom**: `^6.x.x` - For routing functionality

## 🎨 Styling

All Link components inherit styling from their parent components. The CSS has been updated to properly style React Router's `Link` components just like regular anchor tags.
