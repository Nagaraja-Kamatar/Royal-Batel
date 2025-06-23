# Cursor Clash - Arena Battle Game

## Overview

Cursor Clash is a real-time 3D arena battle game built with React Three Fiber where two players compete in a circular arena. Players control spherical characters and try to push each other out of bounds to score points. The game features physics-based movement, collision detection, 3D graphics, and sound effects.

## System Architecture

The application follows a modern full-stack architecture with a clear separation between frontend and backend:

- **Frontend**: React 18 with TypeScript, Three.js via React Three Fiber for 3D rendering
- **Backend**: Express.js server with TypeScript, prepared for PostgreSQL database integration
- **Build System**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: Zustand for game state and audio management
- **Database ORM**: Drizzle ORM configured for PostgreSQL (Neon Database)

## Key Components

### Frontend Architecture
- **3D Game Engine**: React Three Fiber with drei utilities for 3D scene management
- **Game Components**: Modular components for Arena, Players, Lighting, UI, and Menu
- **Physics System**: Custom collision detection and physics simulation
- **Input Handling**: Keyboard controls for two-player local gameplay
- **Audio System**: Web Audio API integration with sound effect management
- **UI Components**: Complete shadcn/ui component library for consistent styling

### Backend Architecture
- **Express Server**: RESTful API server with middleware for logging and error handling
- **Database Layer**: Drizzle ORM with PostgreSQL connection via Neon Database
- **Storage Interface**: Abstracted storage layer supporting both memory and database implementations
- **Development Tools**: Hot reload with Vite integration in development mode

### Game Logic
- **State Management**: Centralized game state with Zustand stores
- **Physics Engine**: Custom collision detection between spheres and boundary constraints
- **Game Phases**: Menu, Playing, and Ended states with smooth transitions
- **Scoring System**: Points awarded for pushing opponents out of bounds

## Data Flow

1. **Game Initialization**: Menu loads with game instructions and controls
2. **Game Start**: Players enter playing phase with physics simulation active
3. **Input Processing**: Keyboard events update player velocities in real-time
4. **Physics Simulation**: Frame-based collision detection and position updates
5. **Score Updates**: Boundary collisions trigger score increments and sound effects
6. **Game End**: Win condition met transitions to end screen with restart option

## External Dependencies

### Frontend Dependencies
- **React Three Fiber**: 3D rendering and scene management
- **Three.js**: Core 3D graphics library
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **React Query**: Server state management (configured but not actively used)

### Backend Dependencies
- **Express.js**: Web application framework
- **Drizzle ORM**: Type-safe database ORM
- **Neon Database**: Serverless PostgreSQL database
- **ESBuild**: Fast JavaScript bundler for production

### Development Dependencies
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing with Tailwind integration

## Deployment Strategy

The application is configured for deployment on Replit with autoscaling:

- **Development**: `npm run dev` starts Vite dev server with hot reload
- **Build Process**: `npm run build` creates optimized production bundle
- **Production**: `npm run start` serves the built application
- **Database**: Drizzle migrations with `npm run db:push`
- **Port Configuration**: Server runs on port 5000, mapped to external port 80

The build process compiles both frontend (Vite) and backend (ESBuild) into a single deployment package in the `dist` directory.

## Recent Changes

✓ Replaced spherical players with 3D character avatars (green warrior, red fighter)
✓ Enhanced arena environment with realistic textures and visible boundaries  
✓ Added comprehensive dodge effect system with visual and audio feedback
✓ Implemented stadium atmosphere with bleachers, pillars, and warning lights
✓ Improved lighting and camera positioning for better visibility
✓ Migrated project from Replit Agent to Replit environment with proper server binding
✓ Generated realistic seated audience models with medieval tournament chairs
✓ Updated players to hold only swords with increased size for better visibility
✓ Enhanced audience with 50+ seated spectators on wooden stadium stands facing arena
✓ Players now face each other in combat-ready stance
✓ Removed wooden stands - audience sits directly on ground with enhanced cheering animations
✓ Converted to proper fighting game - players continuously face each other and engage in combat
✓ Simplified arena design with square battleground
✓ Removed all audience for focused combat experience
✓ Added round-based fighting effects with dynamic lighting
✓ Enhanced with combat intensity effects and victory celebrations
✓ Added energy grid and combat zone visual effects
✓ Added walking animations with leg movement and body bob
✓ Created realistic hand movements and sword attack animations
✓ Replaced 'Hit' text with dramatic 'KNOCKOUT' effects with particles and lightning
✓ Changed from push-out-of-bounds to health-based combat system
✓ Added health bars above players showing current health
✓ Players deal 20 damage per hit, fight until health reaches 0
✓ Made player colors brighter for better visibility
✓ Fixed leg visibility issues and improved full body display

## Changelog

```
Changelog:
- June 19, 2025. Initial setup
- June 19, 2025. Added 3D character avatars, realistic arena environment, and dodge effects system
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```