import React from "react";
import { Gender, GenderType, type DexItemForm } from '../../data/sdk/model';
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
  const showGenders = Route.useSearch({ select: (search) => search.showGenders ?? false });
  const navigate = Route.useNavigate();

  const seen = forms.some((spec) => spec.isSeen);

  const selected = species === selectedPkm;
  const onClick = React.useMemo(
    () =>
      // seen
      //   ? 
      () =>
        navigate({
          search: {
            selected: selected ? undefined : species,
          },
        })
    // : undefined
    ,
    [ navigate, selected, species ]
  );

  let content: React.ReactNode = null;

  if (!showForms && !showGenders) {
    content = <DexFormItem
      species={species}
      generation={forms[ 0 ].generation}
      form={forms[ 0 ].form}
      seen={forms.some(form => form.isSeen)}
      seenShiny={forms.some(form => form.isSeenShiny)}
      caught={forms.some(form => form.isCaught)}
      owned={forms.some(form => form.isOwned)}
      ownedShiny={forms.some(form => form.isOwnedShiny)}
    />;
  }
  else if (showForms && !showGenders) {
    content = forms
      .reduce<typeof forms>((acc, form) => {
        if (acc.some(item => item.form === form.form)) {
          return acc;
        }
        return [ ...acc, form ];
      }, [])
      .map(formItem => <DexFormItem
        key={`${formItem.form}-${formItem.gender}`}
        species={species}
        generation={formItem.generation}
        form={formItem.form}
        seen={forms.some(form => form.form === formItem.form && form.isSeen)}
        seenShiny={forms.some(form => form.form === formItem.form && form.isSeenShiny)}
        caught={forms.some(form => form.form === formItem.form && form.isCaught)}
        owned={forms.some(form => form.form === formItem.form && form.isOwned)}
        ownedShiny={forms.some(form => form.form === formItem.form && form.isOwnedShiny)}
      />);
  }
  else if (!showForms && showGenders) {
    content = forms
      .filter(form => form.form === 0)
      .map(formItem => <DexFormItem
        key={`${formItem.form}-${formItem.gender}`}
        species={species}
        generation={formItem.generation}
        form={formItem.form}
        gender={formItem.gender === Gender.Male ? GenderType.MALE : (
          formItem.gender === Gender.Female ? GenderType.FEMALE : undefined
        )}
        seen={forms.some(form => form.gender === formItem.gender && form.isSeen)}
        seenShiny={forms.some(form => form.gender === formItem.gender && form.isSeenShiny)}
        caught={forms.some(form => form.gender === formItem.gender && form.isCaught)}
        owned={forms.some(form => form.gender === formItem.gender && form.isOwned)}
        ownedShiny={forms.some(form => form.gender === formItem.gender && form.isOwnedShiny)}
      />);
  } else {
    content = forms.map(formItem => <DexFormItem
      key={`${formItem.form}-${formItem.gender}`}
      species={species}
      generation={formItem.generation}
      form={formItem.form}
      gender={formItem.gender === Gender.Male ? GenderType.MALE : (
        formItem.gender === Gender.Female ? GenderType.FEMALE : undefined
      )}
      seen={formItem.isSeen}
      seenShiny={formItem.isSeenShiny}
      caught={formItem.isCaught}
      owned={formItem.isOwned}
      ownedShiny={formItem.isOwnedShiny}
    />);
  }

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
