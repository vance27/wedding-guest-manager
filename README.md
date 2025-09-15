# Wedding Guest Manager

A comprehensive full-stack application for managing wedding guests, relationships, and table assignments.

## Features

- **Guest Management**: Add, edit, and manage wedding guests with RSVP status tracking
- **Relationship System**: Define and visualize connections between guests
- **Graph Visualization**: Interactive network graph showing guest relationships
- **Table Assignment**: Smart table assignment with relationship-aware suggestions
- **Database Integration**: PostgreSQL with Prisma ORM
- **Real-time Updates**: tRPC for type-safe API communication

## Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Express + tRPC
- **Database**: PostgreSQL + Prisma
- **Visualization**: react-force-graph-2d + D3.js

## Setup Instructions

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Database Setup**
   - Create a PostgreSQL database
   - Copy `.env.example` to `.env` and update the `DATABASE_URL`
   - Run Prisma migrations:
     \`\`\`bash
     npm run db:push
     npm run db:generate
     \`\`\`

3. **Seed Database** (Optional)
   - Run the seed script to add sample data:
     \`\`\`bash
     # Connect to your database and run the SQL in scripts/seed-database.sql
     \`\`\`

4. **Start Development Servers**
   \`\`\`bash
   npm run dev
   \`\`\`
   This starts both the React client (port 5173) and tRPC server (port 3001)

## Usage

1. **Guests Tab**: Manage your guest list, add new guests, and track RSVP status
2. **Relationships Tab**: Define connections between guests (family, friends, etc.)
3. **Graph View**: Visualize the network of guest relationships
4. **Table Assignment**: Create tables and assign guests with smart suggestions based on relationships

## Database Schema

- **Guests**: Personal information, RSVP status, dietary restrictions
- **Relationships**: Connections between guests with type and strength
- **Tables**: Table information with capacity and assigned guests

## API Endpoints

The tRPC server provides type-safe endpoints for:
- Guest CRUD operations
- Relationship management
- Table assignment and management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
