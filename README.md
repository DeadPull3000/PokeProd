# PokeProd

PokeProd is a Gamified Productivity App built with React, Tailwind CSS, Zustand, and Supabase. It uses a nostalgic Gen 3 Pokémon aesthetic to make managing your tasks and habits fun and engaging.

## Features

- **Gen 3 Aesthetic:** Experience a meticulously crafted UI with authentic Gen 3 colors, borders, and typography (VT323 / 'Press Start 2P').
- **Task Management:** Manage your daily tasks to earn XP and level up your trainer.
- **Nuzlocke Party & Safari Zone:** Collect and manage your Pokémon companions as you complete tasks.
- **Co-Op Raid Hub:** A true real-time multiplayer experience powered by Supabase WebSockets. Battle the "Giant Slaking of Sloth" with other users by completing tasks.
- **Audio Engine:** High-quality Pokémon cries fetched from PokéAPI and dynamic background music based on user settings.
- **Professor Oak Authentication:** A classic Pokémon-style introduction sequence for user login, backed by Supabase Auth.
- **Cloud Task Sync:** Your tasks and progress are seamlessly synced to the cloud.

## Tech Stack

- **Frontend:** React, Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Backend & Database:** Supabase (Auth, Postgres, Realtime WebSockets)
- **Animations:** Framer Motion

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/DeadPull3000/PokeProd.git
   cd PokeProd
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. Database Setup:
   Ensure you have created the necessary tables (`tasks`, `raid_boss`) in your Supabase project and enabled Realtime for the `raid_boss` table.

5. Start the development server:
   ```bash
   npm run dev
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
