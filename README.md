<img src="https://github.com/user-attachments/assets/ec055a89-a0b4-435f-b06e-273dfd476932" alt="Board Stack Logo" width="500">

# BoardStack

*Automatically synced with your [v0.dev](https://v0.dev) deployments*
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/corvettefan101s-projects/v0-boardstack)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/FHXtXdWcUjF)

## Table of Contents
- [About BoardStack](#about-boardstack)
- [Features](#features)
- [How to Use](#how-to-use)
- [Setup Instructions](#setup-instructions)
- [Future Plans](#future-plans)
- [Credits](#credits)
- [License](#license)
- [Contact](#contact)

## About BoardStack:
BoardStack is currently a free and open-source web application that offers a modern kanban board creator that allows you to create boards with ease and organize your plans and thoughts all locally through your web browser!

## Features
*   **Intuitive Kanban Boards:** Easily create and manage tasks with a familiar drag-and-drop interface.
*   **Supabase Integration:** All your boards and data are stored securely in Supabase with Row Level Security.
*   **Google Sign-In:** Quickly sign in with your Google account.
*   **User-Friendly Interface:** Clean and modern design for an enjoyable user experience.
*   **Open Source:** Transparent and community-driven development.
*   **Export/Import Options:** Ability to export boards as JSON or other formats.

## How to Use

Experience BoardStack directly in your browser:
🚀 **[Launch BoardStack](https://v0-boardstack-eosin.vercel.app/)**

**Quick Start:**
1. Click the "Launch BoardStack" link above.
2. Create a new account or sign in with Google.
3. Start creating new boards and adding tasks right away!

**UI Preview:**
![Screenshot 2025-05-28 091607](https://github.com/user-attachments/assets/3706d456-a81e-41cc-bb8d-53f59deea868)

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Google OAuth credentials (for Google Sign-In)

### Environment Setup
1. Clone the repository
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_PROJECT_ID=your-project-id
   SUPABASE_ACCESS_TOKEN=your-access-token
   SUPABASE_AUTH_GOOGLE_CLIENT_ID=your-google-client-id
   SUPABASE_AUTH_GOOGLE_SECRET=your-google-client-secret
   \`\`\`

### Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Set Up Supabase CLI
\`\`\`bash
npm install -g supabase
supabase login
\`\`\`

### Initialize Database
\`\`\`bash
npm run setup
\`\`\`

This will:
1. Link to your Supabase project
2. Push all migrations to create tables, functions, and policies
3. Generate TypeScript types for your database schema

### Run the Development Server
\`\`\`bash
npm run dev
\`\`\`

### Configure Google OAuth
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider and add your Google OAuth credentials
4. Set the callback URL to `https://your-project-url.supabase.co/auth/v1/callback`

## Future Plans
We're constantly working to improve BoardStack! Here are some features we plan to implement:
*   **Real-time Collaboration:** Allow multiple users to work on the same board simultaneously.
*   **Advanced Filtering:** Filter cards by tags, assignees, due dates, etc.
*   **Customizable Themes:** Personalize the look and feel of your boards.
*   **Mobile App:** Native mobile experience for iOS and Android.
*   **Integrations:** Connect with other tools like GitHub, Slack, etc.

## Credits
BoardStack was created by Corvettefan101, Vercel V0, Logo was created by ChatGPT-4o ImageGen, and Read Me by Gemini 2.5 Flash

## License
BoardStack is open-source software licensed under the [MIT License](LICENSE).

## Contact
If you have any questions, feedback, or issues, feel free to open an issue on this repository or reach out:
*  **Discord:** Corvettefan101 #1738

BoardStack isn't made to infringe on any trademarks or any copyright, if you have a problem reach out and we can have a conversation
