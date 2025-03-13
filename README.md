# Party Stream Frontend

A synchronized video streaming application that allows multiple users to watch videos together in perfect sync. Control playback across multiple devices with synchronized play, pause, and seek capabilities.

## Features

- **Synchronized Video Playback**: Play, pause, and seek operations are synchronized across all connected clients
- **Real-time Communication**: WebSocket-based communication ensures minimal latency
- **Subtitle Support**: Upload and share .vtt subtitle files with all viewers
- **Responsive Design**: Built with Tailwind CSS and DaisyUI for a clean, responsive UI

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- DaisyUI
- WebSockets
- ReactPlayer

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/Party_Stream.git
cd Party_Stream/frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Enter a video URL in the input field and click "Set video"
2. Share the same room/session with others
3. All playback controls (play, pause, seek) will be synchronized across clients
4. Upload subtitle files (.vtt format) to share with all viewers

## Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Project Structure

- `src/components/` - React components including the video player
- `src/api/` - API client for backend communication
- `src/constants/` - Application constants
- `public/` - Static assets

## Configuration

Backend connection settings can be modified in `src/constants/constants.tsx`.
