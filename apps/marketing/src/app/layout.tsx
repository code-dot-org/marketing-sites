import type {Metadata} from 'next';

import '@code-dot-org/component-library-styles/colors.scss';
import '@code-dot-org/fonts/index.css';

import './globals.css';

export const metadata: Metadata = {
  title: 'Code.org',
  description: 'Anyone can learn!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://dsco.code.org/assets/font-awesome-pro/1728421354/css/fontawesome.min.css"
        />
        <link
          rel="stylesheet"
          href="https://dsco.code.org/assets/font-awesome-pro/1728421354/css/brands.min.css"
        />
        <link
          rel="stylesheet"
          href="https://dsco.code.org/assets/font-awesome-pro/1728421354/css/solid.min.css"
        />
        <link
          rel="stylesheet"
          href="https://dsco.code.org/assets/font-awesome-pro/1728421354/css/regular.min.css"
        />
        <link
          rel="stylesheet"
          href="https://dsco.code.org/assets/font-awesome-pro/1728421354/css/v4-font-face.min.css"
        />
        <link
          rel="stylesheet"
          href="https://dsco.code.org/assets/font-awesome-pro/1728421354/css/v4-shims.min.css"
        />
        <link
          rel="stylesheet"
          href="https://dsco.code.org/assets/font-awesome-pro/1728421354/css/duotone.min.css"
        />
        <link
          rel="stylesheet"
          href="https://dsco.code.org/assets/font-awesome-pro/1728421354/css/custom-icons.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
