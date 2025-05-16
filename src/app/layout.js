import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'Student Performance Predictor',
  description: 'A modern tool to analyze and predict student performance',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background flex font-sans">
        <Sidebar />
        <main className="flex-grow w-full ml-64">{children}</main>
      </body>
    </html>
  );
}