import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      lighterGrey: string;
      red: string;
      green: string;
      orange: string;
      highlight: string;

      menuBackground: string;
      menuColor: string;

      headerBackground: string;
      headerColor: string;

      bodyText: string;
      altGreen: string;
      greenBackground: string;
      inputHighlight: string;
    },
    sizes: {
      tablet_small: string;
      tablet: string;
      desktop_small: string;
      desktop_large: string;

      mobileCardHeight: string;
      desktopCardHeight: string;

      menuWidth: string;
      menuOffset: string;
      minMenuWidth: string;

      mobileListHeight: string;
      desktopListHeight: string;

      desktopCardWidth: string;
    }
  }
}