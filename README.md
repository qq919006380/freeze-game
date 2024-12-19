# Freeze Game

A multiplayer online game developed with Next.js and Socket.IO, inspired by the classic "Red Light, Green Light" game. Players must move when the robot turns its back and remain still when the robot is observing.

## Tech Stack

- Next.js 15
- React 19
- Socket.IO
- TypeScript
- Tailwind CSS
- Jotai (State Management)
- shadcn/ui (UI Component Library)

## Features

- Real-time multiplayer gameplay
- Smooth animations
- Responsive design
- Real-time player state synchronization
- Game state management
- Player elimination system

## Game Rules

1. Enter your name to join the game
2. Hold the spacebar to move when the robot faces away (shows "Facing Away")
3. Stay still when the robot turns around (shows "Observing")
4. If you move while being observed, you'll be eliminated
5. The first player to reach and touch the robot wins

## Project Structure

- `/app` - Next.js application main directory
- `/components` - React components
- `/store` - Jotai state management
- `/lib` - Utility functions
- `/public` - Static assets
- `/types` - TypeScript type definitions
