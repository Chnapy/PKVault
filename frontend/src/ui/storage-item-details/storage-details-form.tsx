import type React from 'react';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import type { EditPkmVersionPayload } from '../../data/sdk/model';
import { useStorageMainEditPkmVersion, useStorageSaveEditPkm } from '../../data/sdk/storage/storage.gen';

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
    useContext: () => {
        const methods = useFormContext<FormData>();
        const editMode = useWatch<FormData>({ name: 'editMode' });

        const mainEditPkmVersionMutation = useStorageMainEditPkmVersion();

        const saveEditPkmMutation = useStorageSaveEditPkm();

        return {
            ...methods,
            editMode,
            cancel: () => methods.reset(),
            submitForPkmVersion: async (pkmVersionId: string) => {
                await mainEditPkmVersionMutation.mutateAsync({
                    pkmVersionId,
                    data: {
                        nickname: methods.getValues('nickname'),
                        eVs: methods.getValues('eVs'),
                        moves: methods.getValues('moves'),
                    }
                });
                methods.setValue('editMode', false);
            },
            submitForPkmSave: async (saveId: number, pkmId: string) => {
                await saveEditPkmMutation.mutateAsync({
                    saveId,
                    pkmId,
                    data: {
                        nickname: methods.getValues('nickname'),
                        eVs: methods.getValues('eVs'),
                        moves: methods.getValues('moves'),
                    }
                });
                methods.setValue('editMode', false);
            },
        }
    },
};
