import type { Meta, StoryObj } from '@storybook/react';

import MfCard from './MFCard';

const meta = {
  component: MfCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof MfCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Title',
    loading: false,
    children: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Autem, dicta!",
    description: 'hello',
    titleClass: "test-red-500",
    descriptionClass: '',
    align: "left"
  },
};
