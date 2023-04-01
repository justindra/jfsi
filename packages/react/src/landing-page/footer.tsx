import { SocialName, getSocialIcon } from './footer-utils';

type FooterProps = {
  socials: {
    name: SocialName;
    href: string;
  }[];
  company: {
    name: string;
    logoUrl: string;
  };
  navigations: {
    title: string;
    links: {
      name: string;
      href: string;
    }[];
  }[][];
};

export const Footer: React.FC<FooterProps> = ({
  socials,
  company,
  navigations,
}) => {
  return (
    <footer
      className='mt-16 bg-gray-900 sm:mt-32'
      aria-labelledby='footer-heading'>
      <h2 id='footer-heading' className='sr-only'>
        Footer
      </h2>
      <div className='mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32'>
        <div className='xl:grid xl:grid-cols-3 xl:gap-8'>
          <img className='h-7' src={company.logoUrl} alt={company.name} />
          <div className='mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0'>
            {navigations.map((navGroup, index) => (
              <div key={index} className='md:grid md:grid-cols-2 md:gap-8'>
                {navGroup.map((nav, index) => (
                  <div key={index}>
                    <h3 className='text-sm font-semibold leading-6 text-white'>
                      {nav.title}
                    </h3>
                    <ul role='list' className='mt-6 space-y-4'>
                      {nav.links.map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.href}
                            className='text-sm leading-6 text-gray-300 hover:text-white'>
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className='mt-8 border-t border-white/10 pt-8 md:flex md:items-center md:justify-between'>
          <div className='flex space-x-6 md:order-2'>
            {socials.map((item) => {
              const Icon = getSocialIcon(item.name);
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className='text-gray-500 hover:text-gray-400'>
                  <span className='sr-only'>{item.name}</span>
                  <Icon className='h-6 w-6' aria-hidden='true' />
                </a>
              );
            })}
          </div>
          <p className='mt-8 text-xs leading-5 text-gray-400 md:order-1 md:mt-0'>
            &copy; {new Date().getFullYear()} {company.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
