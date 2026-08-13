import React from 'react';
import { VisibilityProvider } from './visibility-context';

type VisibilityObserverProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: React.RefObject<any>;
    margin?: string;
    initialValue?: boolean;
    children: React.ReactNode;
};

export const VisibilityObserver: React.FC<VisibilityObserverProps> = ({ ref, margin, initialValue = false, children }) => {
    const [ visible, setVisible ] = React.useState(initialValue);

    React.useEffect(() => {
        const el = ref.current;
        if (!el)
            return;

        const observer = new IntersectionObserver(
            ([ entry ]) => {
                setVisible(entry?.isIntersecting ?? false);
            },
            {
                threshold: 0, // trigger from 0% visible
                rootMargin: margin, // trigger from some distance
                scrollMargin: margin,   // same but in scroll context
            },
        );

        observer.observe(el);

        return () => {
            observer.unobserve(el);
        };
    }, [ margin, ref ]);

    return <VisibilityProvider value={visible}>
        {children}
    </VisibilityProvider>;
};
