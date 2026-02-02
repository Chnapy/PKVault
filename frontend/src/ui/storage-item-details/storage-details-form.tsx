import type React from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import type { EditPkmVariantPayload } from '../../data/sdk/model';
import { useStorageMainEditPkmVariant, useStorageSaveEditPkm } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';

type FormData = EditPkmVariantPayload;

export const StorageDetailsForm = {
    Provider: ({ children, ...initialPayload }: React.PropsWithChildren<EditPkmVariantPayload>) => {
        const methods = useForm<FormData>({
            defaultValues: {
                ...initialPayload
            }
        });

        return <FormProvider {...methods}>
            {children}
        </FormProvider>
    },
    useEditMode: () => {
        const navigate = Route.useNavigate();
        const selected = Route.useSearch({ select: (search) => search.selected });

        const startEdit = () => selected && navigate({
            search: {
                selected: {
                    ...selected,
                    editMode: true
                }
            }
        });
        const stopEdit = () => selected && navigate({
            search: {
                selected: {
                    ...selected,
                    editMode: undefined
                }
            }
        });

        return {
            editMode: selected?.editMode ?? false,
            startEdit,
            stopEdit,
        };
    },
    useContext: () => {
        const methods = useFormContext<FormData>();

        const { editMode, startEdit, stopEdit } = StorageDetailsForm.useEditMode();

        const mainEditPkmVariantMutation = useStorageMainEditPkmVariant();
        const saveEditPkmMutation = useStorageSaveEditPkm();

        return {
            ...methods,
            editMode,
            startEdit,
            stopEdit,
            cancel: () => {
                methods.reset();
                stopEdit();
            },
            submitForPkmVariant: async (pkmVariantId: string) => {
                await mainEditPkmVariantMutation.mutateAsync({
                    pkmVariantId,
                    data: {
                        nickname: methods.getValues('nickname'),
                        eVs: methods.getValues('eVs'),
                        moves: methods.getValues('moves'),
                    }
                });
                stopEdit();
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
                stopEdit();
            },
        };
    },
};
