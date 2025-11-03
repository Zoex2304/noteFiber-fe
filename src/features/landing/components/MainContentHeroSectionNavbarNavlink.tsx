import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Features', to: '/landing?page=features', pageQuery: 'features' },
  { name: 'Pricing', to: '/landing?page=pricing', pageQuery: 'pricing' },
  { name: 'About Us', to: '/landing?page=about-us', pageQuery: 'about-us' },
  { name: 'Contact', to: '/landing?page=contact', pageQuery: 'contact' },
];

/**
 * Navlink Component
 * UPDATED: Tambah onClick untuk close menu di mobile
 */
export function MainContentHeroSectionNavbarNavlink() {
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get('page');

  return (
    <nav className="flex w-full flex-col items-start gap-3 lg:w-auto lg:flex-row lg:items-center lg:gap-[12.268px]">
      {navLinks.map((link) => {
        const isActive = currentPage === link.pageQuery;

        return (
          <Link
            key={link.name}
            to={link.to}
            className={cn(
              `w-full rounded-md px-3 py-2 text-body-base font-medium transition-all duration-200
               hover:bg-gray-100 hover:text-royal-violet-base 
               focus:outline-none focus:ring-2 focus:ring-royal-violet-base focus:ring-opacity-50
               lg:w-auto`,
              isActive
                ? 'font-bold text-royal-violet-base'
                : 'text-gray-400'
            )}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}