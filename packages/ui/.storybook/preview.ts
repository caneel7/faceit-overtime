import type { Preview } from '@storybook/react-vite';
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
    a11y: { test: 'error' },
    viewport: {
      options: {
        mobile360: {
          name: 'Mobile 360',
          styles: { width: '360px', height: '780px' },
          type: 'mobile',
        },
      },
    },
  },
};

export default preview;
