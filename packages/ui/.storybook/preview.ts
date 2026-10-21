import type { Preview } from '@storybook/react-vite';
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
    // Fail story tests on any accessibility violation
    a11y: { test: 'error' },
  },
};

export default preview;
