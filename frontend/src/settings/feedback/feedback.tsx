import { css } from '@emotion/css';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { TitledContainer } from '../../ui/container/titled-container';
import { Icon } from '../../ui/icon/icon';
import { TextInput } from '../../ui/input/text-input';
import { LinkWithIcon } from '../../ui/link-with-icon/link-with-icon';
import { theme } from '../../ui/theme';
import { useSendFeedback } from './hooks/use-send-feedback';

export const Feedback: React.FC = () => {
    const { t } = useTranslate();

    const settingsQuery = useSettingsGet();

    const sendFeedbackMutation = useSendFeedback();

    const { register, reset, handleSubmit, formState, control } = useForm<{ feedback: string }>({
        defaultValues: { feedback: '' },
    });

    const [ feedbackValue ] = useWatch({ control, name: [ 'feedback' ] });

    React.useEffect(() => {
        if (formState.isSubmitSuccessful) {
            setTimeout(() => {
                reset(undefined, {
                    keepIsSubmitted: false,
                });
            }, 3000);
        }
    }, [ formState.isSubmitSuccessful, reset ]);

    const userId = settingsQuery.data?.data.userId;

    const submit = handleSubmit(async ({ feedback }) => {
        if (!userId) {
            throw new Error('No user-id');
        }

        await sendFeedbackMutation.mutateAsync({
            userId,
            feedback,
        });
    });

    return <TitledContainer
        title={<div title={`User ID = ${userId}`}>
            {t('settings.feedback.title')}
        </div>}
    >

        <div
            className={css({
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
            })}
        >
            <form
                onSubmit={submit}
                className={css({
                    flexGrow: 1,
                    flexBasis: '60%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                })}
            >
                <TextInput
                    label={t('settings.feedback.feedback')}
                    area
                    style={{
                        minHeight: 6 + feedbackValue.split('\n').length * 18.5,
                    }}
                    minLength={2}
                    maxLength={2000}
                    {...register('feedback', { minLength: 2, maxLength: 2000 })}
                    disabled={formState.isSubmitting || formState.isSubmitSuccessful}
                />

                <Button
                    type='submit'
                    loading={formState.isSubmitting}
                    disabled={!userId || !formState.isValid || !feedbackValue || formState.isSubmitSuccessful}
                    bgColor={theme.bg.primary}
                >
                    {t('action.submit')}
                </Button>
                {formState.isSubmitSuccessful && <div style={{ textAlign: 'center' }}>
                    {t('action.success')} <Icon name='check' solid forButton />
                </div>}
                {formState.isSubmitted && !formState.isSubmitSuccessful && <div style={{ textAlign: 'center' }}>
                    {t('action.failure')} <Icon name='times' solid forButton />
                </div>}
            </form>

            <div
                className={css({
                    flexGrow: 1,
                    flexBasis: '30%',
                    borderLeft: `1px solid ${theme.border.default}`,
                    paddingLeft: 8,
                })}
            >
                <Icon name='info-circle' solid forButton />{' '}
                {t('settings.feedback.help.1')}
                <ul>
                    <li>
                        <LinkWithIcon href='https://github.com/Chnapy/PKVault/issues' target='__blank'>
                            GitHub issues
                        </LinkWithIcon>
                    </li>
                    <li>
                        <LinkWithIcon href='https://projectpokemon.org/home/forums/topic/67239-pkvault-centralized-pkm-storage-management-pokedex-app' target='__blank'>
                            Project Pokemon discussion
                        </LinkWithIcon>
                    </li>
                </ul>
            </div>
        </div>

    </TitledContainer>
};
