# AI Music Web Platform

A professional-grade AI music production platform with a Next.js frontend and Flask backend. This system can generate high-quality remixes from uploaded music and create text-to-music tracks from user prompts.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/rahmivinnns-projects/v0-web-music-ai-platform)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/CbXSqSaMM8n)

## Overview

This project combines a modern Next.js frontend with a powerful Flask backend for AI music production. The system can:

- Generate high-quality remixes from uploaded music
- Create text-to-music tracks from user prompts
- Produce one-sided love songs with emotional lyrics and melodies

## Features

### AI Remix (Upload-to-Remix)
- Auto-detects tempo, key, genre, and mood of uploaded audio
- Separates stems (vocal, drums, bass, etc.) using Demucs
- Remixes songs based on user's style prompt
- Masters the final mix for clean output (44.1kHz stereo WAV or MP3)

### Text-to-Audio Music Generation
- Parses prompts to detect desired genre, tempo, mood, lyrics, instruments, and voice style
- Composes structured music tracks (intro, verse, chorus, outro)
- Synthesizes vocal lines using ElevenLabs or Bark
- Mixes all instruments and vocals harmoniously
- Finalizes with professional mastering

### One-Sided Love Song Generator
- Creates pop songs with a one-sided love theme
- Features soft female vocals and emotional lyrics
- Includes a catchy chorus and melancholic piano

## Technical Stack

### Frontend
- **Next.js**: React framework for the user interface
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Component library for consistent design

### Backend
- **Flask**: Backend web framework
- **Pydub**: Audio preprocessing & export
- **Demucs**: Source separation
- **Matchering/FFmpeg**: Mastering & audio enhancement
- **ElevenLabs/Bark**: AI vocals for text-to-music

## API Endpoints

### `/upload-remix` (POST)
Accepts an audio file and remix prompt, runs the full pipeline (Demucs → remix → mastering), and returns a download link.

### `/text-to-audio` (POST)
Accepts a text prompt, generates full music + vocals + mastering, and returns a download link.

### `/download/<job_id>` (GET)
Returns the generated audio file.

## Installation

### Frontend
\`\`\`bash
npm install
npm run dev
\`\`\`

### Backend
\`\`\`bash
pip install -r requirements.txt
python run.py
\`\`\`

## Example Prompts

### Remix Prompt (Upload Audio)
"Remix this song into a 90s drum and bass version with fast tempo and spacey reverb. Keep the vocals clear."

### Text-to-Music Prompt
"Create a dreamy R&B song about missing someone at night, with soft female vocals, mellow beats, slow piano, and warm reverb. 70 BPM."

## Deployment

The frontend is deployed on Vercel:

**[https://vercel.com/rahmivinnns-projects/v0-web-music-ai-platform](https://vercel.com/rahmivinnns-projects/v0-web-music-ai-platform)**

The backend needs to be deployed separately on a server that supports Python/Flask.
