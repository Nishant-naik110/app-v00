import type { Meta, StoryObj } from '@storybook/react';

import MfCarousel from './MFCarousel';

const meta = {
  component: MfCarousel,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof MfCarousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    border: true,
    toggle: true,
    data: [1, 2, 3, 4, 5],
    autoplay: true,
    autoplay_delay: 2000,
    indicator: true
  },
};
