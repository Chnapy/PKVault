import type React from 'react';
import { DetailsMainInfos, type DetailsMainInfosProps } from '../details-card/details-main-infos';
import { TextInput } from '../input/text-input';
import { StorageDetailsForm } from './storage-details-form';
import { css } from '@emotion/css';

export type StorageDetailsMainInfosProps = DetailsMainInfosProps & {
    nicknameMaxLength: number;
};

export const StorageDetailsMainInfos: React.FC<StorageDetailsMainInfosProps> = ({
    nickname, nicknameMaxLength, ...rest
}) => {
    const formContext = StorageDetailsForm.useContext();

    return <DetailsMainInfos
        nickname={formContext.editMode
            ? <TextInput
                {...formContext.register('nickname', { maxLength: nicknameMaxLength })}
                className={css({ display: 'inline-block', height: '1lh', width: 8 * nicknameMaxLength, padding: 0, textAlign: 'center' })}
            />
            : nickname}
        {...rest}
    />;
};
