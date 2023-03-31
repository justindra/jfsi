import { classNames } from 'utils';

type Testimonial = {
  content: string;
  author: {
    name: string;
    avatarUrl: string;
    handle?: string;
    logoUrl?: string;
  };
};

type TestimonialsProps = {
  title: string;
  testimonials: Testimonial[][][];
  featuredTestimonial?: Testimonial;
  colourSplashGradients?: {
    from: string;
    to: string;
  };
};

export const Testimonials: React.FC<TestimonialsProps> = ({
  title,
  testimonials,
  featuredTestimonial,
  colourSplashGradients = {
    from: 'from-[#ff80b5]',
    to: 'to-[#9089fc]',
  },
}) => {
  return (
    <div className='relative isolate mt-32 sm:mt-56 sm:pt-32'>
      {/* Background square pattern */}
      <svg
        className='absolute inset-0 -z-10 hidden h-full w-full stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)] sm:block'
        aria-hidden='true'>
        <defs>
          <pattern
            id='55d3d46d-692e-45f2-becd-d8bdc9344f45'
            width={200}
            height={200}
            x='50%'
            y={0}
            patternUnits='userSpaceOnUse'>
            <path d='M.5 200V.5H200' fill='none' />
          </pattern>
        </defs>
        <svg x='50%' y={0} className='overflow-visible fill-gray-50'>
          <path
            d='M-200.5 0h201v201h-201Z M599.5 0h201v201h-201Z M399.5 400h201v201h-201Z M-400.5 600h201v201h-201Z'
            strokeWidth={0}
          />
        </svg>
        <rect
          width='100%'
          height='100%'
          strokeWidth={0}
          fill='url(#55d3d46d-692e-45f2-becd-d8bdc9344f45)'
        />
      </svg>
      <div className='relative'>
        {/* Colour Splashes in Background */}
        <div
          className='absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl'
          aria-hidden='true'>
          <div
            className={classNames(
              'ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr',
              `${colourSplashGradients.from} ${colourSplashGradients.to}`
            )}
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div
          className='absolute inset-x-0 top-0 -z-10 flex transform-gpu overflow-hidden pt-8 opacity-25 blur-3xl xl:justify-end'
          aria-hidden='true'>
          <div
            className={classNames(
              'ml-[-22rem] aspect-[1313/771] w-[82.0625rem] flex-none origin-top-right rotate-[30deg] bg-gradient-to-tr xl:ml-0 xl:mr-[calc(50%-12rem)]',
              `${colourSplashGradients.from} ${colourSplashGradients.to}`
            )}
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-xl sm:text-center'>
            <p className='text-lg font-semibold leading-8 tracking-tight text-primary-600'>
              Testimonials
            </p>
            <h2 className='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
              {title}
            </h2>
          </div>
          <div className='mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm leading-6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4'>
            {/* Featured Testimonial */}
            {featuredTestimonial && (
              <figure className='col-span-2 hidden sm:block sm:rounded-2xl sm:bg-white sm:shadow-lg sm:ring-1 sm:ring-gray-900/5 xl:col-start-2 xl:row-end-1'>
                <blockquote className='p-12 text-xl font-semibold leading-8 tracking-tight text-gray-900'>
                  <p>{`“${featuredTestimonial.content}”`}</p>
                </blockquote>
                <figcaption className='flex items-center gap-x-4 border-t border-gray-900/10 px-6 py-4'>
                  <img
                    className='h-10 w-10 flex-none rounded-full bg-gray-50'
                    src={featuredTestimonial.author.avatarUrl}
                    alt=''
                  />
                  <div className='flex-auto'>
                    <div className='font-semibold'>
                      {featuredTestimonial.author.name}
                    </div>
                    {featuredTestimonial.author.handle && (
                      <div className='text-gray-600'>{`@${featuredTestimonial.author.handle}`}</div>
                    )}
                  </div>
                  {featuredTestimonial.author.logoUrl && (
                    <img
                      className='h-10 w-auto flex-none'
                      src={featuredTestimonial.author.logoUrl}
                      alt={`Logo for ${featuredTestimonial.author.name}`}
                    />
                  )}
                </figcaption>
              </figure>
            )}
            {/* Other testimonials */}
            {testimonials.map((columnGroup, columnGroupIdx) => (
              <div
                key={columnGroupIdx}
                className='space-y-8 xl:contents xl:space-y-0'>
                {columnGroup.map((column, columnIdx) => (
                  <div
                    key={columnIdx}
                    className={classNames(
                      (columnGroupIdx === 0 && columnIdx === 0) ||
                        (columnGroupIdx === testimonials.length - 1 &&
                          columnIdx === columnGroup.length - 1)
                        ? 'xl:row-span-2'
                        : 'xl:row-start-1',
                      'space-y-8'
                    )}>
                    {column.map((testimonial) => (
                      <figure
                        key={testimonial.author.handle}
                        className='rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5'>
                        <blockquote className='text-gray-900'>
                          <p>{`“${testimonial.content}”`}</p>
                        </blockquote>
                        <figcaption className='mt-6 flex items-center gap-x-4'>
                          <img
                            className='h-10 w-10 rounded-full bg-gray-50'
                            src={testimonial.author.avatarUrl}
                            alt=''
                          />
                          <div>
                            <div className='font-semibold'>
                              {testimonial.author.name}
                            </div>
                            {testimonial.author.handle && (
                              <div className='text-gray-600'>{`@${testimonial.author.handle}`}</div>
                            )}
                          </div>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
