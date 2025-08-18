# MeetingHub Deployment Guide

This guide will help you deploy the MeetingHub meeting room booking system to various hosting platforms.

## 🚀 Quick Start

### 1. **Local Development**
```bash
# Clone the repository
git clone <your-repo-url>
cd meeting-room-booking-system

# Start a local server (Python 3)
python -m http.server 8000

# Or use Node.js
npx http-server -p 8000

# Or use PHP
php -S localhost:8000

# Open in browser
open http://localhost:8000
```

### 2. **Static Hosting (Recommended for Demo)**

#### **GitHub Pages**
1. Push your code to a GitHub repository
2. Go to Settings > Pages
3. Select source branch (usually `main`)
4. Your site will be available at `https://username.github.io/repository-name`

#### **Netlify**
1. Drag and drop your project folder to [Netlify](https://netlify.com)
2. Or connect your GitHub repository
3. Your site will be deployed automatically

#### **Vercel**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts

#### **Firebase Hosting**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init hosting

# Deploy
firebase deploy
```

## 🌐 Production Deployment

### **Web Server (Apache/Nginx)**

#### **Apache Configuration**
```apache
# .htaccess file
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

# Enable CORS for API calls
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

#### **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/meetinghub;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if backend is on same server)
    location /api/ {
        proxy_pass http://localhost:7209;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### **Docker Deployment**
```dockerfile
# Dockerfile
FROM nginx:alpine

# Copy static files
COPY . /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t meetinghub .
docker run -p 80:80 meetinghub
```

## 🔧 Configuration

### **Environment Variables**
Create a `.env` file for production:
```bash
# API Configuration
API_BASE_URL=https://your-api-domain.com/api
API_TIMEOUT=30000

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
ENABLE_FILE_UPLOAD=true

# Security
SESSION_TIMEOUT=1800000
MAX_FILE_SIZE=10485760
```

### **API Configuration**
Update `js/api-config.js`:
```javascript
constructor() {
    // Production API URL
    this.baseURL = process.env.API_BASE_URL || 'https://your-api-domain.com/api';
    
    // Production settings
    this.timeout = process.env.API_TIMEOUT || 30000;
    this.retryAttempts = 3;
}
```

## 🔒 Security Considerations

### **HTTPS Setup**
```bash
# Let's Encrypt (free SSL)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# Or use Cloudflare for free SSL
```

### **Security Headers**
```apache
# Apache security headers
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:;"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
```

### **CORS Configuration**
```javascript
// If using a backend API
app.use(cors({
    origin: ['https://your-domain.com', 'https://www.your-domain.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 📊 Monitoring & Analytics

### **Google Analytics**
Add to your HTML files:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### **Error Tracking**
```javascript
// Sentry integration
import * as Sentry from "@sentry/browser";

Sentry.init({
    dsn: "your-sentry-dsn",
    environment: "production"
});
```

## 🚀 Performance Optimization

### **Build Optimization**
```bash
# Install dependencies
npm install

# Build for production
npm run build

# The build folder contains optimized files
```

### **CDN Setup**
```html
<!-- Use CDN for external libraries -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### **Image Optimization**
```bash
# Optimize images
npm install -g imagemin-cli
imagemin images/* --out-dir=optimized-images

# Use WebP format for better compression
```

## 🔄 CI/CD Pipeline

### **GitHub Actions**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
```

### **GitLab CI**
```yaml
# .gitlab-ci.yml
stages:
  - build
  - deploy

build:
  stage: build
  script:
    - echo "Building application..."
  artifacts:
    paths:
      - ./

deploy:
  stage: deploy
  script:
    - echo "Deploying to production..."
  only:
    - main
```

## 🧪 Testing

### **Local Testing**
```bash
# Test all pages
python -m http.server 8000
open http://localhost:8000/login.html
open http://localhost:8000/dashboard.html
open http://localhost:8000/booking.html
open http://localhost:8000/minutes.html
open http://localhost:8000/minutes-review.html
open http://localhost:8000/admin.html
```

### **Cross-browser Testing**
- Test on Chrome, Firefox, Safari, Edge
- Test on mobile devices
- Test with different screen sizes

## 📱 Mobile Optimization

### **PWA Setup**
```json
// manifest.json
{
  "name": "MeetingHub",
  "short_name": "MeetingHub",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🆘 Troubleshooting

### **Common Issues**

1. **CORS Errors**
   - Ensure your backend allows requests from your domain
   - Check CORS configuration

2. **API Calls Failing**
   - Verify API endpoints are correct
   - Check network tab for errors
   - Ensure backend is running

3. **Authentication Issues**
   - Clear browser storage
   - Check token expiration
   - Verify API authentication

4. **Performance Issues**
   - Enable browser caching
   - Optimize images
   - Use CDN for external resources

### **Debug Mode**
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');
console.log('Debug mode enabled');
```

## 📞 Support

For deployment issues:
1. Check the browser console for errors
2. Verify all files are uploaded correctly
3. Test locally before deploying
4. Check hosting platform logs

---

**Happy Deploying! 🚀** 