import React from 'react';
import { useSettingsGetSaveGlobsResults } from '../data/sdk/settings/settings.gen';
import { useTranslate } from '../translate/i18n';
import { Button } from '../ui/button/button';
import { TitledContainer } from '../ui/container/titled-container';
import { TextInput, type TextInputProps } from '../ui/input/text-input';
import { PathLine } from './path-line';

type SaveGlobsInputProps = TextInputProps;

export const SaveGlobsInput: React.FC<SaveGlobsInputProps> = ({ ...inputProps }) => {
    const { t } = useTranslate();

    const prepareValues = () => inputProps.value?.split('\n').map(value => value.trim()) ?? [];
    const [ values, setValues ] = React.useState(prepareValues());

    const globResultsQuery = useSettingsGetSaveGlobsResults({ globs: values });

    const { isLoading } = globResultsQuery;
    const data = globResultsQuery.data?.data ?? [];

    return <div
        style={{
            width: '100%',
            display: 'flex',

        }}
    >
        <TextInput
            label={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                {t('settings.form.saves')}

                <Button
                    loading={isLoading}
                    disabled={values.join('\n') === prepareValues().join('\n')}
                    onClick={() => setValues(prepareValues())}
                >Test</Button>
            </div>}
            area
            style={{
                flex: 1,
                minHeight: 200,
                height: '100%',
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0
            }}
            {...inputProps}
        />

        <TitledContainer
            title={isLoading
                ? 'Searching for paths...'
                : '-> ' + data.length + ' files found from given paths & globs'
            }
            style={{
                height: 200,
                flex: 1,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                // whiteSpace: 'nowrap',
                overflowX: 'auto',
            }}
        >
            {!isLoading && data.length === 0 && 'No files found'}
            {!isLoading && data.map(path => <PathLine key={path}>{path}</PathLine>)}
        </TitledContainer>
    </div>;
};
