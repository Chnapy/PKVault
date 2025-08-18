import type React from 'react';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import type { EditPkmVersionPayload } from '../../data/sdk/model';
import { useQueryClient } from '@tanstack/react-query';
import { getStorageGetActionsQueryKey, getStorageGetMainPkmVersionsQueryKey, getStorageGetSavePkmsQueryKey, useStorageMainEditPkmVersion, useStorageSaveEditPkm } from '../../data/sdk/storage/storage.gen';

type FormData = { editMode: boolean } & EditPkmVersionPayload;

export const StorageDetailsForm = {
    Provider: ({ children, ...initialPayload }: React.PropsWithChildren<EditPkmVersionPayload>) => {

        const methods = useForm<FormData>({
            defaultValues: {
                editMode: false,
                ...initialPayload
            }
        });

        return <FormProvider {...methods}>
            {children}
        </FormProvider>
    },
    useContext: (saveId?: number) => {
        const methods = useFormContext<FormData>();
        const editMode = useWatch<FormData>({ name: 'editMode' });

        const queryClient = useQueryClient();

        const mainEditPkmVersionMutation = useStorageMainEditPkmVersion({
            mutation: {
                onSuccess: async () => {
                    await queryClient.invalidateQueries({
                        queryKey: getStorageGetActionsQueryKey(),
                    });

                    await queryClient.invalidateQueries({
                        queryKey: getStorageGetMainPkmVersionsQueryKey(),
                    });

                    methods.setValue('editMode', false);
                },
            },
        });

        const saveEditPkmMutation = useStorageSaveEditPkm({
            mutation: {
                onSuccess: async () => {
                    await queryClient.invalidateQueries({
                        queryKey: getStorageGetActionsQueryKey(),
                    });

                    if (saveId) {
                        await queryClient.invalidateQueries({
                            queryKey: getStorageGetSavePkmsQueryKey(saveId),
                        });
                    }

                    methods.setValue('editMode', false);
                },
            },
        });

        return {
            ...methods,
            editMode,
            cancel: () => methods.reset(),
            submitForPkmVersion: (pkmVersionId: string) => mainEditPkmVersionMutation.mutateAsync({
                pkmVersionId,
                data: {
                    nickname: methods.getValues('nickname'),
                    eVs: methods.getValues('eVs'),
                    moves: methods.getValues('moves'),
                }
            }),
            submitForPkmSave: (saveId: number, pkmId: string) => saveEditPkmMutation.mutateAsync({
                saveId,
                pkmId,
                data: {
                    nickname: methods.getValues('nickname'),
                    eVs: methods.getValues('eVs'),
                    moves: methods.getValues('moves'),
                }
            }),
        }
    },
};
