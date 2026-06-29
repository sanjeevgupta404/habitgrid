import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className='border-t bg-background'>
      <div className='container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 px-4'>
        <div className='flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0'>
          <p className='text-center text-sm leading-loose text-muted-foreground md:text-left'>
            Built by{' '}
            <a href='#' className='font-medium underline underline-offset-4'>
              CineVerse Team
            </a>
            . The source code is available on{' '}
            <a href='#' className='font-medium underline underline-offset-4'>
              GitHub
            </a>
            .
          </p>
        </div>
        <div className='flex items-center space-x-6 text-sm font-medium'>
          <Link to='/about' className='hover:text-primary transition-colors'>
            About
          </Link>
          <Link to='/privacy' className='hover:text-primary transition-colors'>
            Privacy
          </Link>
          <Link to='/terms' className='hover:text-primary transition-colors'>
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
};
