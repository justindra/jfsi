import { ImageProps } from 'app/types';

type LogoCloudProps = {
  /**
   * The list of logos, we recommend a maximum of 5 logos. The logos should be
   * in a 3.3:1 aspect ratio. or as close as possible.
   *
   * Resolution: 158x48
   */
  logos: ImageProps[];
};

// TODO: Create a formula to calculate the grid columns based on the number of logos

/**
 * A logo cloud is a collection of logos that are displayed in a grid. The logos
 * should be in a 3.3:1 aspect ratio. or as close as possible.
 *
 * Generally used to display a list of partners or sponsors.
 */
export const LogoCloud: React.FC<LogoCloudProps> = ({ logos }) => {
  return (
    <div className='mx-auto max-w-7xl px-6 lg:px-8'>
      <div className='mx-auto grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-12 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 sm:gap-y-14 lg:mx-0 lg:max-w-none lg:grid-cols-5'>
        {logos.map((logo, index) => (
          <img
            key={index}
            className='col-span-2 max-h-12 w-full object-contain lg:col-span-1'
            width={158}
            height={48}
            {...logo}
          />
        ))}
      </div>
    </div>
  );
};
