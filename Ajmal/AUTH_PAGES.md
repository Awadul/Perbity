# Authentication Pages

This project includes Login and Sign Up pages with form validation.

## Login Page

**Location:** `src/pages/Login.jsx`

**Fields:**
- Username (required)
- Email (required, validated)

**Features:**
- Form validation
- Error messages
- Loading state
- Responsive design
- Link to Sign Up page

**Usage:**
```jsx
import { Login } from './pages';
// Or
import Login from './pages/Login';
```

## Sign Up Page

**Location:** `src/pages/SignUp.jsx`

**Fields:**
- Username (required, minimum 3 characters)
- Phone Number (required, validated format)
- Password (required, minimum 8 characters with 1 uppercase and 1 number)
- Confirm Password (required, must match password)

**Features:**
- Form validation with real-time feedback
- Password strength requirements
- Password visibility toggle
- Error messages
- Loading state
- Responsive design
- Link to Login page

**Usage:**
```jsx
import { SignUp } from './pages';
// Or
import SignUp from './pages/SignUp';
```

## Styling

Both pages feature:
- Beautiful gradient backgrounds
- Card-based layout
- Smooth animations and transitions
- Mobile responsive design
- Accessible form elements

## Validation Rules

### Username
- Required field
- Minimum 3 characters (Sign Up only)

### Email (Login)
- Required field
- Must be valid email format

### Phone Number (Sign Up)
- Required field
- Must be 10-15 digits
- Accepts various formats: +1 (555) 123-4567, 555-123-4567, etc.

### Password (Sign Up)
- Required field
- Minimum 8 characters
- Must contain at least 1 uppercase letter
- Must contain at least 1 number

## Integration

To integrate these pages into your app:

1. **Using React Router:**
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login, SignUp, Home } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}
```

2. **API Integration:**
Update the `handleSubmit` functions in both pages to connect to your backend API:

```jsx
// In Login.jsx
try {
  const response = await apiService.post('/auth/login', formData);
  // Handle success
} catch (error) {
  // Handle error
}

// In SignUp.jsx
try {
  const response = await apiService.post('/auth/signup', formData);
  // Handle success
} catch (error) {
  // Handle error
}
```

## Customization

You can customize the styling by editing:
- `src/pages/Login.css`
- `src/pages/SignUp.css`

Change colors, spacing, and other design elements to match your brand.
