import './globals.css';

export const metadata = {
  title: 'Virtual Contest Simulator',
  description: 'Codeforces styled competitive programming platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
