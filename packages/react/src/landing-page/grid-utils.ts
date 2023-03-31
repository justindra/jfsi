type Breakpoint = 'default' | 'sm' | 'md' | 'lg' | 'xl';

function calculateGridClassNames(
  index: number,
  totalFeatures: number,
  featuresPerRow: number,
  totalColSpansAvailable: number,
  breakpoint: Breakpoint = 'default'
) {
  const columnsPerFeature = totalColSpansAvailable / featuresPerRow;
  const breakpointToUse = breakpoint !== 'default' ? `${breakpoint}:` : '';
  const isFirstInRow = index % featuresPerRow === 0;

  if (!isFirstInRow) return `${breakpointToUse}col-span-${columnsPerFeature}`;

  const isUnevenRow = index + featuresPerRow > totalFeatures;

  if (!isUnevenRow) return `${breakpointToUse}col-span-${columnsPerFeature}`;

  // Calculate the start of the row
  const totalColumnsRequired = (totalFeatures - index) * columnsPerFeature;
  const start =
    Math.floor(totalColSpansAvailable - totalColumnsRequired / 2) + 1;
  return `${breakpointToUse}col-start-${start} ${breakpointToUse}col-span-${columnsPerFeature}`;
}

type BreakpointConfig = {
  featuresPerRow: number;
  totalColSpansAvailable: number;
};

export function getGridClassNames(
  config: Partial<Record<Breakpoint, BreakpointConfig>>
) {
  return (index: number, totalFeatures: number) => {
    const allClassNames = Object.keys(config).map((breakpoint) => {
      const { featuresPerRow, totalColSpansAvailable } = config[
        breakpoint as Breakpoint
      ] as BreakpointConfig;
      return calculateGridClassNames(
        index,
        totalFeatures,
        featuresPerRow,
        totalColSpansAvailable,
        breakpoint as Breakpoint
      );
    });
    return allClassNames.join(' ');
  };
}
