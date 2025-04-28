
import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
  fullWidth?: boolean;
}

const MainLayout = ({ children, hideFooter = false, fullWidth = false }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-grow ${fullWidth ? '' : 'container mx-auto px-4'}`}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
