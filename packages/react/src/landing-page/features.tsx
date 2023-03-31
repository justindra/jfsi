import { classNames } from '../utils';
import { getGridClassNames } from './grid-utils';

type FeatureRowProps = {
  preTitle?: string;
  title: string;
  description?: string;
  features: {
    name: string;
    description: string;
    icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
    learnMoreLink?: string;
  }[];
};
/** Get the function to setup the grid items */
const getGridClassNamesForFeatures = getGridClassNames({
  default: { featuresPerRow: 1, totalColSpansAvailable: 1 },
  lg: { featuresPerRow: 3, totalColSpansAvailable: 3 },
});
/**
 * Show the list of features in a row, including the icons and descriptions for
 * each feature. Generally used to show the features of a product.
 *
 * Recommend to use 3 features per row.
 * @returns
 */
export const FeatureSection: React.FC<FeatureRowProps> = ({
  preTitle,
  title,
  description,
  features,
}) => {
  return (
    <div className='mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8'>
      <div className='mx-auto max-w-2xl lg:text-center'>
        {preTitle && (
          <p className='text-base font-semibold leading-7 text-primary-600'>
            {preTitle}
          </p>
        )}

        <h2 className='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
          {title}
        </h2>
        {description && (
          <p className='mt-6 text-lg leading-8 text-gray-600'>{description}</p>
        )}
      </div>
      <div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none'>
        <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3'>
          {features.map((feature, index) => {
            const gridClassNames = getGridClassNamesForFeatures(
              index,
              features.length
            );
            return (
              <div
                key={feature.name}
                className={classNames('flex flex-col', gridClassNames)}>
                <dt className='flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900'>
                  <feature.icon
                    className='h-5 w-5 flex-none text-primary-600'
                    aria-hidden='true'
                  />
                  {feature.name}
                </dt>
                <dd className='mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600'>
                  <p className='flex-auto'>{feature.description}</p>
                  {feature.learnMoreLink && (
                    <p className='mt-6'>
                      <a
                        href={feature.learnMoreLink}
                        className='text-sm font-semibold leading-6 text-primary-600'>
                        Learn more <span aria-hidden='true'>→</span>
                      </a>
                    </p>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
};
