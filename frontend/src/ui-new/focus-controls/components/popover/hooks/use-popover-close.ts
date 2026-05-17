import { usePopoverContext } from '@mantine/core';

export const usePopoverClose = () => {
    const ctx = usePopoverContext();

    return () => {
        ctx.onClose?.();
        ctx.onDismiss?.();
    };
};
