import { Icon, type LucideProps } from 'lucide-react';
import type React from 'react';

export const UIBallIcon: React.FC<LucideProps> = (props) => {
    return <Icon
        {...props}
        iconNode={[
            [ 'circle', { key: '1', cx: '12', cy: '12', r: '10', } ],
            [ 'circle', { key: '2', cx: '12', cy: '12', r: '3', } ],
            [ 'path', { key: '3', d: "M2 12h7", } ],
            [ 'path', { key: '4', d: "M15 12h7", } ],
        ]}
    />;
};
