import { Button } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { languages } from '../../translate/i18n';
import { UISplash } from './ui-splash';
import { UISplashMain } from './ui-splash-main';

const meta = {
    title: 'UI/UISplash',
    component: UISplash,
} satisfies Meta<typeof UISplash>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {},
};

export const Main: Story = {
    args: {
        children: <UISplashMain>
            {Object.entries(languages).map(([ language, name ]) => <Button key={language} onClick={console.log}>{name}</Button>)}
        </UISplashMain>,
    },
};
