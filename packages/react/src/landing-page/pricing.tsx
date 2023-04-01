import { CheckIcon } from '@heroicons/react/20/solid';
import React from 'react';
import { LinkButton } from '../button';

type PricingSectionProps = {
  title: string;
  description?: string;
  includedFeatures: string[];
  price: number;
  prePrice?: string;
  postPrice?: string;
  extraInfo?: string;
  cta: {
    label: string;
    href: string;
  };
};

export const PricingSection: React.FC<PricingSectionProps> = ({
  title,
  description,
  includedFeatures,
  price,
  prePrice,
  postPrice,
  extraInfo,
  cta,
}) => {
  return (
    <div className='bg-white py-24 sm:py-32'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='bg-slate-900 mx-auto mt-16 items-center max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none'>
          <div className='p-8 sm:p-10 lg:flex-auto'>
            <h2 className='text-2xl font-bold tracking-tight text-gray-50'>
              {title}
            </h2>
            <p className='mt-6 text-base leading-7 text-gray-200'>
              {description}
            </p>
            <div className='mt-10 flex items-center gap-x-4'>
              <h3 className='flex-none text-sm font-semibold leading-6 text-primary-600'>
                What’s included
              </h3>
              <div className='h-px flex-auto bg-gray-700' />
            </div>
            <ul
              role='list'
              className='mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-200 sm:grid-cols-2 sm:gap-6'>
              {includedFeatures.map((feature) => (
                <li key={feature} className='flex gap-x-3'>
                  <CheckIcon
                    className='h-6 w-5 flex-none text-primary-500'
                    aria-hidden='true'
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className='-mt-2 p-8 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0'>
            <div className='rounded-2xl bg-slate-800 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16'>
              <div className='mx-auto max-w-xs px-8'>
                <p className='text-base font-semibold text-gray-400'>
                  {prePrice}
                </p>
                <p className='mt-6 flex items-baseline justify-center gap-x-2'>
                  <span className='text-5xl font-bold tracking-tight text-gray-50'>
                    ${price}
                  </span>
                  <span className='text-sm font-semibold leading-6 tracking-wide text-gray-400'>
                    {postPrice}
                  </span>
                </p>
                <LinkButton
                  href={cta.href}
                  variant='primary'
                  size='lg'
                  className='w-full justify-center mt-10'>
                  {cta.label}
                </LinkButton>

                <p className='mt-6 text-xs leading-5 text-gray-400'>
                  {extraInfo}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
