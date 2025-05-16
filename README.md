# Student Performance Management System

A full-stack web application for managing student performance data using Excel uploads, built with Next.js, Supabase, and shadcn/ui.

## Overview
This project allows authorized users to upload student performance data via Excel files, store it in a Supabase database, and view it through a dashboard. It includes features like upload progress tracking, responsive design, and sidebar navigation.

## Features
- Upload Excel files with student data (attendance, grades, etc.).
- Real-time upload progress using shadcn/ui Progress component.
- Sidebar navigation with hover animations.
- Authentication with Supabase.
- Responsive design for desktop and mobile.

## Tech Stack
- **Frontend**: Next.js (App Router), shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Excel Parsing**: xlsx

## Prerequisites
- Node.js (v18.x or later)
- npm or yarn
- Supabase account and project setup

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/student-performance-system.git
   cd student-performance-system
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env.local` file in the root directory.
   - Add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser.

## Usage
- Log in using Supabase authentication (e.g., via `/login`).
- Navigate to `/upload` to upload an Excel file with the required columns.
- View student data on the `/students` dashboard.

## Excel File Format
The uploaded Excel file must contain the following columns:
- Student_ID
- Student_Name
- Gender
- Age
- Attendance_%
- Absences
- Grade
- Current_score
- Math_Score
- Science_Score
- Computer_Score
- English_Score
- Urdu_Score
- History_Score
- Study_Hours
- Private_Tuition
- Internet_Access
- Sleep_Hours
- Sports_Participation

## Contributing
1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch`.
3. Make changes and commit: `git commit -m "Add new feature"`.
4. Push to the branch: `git push origin feature-branch`.
5. Open a pull request.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments
- shadcn/ui for components
- Supabase for database and authentication
- Next.js community for robust documentation