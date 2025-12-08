import type React from 'react';
import { BoxType } from '../../data/sdk/model';
import { BoxTypeIcon } from './box-type-icon';

export const BoxName: React.FC<{
    boxType: BoxType;
    boxName: string;
    icon?: React.ReactNode;
}> = ({ boxType, boxName, icon }) => {

    const typeLetter = boxType === BoxType.Box
        ? undefined
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        : Object.entries(BoxType).find(([ _, value ]) => value === boxType)?.[ 0 ][ 0 ]?.toUpperCase();

    const hasDetails = !!typeLetter || !!icon;

    return <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: hasDetails ? 2 : undefined,
    }}>
        {hasDetails && <span style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
        }}>
            {typeLetter && <BoxTypeIcon boxType={boxType} />}
        </span>}

        <span>
            {boxName}
        </span>

        {hasDetails && <span style={{ flex: 1, textAlign: 'right' }}>{icon}</span>}
    </div>
};
