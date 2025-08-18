# Meeting Room Booking System - Login Page

## Features

The login page has been completely updated with the following features:

### ✅ Form Validation
- **Real-time validation** on blur and input events
- **Helper text** that shows when fields are empty or valid
- **Error messages** that appear below fields when validation fails
- **Visual feedback** with error/success states on input fields
- **Prevents submission** until all fields are valid

### ✅ API Integration
- **Real API support** with configurable endpoints
- **Demo API fallback** for development and testing
- **Proper error handling** for network failures
- **Loading states** during API calls
- **Token management** for authenticated sessions

### ✅ User Experience
- **Toast notifications** for success/error messages
- **Loading spinner** on submit button during API calls
- **Password visibility toggle** for better usability
- **Responsive design** that works on all devices
- **Accessibility features** with proper labels and ARIA

### ✅ Security Features
- **Session management** with automatic timeout
- **Token-based authentication** 
- **Input sanitization** and validation
- **CSRF protection** ready (when backend supports it)

## Demo Credentials

For testing purposes, you can use these demo accounts:

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| `admin@company.com` | `password` | Manager | dashboard, booking, minutes, admin |
| `jane@company.com` | `password` | Developer | dashboard, booking, minutes |
| `mike@company.com` | `password` | Designer | dashboard, booking |

## API Integration

### For Real Backend Integration

1. **Update API Configuration**
   Edit `js/api-config.js` and change the `baseURL` to your actual backend URL:
   ```javascript
   this.baseURL = 'https://your-api-domain.com/api/v1';
   ```

2. **Backend API Requirements**
   Your backend should provide these endpoints:
   - `POST /auth/login` - Accepts `{email, password}` and returns user data with token
   - `POST /auth/logout` - Handles user logout
   - `POST /auth/refresh` - Refreshes expired tokens
   - `GET /user/profile` - Returns current user profile

3. **Expected Response Format**
   ```json
   {
     "success": true,
     "data": {
       "user": {
         "id": 1,
         "name": "John Doe",
         "email": "john@company.com",
         "role": "Manager",
         "permissions": ["dashboard", "booking", "minutes", "admin"],
         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
       }
     }
   }
   ```

### For Development/Demo

The system automatically falls back to a demo API that simulates network delays and responses. No configuration needed.

## File Structure

```
├── login.html              # Main login page
├── css/
│   ├── style.css          # Main styles including form validation
│   └── components.css     # Component-specific styles
├── js/
│   ├── api-config.js      # API configuration and methods
│   ├── auth.js            # Authentication logic and validation
│   ├── router.js          # Navigation and routing
│   └── utils.js           # Utility functions
```

## Customization

### Styling
- Colors are defined as CSS variables in `css/style.css`
- Form validation styles can be customized in the `.input-field.error` and `.input-field.success` classes
- Toast notification styles are in the `.toast` classes

### Validation Rules
- Email validation uses a standard email regex
- Password minimum length is 6 characters
- Custom validation can be added in the `validateField` method in `auth.js`

### Toast Notifications
- Auto-dismiss after 5 seconds
- Manual close button
- Progress bar animation
- 4 types: success, error, warning, info

## Browser Support

- Modern browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- ES6+ features required
- Fetch API support required

## Security Considerations

- **Never store passwords** in localStorage
- **Use HTTPS** in production
- **Implement rate limiting** on your backend
- **Validate all inputs** on both client and server
- **Use secure session tokens** with proper expiration
- **Implement CSRF protection** for production use

## Troubleshooting

### Common Issues

1. **Form not submitting**
   - Check browser console for JavaScript errors
   - Ensure all required fields are filled
   - Verify validation is passing

2. **API calls failing**
   - Check network tab for failed requests
   - Verify API endpoint URLs are correct
   - Ensure CORS is properly configured on backend

3. **Toast notifications not showing**
   - Check if `toastContainer` element exists in DOM
   - Verify CSS animations are working
   - Check for JavaScript errors

### Debug Mode

Enable debug logging by adding this to the browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## Future Enhancements

- [ ] Remember me functionality
- [ ] Two-factor authentication
- [ ] Social login integration
- [ ] Password strength indicator
- [ ] Account lockout after failed attempts
- [ ] Email verification flow
- [ ] Password reset functionality 