import './globals.css';

export const metadata = {
  title: 'Impulse - Virtual Contest Simulator',
  description: 'Competitive programming platform with time-travelling leaderboard powered by Persistent Segment Trees',
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
