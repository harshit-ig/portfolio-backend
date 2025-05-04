# Portfolio Backend API

A robust, secure, and production-ready REST API for managing your portfolio data, built with Node.js, Express, and MongoDB.

## Table of Contents
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Dependencies](#dependencies)
- [Environment Variables](#environment-variables)
  - [Environment Validation](#environment-validation)
- [Initial Admin Setup](#initial-admin-setup)
- [Folder Structure](#folder-structure)
- [API Structure](#api-structure)
  - [API Response Formats](#api-response-formats)
  - [HTTP Status Codes](#http-status-codes)
- [Authentication](#authentication)
  - [Authentication Flow](#authentication-flow)
  - [Authentication Endpoints](#authentication-endpoints)
- [Available Endpoints](#available-endpoints)
- [API Request & Response Examples](#api-request--response-examples)
- [Testing](#testing)
  - [API Test Script](#api-test-script)
  - [Jest Testing](#jest-testing)
  - [Postman Collection](#postman-collection)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [File Uploads](#file-uploads)
  - [Uploads Directory](#uploads-directory)
  - [Accessing Uploaded Files](#accessing-uploaded-files)
- [Security Features](#security-features)
- [Middleware](#middleware)
  - [Authentication Middleware](#authentication-middleware)
  - [Validation Middleware](#validation-middleware)
  - [Rate Limiting](#rate-limiting)
  - [Logging](#logging)
  - [Error Handling](#error-handling-1)
  - [File Upload](#file-upload)
- [Development](#development)
  - [Logging](#logging-1)
  - [Environment-specific Features](#environment-specific-features)
  - [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
  - [Common Issues](#common-issues)
  - [Performance Optimization](#performance-optimization)
  - [Deployment Considerations](#deployment-considerations)
- [License](#license)

## Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database

### Installation

1. Clone the repository
2. Install dependencies:
```bash
cd server
npm install
```

3. Create a `.env` file in the server directory (use `.env.example` as a template)
4. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### Dependencies

The server uses the following key dependencies:

- **Express**: Web server framework
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication via jsonwebtoken
- **bcryptjs**: Password hashing
- **express-validator**: Request validation
- **multer**: File upload handling
- **helmet**: Security headers
- **compression**: Response compression
- **cors**: Cross-origin resource sharing
- **morgan**: Logging middleware
- **express-rate-limit**: Rate limiting
- **express-mongo-sanitize**: Prevents MongoDB injection
- **hpp**: HTTP Parameter Pollution protection
- **xss-clean**: XSS protection

Development dependencies include:
- **nodemon**: Auto-restart during development
- **jest & supertest**: Testing framework
- **eslint**: Code linting
- **axios**: HTTP client for API testing script

## Environment Variables

Create a `.env` file with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/portfolio

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# File Upload Limits
MAX_FILE_SIZE=5242880  # 5MB in bytes

# Admin User (for initial setup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPassword123!

# Optional: Logging
LOG_LEVEL=info  # debug, info, warn, error
```

### Environment Validation

The application includes automatic environment variable validation on startup:

- Required variables are checked for presence
- MongoDB URI format is validated
- JWT_SECRET is checked for minimum length (32 characters)
- PORT is validated to be a valid port number
- CLIENT_URL is validated to be a valid URL

If any validation fails, the application will exit with a helpful error message.

## Initial Admin Setup

To create an initial admin user, run the following command:

```bash
node createAdmin.js
```

This will create an admin user with the email and password specified in your .env file. If no values are provided, it will use the default:
- Email: admin@example.com
- Password: admin123

**Important**: Change the default password immediately after first login!

## Folder Structure

The backend follows a modular structure:

```
server/
├── config/             # Configuration files and environment validation
├── middleware/         # Express middleware (auth, validation, error handling)
├── models/             # Mongoose data models
├── routes/             # API route handlers
├── logs/               # Log files (access and error logs)
├── uploads/            # Uploaded files (images and documents)
│   ├── images/         # Uploaded images
│   └── documents/      # Uploaded documents
├── scripts/            # Utility scripts
├── server.js           # Main application entry point
├── createAdmin.js      # Script to create admin user
└── package.json        # Project dependencies
```

## API Structure

The API follows RESTful principles and includes versioning:

- All endpoints are prefixed with `/api/v1/`
- Responses follow a consistent format:
  ```json
  {
    "status": "success|error|fail",
    "data": { /* returned data */ },
    "message": "Descriptive message",
    "pagination": { /* pagination info if applicable */ }
  }
  ```

### API Response Formats

#### Success Response
```json
{
  "status": "success",
  "data": { /* data object or array */ },
  "message": "Operation successful"
}
```

#### Paginated Response
```json
{
  "status": "success",
  "data": [ /* array of items */ ],
  "pagination": {
    "total": 50,
    "limit": 10,
    "page": 1,
    "pages": 5
  }
}
```

#### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [ /* validation errors if applicable */ ]
}
```

### HTTP Status Codes

The API uses standard HTTP status codes:

| Code | Description | Examples |
|------|-------------|----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid data, validation errors |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected server-side errors |

## Authentication

- JWT-based authentication
- Protected routes require an `x-auth-token` header
- Token expires after the configured time (default: 7 days)

### Authentication Flow

1. Register (admin only): `POST /api/v1/auth/register`
2. Login: `POST /api/v1/auth/login`
3. Use the received token in subsequent requests:
   ```
   x-auth-token: your_jwt_token
   ```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/v1/auth/login` | Login and get JWT token | No |
| GET | `/api/v1/auth/user` | Get currently logged in user | Yes |
| PUT | `/api/v1/auth/password` | Update user password | Yes |

## Available Endpoints

### Projects

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/v1/projects` | Get all projects (paginated) | No |
| GET | `/api/v1/projects/search` | Search projects | No |
| POST | `/api/v1/projects` | Create a project | Yes |
| PUT | `/api/v1/projects/:id` | Update a project | Yes |
| DELETE | `/api/v1/projects/:id` | Delete a project | Yes |

#### Query Parameters for GET /projects
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)
- `featured`: Filter by featured status (true/false)

#### Query Parameters for GET /projects/search
- `q`: Search query (required)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

## API Request & Response Examples

### Authentication

#### Login

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "YourPassword123!"
}
```

**Success Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "status": "error",
  "message": "Invalid Credentials"
}
```

### Projects

#### Get All Projects

**Request:**
```http
GET /api/v1/projects?page=1&limit=10&featured=true
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "success",
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "title": "Portfolio Website",
      "description": "A personal portfolio website built with React",
      "technologies": ["React", "Node.js", "MongoDB"],
      "githubUrl": "https://github.com/username/portfolio",
      "liveUrl": "https://portfolio.example.com",
      "featured": true,
      "order": 1,
      "createdAt": "2023-01-15T12:00:00.000Z",
      "updatedAt": "2023-01-15T12:00:00.000Z"
    },
    // More projects...
  ],
  "pagination": {
    "total": 15,
    "limit": 10,
    "page": 1,
    "pages": 2
  }
}
```

#### Create Project

**Request:**
```http
POST /api/v1/projects
Content-Type: application/json
x-auth-token: your_jwt_token

{
  "title": "E-commerce Platform",
  "description": "A full-stack e-commerce platform with payment integration",
  "technologies": ["React", "Node.js", "Express", "MongoDB", "Stripe"],
  "githubUrl": "https://github.com/username/ecommerce",
  "liveUrl": "https://ecommerce.example.com",
  "featured": true,
  "order": 2
}
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "status": "success",
  "data": {
    "_id": "60d21b4667d0d8992e610c86",
    "title": "E-commerce Platform",
    "description": "A full-stack e-commerce platform with payment integration",
    "technologies": ["React", "Node.js", "Express", "MongoDB", "Stripe"],
    "githubUrl": "https://github.com/username/ecommerce",
    "liveUrl": "https://ecommerce.example.com",
    "featured": true,
    "order": 2,
    "createdAt": "2023-01-16T14:30:00.000Z",
    "updatedAt": "2023-01-16T14:30:00.000Z"
  },
  "message": "Project created successfully"
}
```

### Profile

#### Upload Avatar

**Request:**
```http
POST /api/v1/profile/avatar
Content-Type: multipart/form-data
x-auth-token: your_jwt_token

Form Data:
  avatar: [file]
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "success",
  "data": {
    "avatarUrl": "/uploads/images/avatar-1642342800000.jpg"
  },
  "message": "Avatar uploaded successfully"
}
```

### Skills

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/v1/skills` | Get all skills | No |
| POST | `/api/v1/skills` | Create a skill | Yes |
| PUT | `/api/v1/skills/:id` | Update a skill | Yes |
| DELETE | `/api/v1/skills/:id` | Delete a skill | Yes |

### Testimonials

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/v1/testimonials` | Get all testimonials | No |
| POST | `/api/v1/testimonials` | Create a testimonial | Yes |
| PUT | `/api/v1/testimonials/:id` | Update a testimonial | Yes |
| DELETE | `/api/v1/testimonials/:id` | Delete a testimonial | Yes |

### Profile

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/v1/profile` | Get profile data | No |
| POST | `/api/v1/profile` | Create profile data | Yes |
| PUT | `/api/v1/profile` | Update profile data | Yes |
| POST | `/api/v1/profile/avatar` | Upload profile avatar | Yes |
| POST | `/api/v1/profile/resume` | Upload profile resume | Yes |

### About

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/v1/about` | Get about data | No |
| POST | `/api/v1/about` | Create about data | Yes |
| PUT | `/api/v1/about` | Update about data | Yes |

## Testing

### API Test Script

The server includes a simple API testing script that you can run to verify your setup:

```bash
# Run the API test script
npm run test:api
```

The test script:
- Tests public endpoints (projects, skills, profile)
- Tests authenticated endpoints if an AUTH_TOKEN is provided
- Provides detailed feedback on API responses
- Automatically cleans up any test data created

You can set the following environment variables for testing:
- `API_URL`: Custom API URL (default: http://localhost:5000/api/v1)
- `AUTH_TOKEN`: Your JWT token for testing authenticated endpoints

### Jest Testing

The project is configured with Jest for unit and integration testing:

```bash
# Run tests
npm test
```

The test suite uses:
- **Jest**: Testing framework
- **Supertest**: HTTP assertions for testing API endpoints

### Postman Collection

A Postman collection is included to help you test the API interactively:

1. Import the `portfolio-api.postman_collection.json` file into Postman
2. Set up the `baseUrl` variable in your Postman environment (default: http://localhost:5000)
3. Set your JWT token in the `token` variable after logging in

The Postman collection includes pre-configured requests for the following endpoints:
- Authentication: Login
- Projects: Get all, Search, Create, Update, Delete
- Skills: Get all
- Profile: Get profile data
- You can use these as templates to test other endpoints

To test authenticated endpoints:
1. First make a successful login request
2. The response will include a JWT token
3. Copy this token and set it as the value for the `token` variable in your Postman environment
4. All authenticated requests will now work properly

## Data Models

### Project
```javascript
{
  title: String,          // required
  description: String,    // required
  technologies: [String], // required
  imageUrl: String,       // optional
  githubUrl: String,      // optional
  liveUrl: String,        // optional
  featured: Boolean,      // default: false
  order: Number,          // default: 0
  createdAt: Date,        // auto-generated
  updatedAt: Date         // auto-generated
}
```

### Skill
```javascript
{
  name: String,           // required
  category: String,       // required, enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'Other']
  proficiency: Number,    // required, 0-100
  order: Number,          // default: 0
  createdAt: Date         // auto-generated
}
```

### Testimonial
```javascript
{
  name: String,           // required
  position: String,       // required
  company: String,        // required
  content: String,        // required
  imageUrl: String,       // optional
  featured: Boolean,      // default: false
  order: Number,          // default: 0
  createdAt: Date         // auto-generated
}
```

### Profile
```javascript
{
  name: String,           // required
  title: String,          // required
  bio: String,            // required
  about: String,          // required
  location: String,       // required
  email: String,          // required
  phone: String,          // required
  resumeUrl: String,      // optional
  avatarUrl: String,      // optional
  social: {
    github: String,       // optional
    linkedin: String,     // optional
    twitter: String,      // optional
    instagram: String     // optional
  },
  skills: {
    frontend: [String],   // optional
    backend: [String],    // optional
    tools: [String]       // optional
  }
}
```

### User
```javascript
{
  email: String,          // required
  password: String,       // required (stored hashed)
  createdAt: Date,        // auto-generated
  updatedAt: Date         // auto-generated
}
```

## Error Handling

The API provides detailed error messages with appropriate HTTP status codes:

- 400: Bad Request (validation errors, invalid data)
- 401: Unauthorized (missing or invalid token)
- 404: Not Found (resource not found)
- 500: Server Error (unexpected errors)

Error responses include:
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

## File Uploads

File uploads are handled securely through the profile routes:

- `/api/v1/profile/avatar` - Upload profile avatar
- `/api/v1/profile/resume` - Upload resume

These endpoints support:
- Image files (JPEG, PNG, GIF) for avatars
- Document files (PDF) for resumes
- Secure random filenames
- Virus scanning (placeholder implementation)
- File type validation
- Size limits (max 5MB)

### Uploads Directory

The server automatically creates the uploads directory structure:

```
uploads/
├── images/      # For avatar images (jpg, png, gif)
│   └── ...
└── documents/   # For resume files (pdf)
    └── ...
```

### Accessing Uploaded Files

Uploaded files are accessible via:
- Avatar: `/uploads/images/[filename]`
- Resume: `/uploads/documents/[filename]`

The server automatically serves static files from the uploads directory through the `/uploads` endpoint.

## Security Features

The API includes multiple security measures:

- Helmet for HTTP headers security
- CORS configuration
- Rate limiting to prevent abuse
- XSS protection
- MongoDB injection protection
- Parameter pollution prevention
- Input validation for all endpoints
- Secure password hashing
- JWT authentication

## Middleware

The server uses several middleware components to provide security, validation, and logging:

### Authentication Middleware

The `auth.js` middleware:
- Verifies JWT tokens for protected routes
- Extracts user information from valid tokens
- Returns appropriate 401 status for invalid/expired tokens

### Validation Middleware

The `validator.js` middleware:
- Provides centralized validation using express-validator
- Includes common validation rules for IDs, emails, passwords
- Contains model-specific validation rules (e.g., for projects)
- Returns standardized validation error responses

### Rate Limiting

The `rateLimiter.js` middleware implements two types of rate limits:
- **API Rate Limiter**: 100 requests per 15 minutes per IP
- **Login Rate Limiter**: 5 login attempts per hour per IP

These help prevent brute force attacks and API abuse.

### Logging

The `logger.js` middleware implements detailed logging with morgan:
- **Development**: Detailed request/response logging to console
- **Production**: Access logs to `logs/access.log` and error logs to `logs/error.log`
- Automatically sanitizes sensitive data (passwords, tokens)

### Error Handling

The `errorHandler.js` middleware:
- Centralizes error handling for consistent responses
- Provides detailed errors in development
- Sanitized error messages in production
- Handles various error types (Mongoose, JWT, validation, etc.)

### File Upload

The `fileUpload.js` middleware:
- Handles secure file uploads for images and documents
- Enforces file type validation and size limits
- Generates secure random filenames
- Creates upload directories if they don't exist

## Development

### Logging

In development mode, detailed logs are printed to the console. In production, logs are saved to:
- `/logs/access.log`: Successful requests
- `/logs/error.log`: Failed requests

### Environment-specific Features

- Development: Detailed error messages and stack traces
- Production: Limited error information for security

### Available Scripts

- `npm start`: Start in production mode
- `npm run dev`: Start with nodemon for development
- `npm run lint`: Run ESLint
- `npm test`: Run tests
- `npm run test:api`: Run the API test script
- `node createAdmin.js`: Create admin user

## Troubleshooting

### Common Issues

#### MongoDB Connection Issues
- Check if MongoDB is running: `mongod --version`
- Verify the connection string in `.env` file
- Ensure network connectivity if using a remote database
- Check MongoDB logs for any issues

#### JWT Authentication Failures
- Ensure the JWT_SECRET in .env is set and hasn't changed
- Check token expiration (default is 7 days)
- Verify you're sending the token in the `x-auth-token` header

#### File Upload Problems
- Check if the uploads directory has proper write permissions
- Verify file size limits (max 5MB)
- Ensure you're using multipart/form-data content type

#### API Rate Limiting
- Default limit is 100 requests per 15 minutes per IP
- Login endpoint is limited to 5 attempts per hour per IP
- In development, you may need to restart the server to reset limits

### Performance Optimization

The API includes several performance optimizations:

1. **Database Indexes**: MongoDB indexes are created for frequently queried fields
   - Text indexes on project titles and descriptions for efficient search
   - Indexes on `featured` field for filtered queries
   - Indexes on `order` field for sorted queries
   - Compound indexes where appropriate

2. **Query Optimization**: Pagination is implemented for large collections
3. **Response Compression**: HTTP compression using the compression middleware
4. **Caching**: Headers for client-side caching of static resources
5. **Text Search**: Efficient text search using MongoDB text indexes
6. **Lean Queries**: Using Mongoose's lean queries for read-only operations
7. **Projection**: Only selecting needed fields in database queries
8. **Connection Pooling**: MongoDB connection pool for better performance

### Deployment Considerations

For production deployment:

1. **Environment Variables**: Ensure all production env vars are properly set
2. **Process Management**: Use PM2 or similar for process management
3. **Reverse Proxy**: Set up Nginx or Apache as a reverse proxy
4. **HTTPS**: Configure SSL certificates
5. **Monitoring**: Set up monitoring and alerting
6. **Backups**: Schedule regular database backups

## License

ISC License 