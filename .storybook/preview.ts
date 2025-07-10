import type { Preview } from '@storybook/react-vite';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';

const customViewports = {
  mobile320: {
    name: 'Mobile 320px',
    styles: {
      width: '320px',
      height: '568px',
    },
    type: 'mobile',
  },
  mobile375: {
    name: 'Mobile 375px (iPhone)',
    styles: {
      width: '375px',
      height: '667px',
    },
    type: 'mobile',
  },
  mobile414: {
    name: 'Mobile 414px (iPhone Plus)',
    styles: {
      width: '414px',
      height: '736px',
    },
    type: 'mobile',
  },
  tablet768: {
    name: 'Tablet 768px',
    styles: {
      width: '768px',
      height: '1024px',
    },
    type: 'tablet',
  },
  desktop1024: {
    name: 'Desktop 1024px',
    styles: {
      width: '1024px',
      height: '768px',
    },
    type: 'desktop',
  },
  desktop1440: {
    name: 'Desktop 1440px',
    styles: {
      width: '1440px',
      height: '900px',
    },
    type: 'desktop',
  },
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },

    viewport: {
      options: {
        ...MINIMAL_VIEWPORTS,
        ...customViewports,
      },
    },
  },

  initialGlobals: {
    viewport: { value: 'mobile375', isRotated: false },
  },
};

export default preview;
