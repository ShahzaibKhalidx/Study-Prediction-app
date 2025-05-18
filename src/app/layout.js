import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'Student Performance Predictor',
  description: 'A modern tool to analyze and predict student performance',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        <div className="lg:w-64 w-16 h-screen p-4 fixed lg:relative z-10 transition-all duration-300">
          <Sidebar />
        </div>
        <main className="flex-1 ml-0 p-4">{children}</main>
      </body>
    </html>
  );
}
