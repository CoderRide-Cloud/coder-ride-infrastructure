# Coder Ride Frontend

A modern Next.js frontend for the Coder Ride community platform, featuring member profiles, project showcases, events, and an admin dashboard.

## Features

- **Home Page**: Featured events and community leads
- **Members Page**: Browse all members with skill-based filtering
- **Member Profiles**: View detailed member profiles with projects and links
- **Projects Page**: Explore projects with category and tag filtering
- **Events Page**: Discover upcoming and past events
- **Authentication**: GitHub OAuth integration
- **Admin Dashboard**: Role-based access control for managing members, projects, and events

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Authentication**: NextAuth.js with GitHub provider
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- GitHub OAuth App (for authentication)

### 1. Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Coder Ride
   - **Homepage URL**: `http://localhost:3000` (development) or your production domain
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and generate a Client Secret

### 2. Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-random-secret-here
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret
```

Generate a secure secret for `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── pages/
│   ├── index.tsx              # Home page
│   ├── members/
│   │   ├── index.tsx          # Members listing
│   │   └── [id].tsx           # Member profile
│   ├── projects/
│   │   └── index.tsx          # Projects listing
│   ├── events/
│   │   └── index.tsx          # Events listing
│   ├── profile/
│   │   └── [id].tsx           # User profile (private)
│   ├── admin/
│   │   └── index.tsx          # Admin dashboard
│   ├── auth/
│   │   └── signin.tsx         # Sign in page
│   └── api/
│       └── auth/
│           └── [...nextauth].ts  # NextAuth configuration
├── components/
│   ├── Layout.tsx             # Main layout wrapper
│   ├── Navbar.tsx             # Navigation bar
│   ├── Footer.tsx             # Footer
│   ├── MemberCard.tsx         # Member card component
│   ├── ProjectCard.tsx        # Project card component
│   └── EventCard.tsx          # Event card component
├── lib/
│   ├── api.ts                 # API client
│   └── types.ts               # TypeScript types
├── styles/
│   └── globals.css            # Global styles
└── public/                    # Static assets
```

## Key Features Explained

### Authentication Flow

1. User clicks "Sign in with GitHub"
2. GitHub OAuth redirects user to GitHub authorization
3. After approval, user is redirected back to the app
4. Frontend calls backend to create/update user profile
5. User is logged in and profile is created

### Role-Based Access Control

- **PENDING**: New users who haven't been approved
- **MEMBER**: Approved community members
- **ADMIN**: Can approve members, projects, and manage events

Admin features are only visible to users with ADMIN role.

### Filtering and Search

- **Members**: Filter by skills using a dropdown
- **Projects**: Filter by category (Web, AI, UI/UX) and tags
- **Events**: Toggle between upcoming and past events

## API Integration

The frontend uses axios to communicate with the backend API. All API calls are made through `lib/api.ts`:

```typescript
import { memberApi, projectApi, eventApi } from '@/lib/api';

// Get all members
const members = await memberApi.getAll();

// Get specific member
const member = await memberApi.getById(1);

// Get all projects with filters
const projects = await projectApi.getAll({ 
  category: 'WEB',
  tagIds: [1, 2]
});
```

## Styling

The project uses Tailwind CSS with custom components defined in `styles/globals.css`:

- `.card` - Default card style
- `.card-hover` - Card with hover effects
- `.btn` - Base button style
- `.btn-primary` - Primary CTA button
- `.btn-secondary` - Secondary button
- `.badge` - Badge component
- `.section-title` - Large section title

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Troubleshooting

### OAuth not working?
- Verify GitHub OAuth app credentials
- Ensure callback URL matches configuration
- Check NEXTAUTH_SECRET is set

### API calls failing?
- Verify backend is running on port 5000
- Check NEXT_PUBLIC_API_URL environment variable
- Ensure CORS is configured correctly in backend

### Styling issues?
- Clear `.next` folder and rebuild
- Verify Tailwind CSS configuration

## Contributing

See the main project README for contribution guidelines.

## License

MIT
