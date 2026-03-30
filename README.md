# Study Partner Web - React Frontend

React frontend application for Study Partner.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
study-partner-web/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/          # Reusable components
│   │   ├── Layout.js
│   │   ├── Navbar.js
│   │   └── PrivateRoute.js
│   ├── pages/               # Page components
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   ├── Tasks.js
│   │   └── Sessions.js
│   ├── services/            # API services
│   │   └── api.js
│   ├── store/               # State management
│   │   └── authStore.js
│   ├── App.js               # Main app component
│   ├── index.js             # Entry point
│   └── index.css            # Global styles
└── package.json
```

## 🎨 Features

- **Authentication**: Login/Register with JWT
- **Dashboard**: Overview of study progress
- **Task Management**: Create and manage study tasks
- **Study Sessions**: Track study time
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Available Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:unit

# Run integration tests
npm run test:integration

# Run smoke tests (Playwright)
npm run test:smoke
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
REACT_APP_API_URL=http://localhost:8080
```

## 📦 Building for Production

```bash
npm run build
```

Builds the app for production to the `build` folder.

## 🚀 Deployment

The build folder is ready to be deployed. You can deploy to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Or any static hosting service

## 🔗 API Integration

The app connects to the backend API at the URL specified in `REACT_APP_API_URL`.

API endpoints:
- `/api/v1/auth/*` - Authentication
- `/api/v1/tasks/*` - Task management
- `/api/v1/sessions/*` - Study sessions


