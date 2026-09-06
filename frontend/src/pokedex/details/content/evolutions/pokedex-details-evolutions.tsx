import { getTreeExpandedState, Loader, Tree, useTree } from '@mantine/core';
import React from 'react';
import { useDexGetEvolves } from '../../../../data/sdk/dex/dex.gen';
import { type StaticEvolveRichItem } from '../../../../data/sdk/model';
import { useStaticData } from '../../../../hooks/use-static-data';
import { UISpriteSizeWrapper } from '../../../../ui/sprite-img/ui-sprite-size-wrapper';
import { DexEvolutionLeaf, type DexEvolutionLeafProps, type TreeNodeDataRich } from './dex-evolution-leaf';
import classes from './pokedex-details-evolutions.module.css';

type PokedexDetailsEvolutionsProps = Pick<DexEvolutionLeafProps, 'saveId' | 'context' | 'onSelect'> & {
    species: number;
    formIndex: number;
};

export const PokedexDetailsEvolutions: React.FC<PokedexDetailsEvolutionsProps> = ({ saveId, context, species, formIndex, onSelect }) => {
    const staticData = useStaticData();

    const getBaseSpecies = (species: number) => {
        const previousSpecies = staticData.evolves[ species ]?.previousSpecies;
        if (previousSpecies)
            return getBaseSpecies(previousSpecies);
        return species;
    };

    const dexEvolves = useDexGetEvolves({ species: getBaseSpecies(species) });

    const data = dexEvolves.data?.data ?? {};

    const firstSpeciesForms = Object.values(data).flatMap(d => Object.values(d)).filter(e => !e.previousSpecies);

    const getFormIndex = (species: number, formId: number): number => {
        const forms = staticData.species[ species ]?.forms[ context ];

        if (!forms)
            return -1;

        return forms.findIndex(f => f.id === formId);
    };

    const getFormName = (species: number, formIndex: number) => staticData.species[ species ]?.forms[ context ]?.[ formIndex ]?.name;

    const getTreeData = (baseSpecies: number, baseFormId: number, evolveObj?: StaticEvolveRichItem): TreeNodeDataRich[] => {
        const baseFormIndex = getFormIndex(baseSpecies, baseFormId);
        if (baseFormIndex === -1) {
            // console.log('unexpected baseFormIndex', baseFormId,);
            return [];
        }

        const evolve = data[ baseSpecies ]?.[ baseFormId ];
        if (!evolve) {
            // console.log('unexpected evolve', baseSpecies, baseFormId, data);
            return [];
        }

        const children = evolve.evolves.flatMap(evolveObj => {
            return getTreeData(evolveObj.evolveSpecies, evolveObj.evolveForm, evolveObj);
        });

        const baseData: TreeNodeDataRich = {
            value: `${baseSpecies}-${baseFormIndex}`,
            label: getFormName(baseSpecies, baseFormIndex),
            hasChildren: children.length > 0,
            children,
            nodeProps: {
                species: baseSpecies,
                formIndex: baseFormIndex,
                triggers: evolveObj?.triggers ?? [],
            },
        };

        return [ baseData ];
    };

    const treeData = firstSpeciesForms.flatMap(f => getTreeData(f.species, f.form));

    const tree = useTree({
        expandedState: getTreeExpandedState(treeData, '*'),
    });

    if (dexEvolves.isPending)
        return <Loader />;

    // if (treeData.length === 0)
    //     console.log('EMPTY', species, staticData.species[ species ]);

    // if (new Set(treeData.map(d => d.value)).size !== treeData.length)
    //     console.log('DUPLICATES', treeData, staticData.species[ species ]);

    return <>
        <UISpriteSizeWrapper
            component={'div'}
            speciesSize='sm'
        >
            <Tree
                data={treeData}
                tree={tree}
                withLines
                levelOffset='lg'
                expandOnClick={false}
                expandOnSpace={false}
                allowRangeSelection={false}
                renderNode={({ elementProps, node }) => {
                    const richNode = node as TreeNodeDataRich;

                    return <DexEvolutionLeaf
                        saveId={saveId}
                        context={context}
                        onSelect={onSelect}
                        selected={richNode.nodeProps.species === species && richNode.nodeProps.formIndex === formIndex}
                        {...richNode}
                        {...elementProps}
                    />;
                }}
                classNames={{
                    subtree: classes.evolutionsSubtree,
                    label: classes.evolutionsLabel,
                    node: classes.evolutionsNode,
                }}
                pr={2}
            />
        </UISpriteSizeWrapper>
    </>;
};
