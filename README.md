# TaskFlow API

A collaborative task management API built with Node.js, Express, and MongoDB. Similar to Asana or Trello backend, it provides comprehensive project and task management with role-based access control.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing (bcrypt)
- **Role-Based Access Control**: Three roles - User, Manager, and Admin
- **Project Management**: Create, manage, and collaborate on projects
- **Task Management**: Full CRUD operations with filtering, pagination, and sorting
- **Comments System**: Add comments to tasks with attachments support
- **Activity Logging**: Comprehensive activity tracking for all operations
- **Real-time Updates**: Activity logs capture all changes for transparency
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Security**: Helmet.js for security headers, CORS enabled, rate limiting

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Logging**: Morgan, Winston
- **Security**: Helmet, express-rate-limit, CORS

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd taskflow-api
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRE=30d
BCRYPT_ROUNDS=12
```

4. Start MongoDB
```bash
mongod
```

5. Run the development server
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Documentation

Once the server is running, visit the interactive API documentation:
```
http://localhost:5000/api-docs
```

## Project Structure

```
taskflow-api/
├── src/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Route handlers and business logic
│   ├── middlewares/     # Authentication, validation, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── utils/           # Helper utilities
│   └── app.js           # Express app setup
├── server.js            # Server entry point
├── package.json         # Dependencies
├── .env                 # Environment variables
└── README.md            # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Projects
- `GET /api/projects` - List user's projects (protected)
- `POST /api/projects` - Create new project (protected)
- `GET /api/projects/:id` - Get project details (protected)
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)
- `POST /api/projects/:id/members` - Add project member (protected)
- `DELETE /api/projects/:id/members` - Remove project member (protected)

### Tasks
- `GET /api/tasks` - List tasks with filtering (protected)
- `POST /api/tasks` - Create new task (protected)
- `GET /api/tasks/:id` - Get task details (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)

### Comments
- `GET /api/comments/task/:taskId` - Get task comments (protected)
- `POST /api/comments` - Create comment (protected)
- `PUT /api/comments/:id` - Update comment (protected)
- `DELETE /api/comments/:id` - Delete comment (protected)

### Activity Logs
- `GET /api/activity` - Get activity logs (protected)
- `GET /api/activity/project/:projectId` - Get project activity logs (protected)

## Authentication

The API uses Bearer token authentication. Include the token in request headers:

```bash
Authorization: Bearer <your_jwt_token>
```

## Query Parameters

### Filtering & Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort field (prefix with `-` for descending, default: `-createdAt`)
- `status` - Filter by status
- `priority` - Filter by priority
- `projectId` - Filter by project

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Error Handling

The API implements comprehensive error handling:
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication failures)
- 403: Forbidden (authorization failures)
- 404: Not Found
- 500: Server Error

## Role-Based Access

- **User**: Can view and manage own tasks, view shared projects
- **Manager**: Can manage projects and members, manage all project tasks
- **Admin**: Full system access

## Development

### Running tests
```bash
npm test
```

### Watch mode for tests
```bash
npm run test:watch
```

### Seed database
```bash
npm run seed
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/taskflow |
| JWT_SECRET | JWT signing secret | (required) |
| JWT_EXPIRE | JWT expiration time | 30d |
| BCRYPT_ROUNDS | Password hashing rounds | 12 |

## License

MIT

## Support

For issues, feature requests, or questions, please open an issue in the repository.
