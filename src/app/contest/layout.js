import Navbar from '@/components/Navbar';

export default function ContestLayout({ children }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
