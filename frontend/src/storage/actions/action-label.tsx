import { Group, ThemeIcon } from '@mantine/core';
import { BoxIcon, CalendarSyncIcon, ChevronsRight, Database, ImportIcon, LandmarkIcon, LinkIcon, MoveIcon, PenIcon, PlusCircleIcon, RefreshCcw, SortDescIcon, TrashIcon, UnlinkIcon } from 'lucide-react';
import { DataActionType, EntityContext, type DataActionPayload } from '../../data/sdk/model';
import { UIBallIcon } from '../../ui-new/icon/ui-ball-icon';
import { SpeciesImg } from '../../ui/img/species-img';
import type React from 'react';
import { switchUtil } from '../../util/switch-util';

const ActionLabelMap = {
    CreateBank: () => {
        return <>
            <LandmarkIcon />
            <ThemeIcon variant='transparent' color='green' size='xs' fz='sm'>
                <PlusCircleIcon />
            </ThemeIcon>
        </>;
    },
    UpdateBank: () => {
        return <>
            <LandmarkIcon />
            <ThemeIcon variant='transparent' color='blue' size='xs' fz='sm'>
                <PenIcon />
            </ThemeIcon>
        </>;
    },
    DeleteBank: () => {
        return <>
            <LandmarkIcon />
            <ThemeIcon variant='transparent' color='red' size='xs' fz='sm'>
                <TrashIcon />
            </ThemeIcon>
        </>;
    },
    CreateBox: () => {
        return <>
            <BoxIcon />
            <ThemeIcon variant='transparent' color='green' size='xs' fz='sm'>
                <PlusCircleIcon />
            </ThemeIcon>
        </>;
    },
    UpdateBox: () => {
        return <>
            <BoxIcon />
            <ThemeIcon variant='transparent' color='blue' size='xs' fz='sm'>
                <PenIcon />
            </ThemeIcon>
        </>;
    },
    DeleteBox: () => {
        return <>
            <BoxIcon />
            <ThemeIcon variant='transparent' color='red' size='xs' fz='sm'>
                <TrashIcon />
            </ThemeIcon>
        </>;
    },
    SortBox: () => {
        return <>
            <BoxIcon />
            <ThemeIcon variant='transparent' color='blue' size='xs' fz='sm'>
                <SortDescIcon />
            </ThemeIcon>
        </>;
    },
    CreateVariant: ({ parameters }: Pick<DataActionPayload, 'parameters'>) => {
        const species = parameters[ 2 ];

        return <>
            {typeof species === 'number'
                ? <SpeciesImg context={EntityContext.Gen9a} species={species} form={0} />
                : <UIBallIcon />}

            <ThemeIcon variant='transparent' color='green' size='xs' fz='sm'>
                <PlusCircleIcon />
            </ThemeIcon>
        </>;
    },
    MovePkm: ({ parameters }: Pick<DataActionPayload, 'parameters'>) => {
        const attached = !!parameters[ 5 ];
        const species = parameters[ 6 ];

        return <>
            {typeof species === 'number'
                ? <SpeciesImg context={EntityContext.Gen9a} species={species} form={0} />
                : <UIBallIcon />}

            <ThemeIcon variant='transparent' color='gray' size='xs' fz='sm'>
                <MoveIcon />
            </ThemeIcon>

            {attached && <ThemeIcon variant='transparent' color='gray' size='xs' fz='sm'>
                <LinkIcon />
            </ThemeIcon>}
        </>;
    },
    DetachPkm: ({ parameters }: Pick<DataActionPayload, 'parameters'>) => {
        const species = parameters[ 2 ];

        return <>
            {typeof species === 'number'
                ? <SpeciesImg context={EntityContext.Gen9a} species={species} form={0} />
                : <UIBallIcon />}

            <ThemeIcon variant='transparent' color='blue' size='xs' fz='sm'>
                <UnlinkIcon />
            </ThemeIcon>
        </>;
    },
    EditPkmVariant: ({ parameters }: Pick<DataActionPayload, 'parameters'>) => {
        const species = parameters[ 2 ];

        return <>
            {typeof species === 'number'
                ? <SpeciesImg context={EntityContext.Gen9a} species={species} form={0} />
                : <UIBallIcon />}

            <ThemeIcon variant='transparent' color='blue' size='xs' fz='sm'>
                <PenIcon />
            </ThemeIcon>
        </>;
    },
    EditPkmSave: ({ parameters }: Pick<DataActionPayload, 'parameters'>) => {
        const species = parameters[ 2 ];

        return <>
            {typeof species === 'number'
                ? <SpeciesImg context={EntityContext.Gen9a} species={species} form={0} />
                : <UIBallIcon />}

            <ThemeIcon variant='transparent' color='blue' size='xs' fz='sm'>
                <PenIcon />
            </ThemeIcon>
        </>;
    },
    DeletePkmVariant: ({ parameters }: Pick<DataActionPayload, 'parameters'>) => {
        const species = parameters[ 2 ];

        return <>
            {typeof species === 'number'
                ? <SpeciesImg context={EntityContext.Gen9a} species={species} form={0} />
                : <UIBallIcon />}

            <ThemeIcon variant='transparent' color='red' size='xs' fz='sm'>
                <TrashIcon />
            </ThemeIcon>
        </>;
    },
    DeletePkmSave: ({ parameters }: Pick<DataActionPayload, 'parameters'>) => {
        const species = parameters[ 2 ];

        return <>
            {typeof species === 'number'
                ? <SpeciesImg context={EntityContext.Gen9a} species={species} form={0} />
                : <UIBallIcon />}

            <ThemeIcon variant='transparent' color='red' size='xs' fz='sm'>
                <TrashIcon />
            </ThemeIcon>
        </>;
    },
    EvolvePkm: ({ parameters }: Pick<DataActionPayload, 'parameters'>) => {
        const oldSpecies = parameters[ 2 ];
        const newSpecies = parameters[ 3 ];

        return <Group gap='xs'>
            {typeof oldSpecies === 'number'
                ? <SpeciesImg context={EntityContext.Gen9a} species={oldSpecies} form={0} />
                : <UIBallIcon />}
            <ThemeIcon variant='transparent' color='blue' size='xs' fz='sm'>
                <ChevronsRight />
            </ThemeIcon>
            {typeof newSpecies === 'number'
                ? <SpeciesImg context={EntityContext.Gen9a} species={newSpecies} form={0} />
                : <UIBallIcon />}
        </Group>;
    },
    DexSync: () => {
        return <>
            <CalendarSyncIcon />

            <ThemeIcon variant='transparent' color='blue' size='xs' fz='sm'>
                <RefreshCcw />
            </ThemeIcon>
        </>;
    },
    DataNormalize: () => {
        return <>
            <Database />

            <ThemeIcon variant='transparent' color='primary' size='xs' fz='sm'>
                <RefreshCcw />
            </ThemeIcon>
        </>;
    },
    UpdateExternal: () => {
        return <>
            <UIBallIcon />

            <ThemeIcon variant='transparent' color='primary' size='xs' fz='sm'>
                <ImportIcon />
            </ThemeIcon>
        </>;
    },
};

export const ActionLabel: React.FC<DataActionPayload> = ({ type, parameters }) => {

    const Component: React.FC<Pick<DataActionPayload, 'parameters'>> = switchUtil(type, {
        [ DataActionType.MAIN_CREATE_BANK ]: ActionLabelMap.CreateBank,
        [ DataActionType.MAIN_UPDATE_BANK ]: ActionLabelMap.UpdateBank,
        [ DataActionType.MAIN_DELETE_BANK ]: ActionLabelMap.DeleteBank,

        [ DataActionType.MAIN_CREATE_BOX ]: ActionLabelMap.CreateBox,
        [ DataActionType.MAIN_UPDATE_BOX ]: ActionLabelMap.UpdateBox,
        [ DataActionType.MAIN_DELETE_BOX ]: ActionLabelMap.DeleteBox,

        [ DataActionType.MAIN_CREATE_PKM_VERSION ]: ActionLabelMap.CreateVariant,
        [ DataActionType.MOVE_PKM ]: ActionLabelMap.MovePkm,
        [ DataActionType.DETACH_PKM_SAVE ]: ActionLabelMap.DetachPkm,
        [ DataActionType.EDIT_PKM_VERSION ]: ActionLabelMap.EditPkmVariant,
        [ DataActionType.EDIT_PKM_SAVE ]: ActionLabelMap.EditPkmSave,
        [ DataActionType.DELETE_PKM_VERSION ]: ActionLabelMap.DeletePkmVariant,
        [ DataActionType.SAVE_DELETE_PKM ]: ActionLabelMap.DeletePkmSave,
        [ DataActionType.PKM_SYNCHRONIZE ]: () => null,
        [ DataActionType.EVOLVE_PKM ]: ActionLabelMap.EvolvePkm,

        [ DataActionType.SORT_PKM ]: ActionLabelMap.SortBox,
        [ DataActionType.DEX_SYNC ]: ActionLabelMap.DexSync,
        [ DataActionType.DATA_NORMALIZE ]: ActionLabelMap.DataNormalize,
        [ DataActionType.UPDATE_EXTERNAL_PKM ]: ActionLabelMap.UpdateExternal,
    });

    // eslint-disable-next-line react-hooks/static-components
    return <Component parameters={parameters} />
};
