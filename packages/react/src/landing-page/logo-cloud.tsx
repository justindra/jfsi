import { ImageProps } from 'app/types';
import { classNames } from '../utils';
import { getGridClassNames } from './grid-utils';

type LogoCloudProps = {
  /**
   * The list of logos, we recommend a maximum of 5 logos. The logos should be
   * in a 3.3:1 aspect ratio. or as close as possible.
   *
   * Resolution: 158x48
   */
  logos: ImageProps[];
};

/** Get the function to setup the grid items */
const getGridClassNamesForLogoCloud = getGridClassNames({
  default: { featuresPerRow: 2, totalColSpansAvailable: 4 },
  sm: { featuresPerRow: 3, totalColSpansAvailable: 6 },
  lg: { featuresPerRow: 5, totalColSpansAvailable: 5 },
});

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
        {logos.map((logo, index) => {
          const gridClassNames = getGridClassNamesForLogoCloud(
            index,
            logos.length
          );

          return (
            <img
              key={index}
              className={classNames(
                'max-h-12 w-full object-contain',
                gridClassNames
              )}
              width={158}
              height={48}
              {...logo}
            />
          );
        })}
      </div>
    </div>
  );
};
