import React from "react";
import { type DexItemForm } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from "../../routes/pokedex";
import { ButtonLike } from '../../ui/button/button-like';
import { DexFormItem, type DexItemProps } from "../../ui/dex-item/dex-item";
import { getSpeciesNO } from '../../ui/dex-item/util/get-species-no';
import { theme } from '../../ui/theme';

export type PokedexItemProps = Pick<DexItemProps, 'species'> & {
  forms: Pick<DexItemForm, 'form' | 'generation' | 'gender' | 'isSeen' | 'isSeenShiny' | 'isCaught' | 'isOwned' | 'isOwnedShiny'>[];
};

export const PokedexItem: React.FC<PokedexItemProps> = React.memo(({
  species,
  forms,
}) => {
  const selectedPkm = Route.useSearch({ select: (search) => search.selected });
  const showForms = Route.useSearch({ select: (search) => search.showForms ?? false });
  const showGendersRaw = Route.useSearch({ select: (search) => search.showGenders ?? false });
  const navigate = Route.useNavigate();

  const staticData = useStaticData();
  const staticForms = staticData.species[ species ].forms;

  const seen = forms.some((spec) => spec.isSeen);

  const selected = species === selectedPkm;
  const onClick = React.useMemo(
    () => seen
      ? () =>
        navigate({
          search: {
            selected: selected ? undefined : species,
          },
        })
      : undefined,
    [ navigate, seen, selected, species ]
  );

  const groupsByForm = forms.reduce<(typeof forms)[]>((acc, form) => {
    acc[ form.form ] = [
      ...(acc[ form.form ] ?? []),
      form,
    ];
    return acc;
  }, []);

  const content: React.ReactNode = groupsByForm.map((formGroup, i) => {
    const hasGenderDifferences = staticForms[ formGroup[ 0 ].generation ][ formGroup[ 0 ].form ].hasGenderDifferences;
    const showGenders = showGendersRaw && hasGenderDifferences;

    if (!showForms && !showGenders) {
      if (i > 0) return null;

      return <DexFormItem
        key={formGroup[ 0 ].form}
        species={species}
        generation={formGroup[ 0 ].generation}
        form={formGroup[ 0 ].form}
        genders={[ ...new Set(formGroup.map(form => form.gender)) ].sort()}
        seen={forms.some(form => form.isSeen)}
        seenShiny={forms.some(form => form.isSeenShiny)}
        caught={forms.some(form => form.isCaught)}
        owned={forms.some(form => form.isOwned)}
        ownedShiny={forms.some(form => form.isOwnedShiny)}
      />;
    }

    if (!showForms && showGenders) {
      if (i > 0) return null;

      return formGroup.map(formItem => <DexFormItem
        key={formItem.gender}
        species={species}
        generation={formItem.generation}
        form={formItem.form}
        genders={[ formItem.gender ]}
        seen={forms.some(form => form.gender === formItem.gender && form.isSeen)}
        seenShiny={forms.some(form => form.gender === formItem.gender && form.isSeenShiny)}
        caught={forms.some(form => form.gender === formItem.gender && form.isCaught)}
        owned={forms.some(form => form.gender === formItem.gender && form.isOwned)}
        ownedShiny={forms.some(form => form.gender === formItem.gender && form.isOwnedShiny)}
      />);
    }

    if (showForms && !showGenders) {
      const formItem = formGroup[ 0 ];

      return <DexFormItem
        key={formItem.form}
        species={species}
        generation={formItem.generation}
        form={formItem.form}
        genders={[ ...new Set(formGroup.map(form => form.gender)) ].sort()}
        seen={formGroup.some(form => form.isSeen)}
        seenShiny={formGroup.some(form => form.isSeenShiny)}
        caught={formGroup.some(form => form.isCaught)}
        owned={formGroup.some(form => form.isOwned)}
        ownedShiny={formGroup.some(form => form.isOwnedShiny)}
      />;
    }

    return formGroup.map(formItem => <DexFormItem
      key={`${formItem.form}-${formItem.gender}`}
      species={species}
      generation={formItem.generation}
      form={formItem.form}
      genders={[ formItem.gender ]}
      seen={formItem.isSeen}
      seenShiny={formItem.isSeenShiny}
      caught={formItem.isCaught}
      owned={formItem.isOwned}
      ownedShiny={formItem.isOwnedShiny}
    />);
  });

  return (
    <ButtonLike
      onClick={onClick}
      selected={selected}
      noDropshadow={!onClick}
      disabled={!onClick}
      style={{
        position: 'relative',
        alignSelf: "flex-start",
        padding: 0,
        borderColor: seen ? theme.text.default : undefined,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {content}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: '0 2px',
          backgroundColor: theme.bg.darker,
          color: theme.text.light,
          borderBottomRightRadius: 4,
        }}
      >
        <span>{getSpeciesNO(species)}</span>
      </div>
    </ButtonLike>
  );
});
