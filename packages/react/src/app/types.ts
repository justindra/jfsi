export type NavigationItem = {
  name: string;
  href: string;
  icon?: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
      titleId?: string | undefined;
    }
  >;
  current?: boolean;
};

export type NavigationList = NavigationItem[];

export type ImageProps = {
  src: HTMLImageElement['src'];
  alt: HTMLImageElement['alt'];
};
