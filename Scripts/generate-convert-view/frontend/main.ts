import { ConvertDirection, ConvertFormJSON, ConvertStep, IndexJSON, LanguageID, PkmLegalityDTO, PkmVariantDTO, StaticOthersData, StaticSpecies, StaticSpritesheetsData } from './types.gen.js';

const fetchSheets = () => fetch('public/static/spritesheets.json')
    .then(res => res.json() as Promise<StaticSpritesheetsData>)
    .then(data => data.Species);

const fetchSpecies = () => fetch('public/static/species.json')
    .then(res => res.json() as Promise<Record<number, StaticSpecies>>);

const fetchOthers = () => fetch('public/static/others.json')
    .then(res => res.json() as Promise<StaticOthersData>);

const fetchIndex = () => fetch('public/export/index.json')
    .then(res => res.json() as Promise<IndexJSON>);

const fetchForm = (id: string) => fetch(`public/export/${id}.json`)
    .then(res => res.json() as Promise<ConvertFormJSON>);

type Section = Extract<keyof ConvertStep, 'PkmVariant' | 'PkmLegality'>;
type SectionValue = keyof (PkmVariantDTO & PkmLegalityDTO);
const sections: Section[] = [ "PkmVariant", "PkmLegality" ];

const changedPropertiesToIgnore = new Set<SectionValue>([
    'IdBase', 'ContextVersion', 'Context'
]);

const createFetchObject = <R>(fn: () => Promise<R>) => {
    let data: Promise<R> | undefined;
    return async (): Promise<R> => {
        if (!data)
            data = fn();
        return data;
    };
};

window.onload = async () => {
    console.time('setup');

    const root = document.querySelector("#root")!;
    const formLineTemplate = document.querySelector<HTMLTemplateElement>("#form-line")!;

    const getIndexData = createFetchObject(fetchIndex);
    const getSpeciesData = createFetchObject(fetchSpecies);
    const getSheetsData = createFetchObject(fetchSheets);
    const getOthersData = createFetchObject(fetchOthers);

    const setupFilters = async () => {
        const indexData = await getIndexData();

        const pkmVariantProperties = indexData.PkmVariantProperties as (keyof PkmVariantDTO)[];
        const pkmLegalityProperties = indexData.PkmLegalityProperties as (keyof PkmLegalityDTO)[];
        const allProperties = [ ...pkmVariantProperties, ...pkmLegalityProperties ];

        const pkTypes = indexData.PKTypes;

        const controlChanges = root.querySelector<HTMLInputElement>('#control-changes')!;
        const controlColumns = root.querySelector<HTMLSelectElement>('#control-columns')!;
        const controlProperties = root.querySelector<HTMLSelectElement>('#control-properties')!;

        controlChanges.onchange = () => {
            const style = document.querySelector('#changes-only')!;
            if (controlChanges.checked) {
                style.innerHTML = `
                .field-row:not(.changed) {
                    display: none;
                }
                `;
            } else {
                style.innerHTML = '';
            }
        };

        controlColumns.append(...pkTypes.map(type => {
            const opt = document.createElement('option');
            opt.value = type;
            opt.innerHTML = type;
            opt.selected = true;
            return opt;
        }));

        controlColumns.onchange = () => {
            const style = document.querySelector('#columns')!;
            const selectedTypes = new Set([ ...controlColumns.selectedOptions ].map(opt => opt.value));
            const notSelectedTypes = pkTypes.filter(p => !selectedTypes.has(p));

            style.innerHTML = notSelectedTypes.length > 0
                ? `
                    ${notSelectedTypes.map(p => `[data-type="${p}"]`).join(',')} {
                        display: none;
                    }
                    
                    .field-row:not(:has(td${notSelectedTypes.map(p => `:not([data-type="${p}"])`).join('')})) > :first-child {
                        display: none;
                    }
                    `
                : '';
        };

        controlProperties.append(...allProperties.map(prop => {
            const opt = document.createElement('option');
            opt.value = prop;
            opt.innerHTML = prop;
            opt.selected = true;
            return opt;
        }));

        controlProperties.onchange = () => {
            const style = document.querySelector('#properties')!;
            const selectedProps = new Set([ ...controlProperties.selectedOptions ].map(opt => opt.value));
            const notSelectedProps = allProperties.filter(p => !selectedProps.has(p));

            style.innerHTML = notSelectedProps.length > 0
                ? `
            ${notSelectedProps.map(p => `.field-row[data-property="${p}"]`).join(',')} {
                display: none;
            }
            `
                : '';
        };
    };

    const overrideValue = async (key: SectionValue, value: unknown, version: number | undefined) => {
        const othersData = await getOthersData();

        switch (key) {
            case 'Generation':
                return `G${value}`;
            case 'Version':
            case 'ContextVersion':
                return othersData.Versions[ value as number ]?.Name;
            case 'Types':
                return (value as number[]).map(t => othersData.Types[ t ]?.Name);
            case 'HiddenPowerType':
            case 'TeraType':
                return othersData.Types[ value as number ]?.Name;
            case 'Nature':
                return othersData.Natures[ value as number ]?.Name;
            case 'Ability':
                return othersData.Abilities[ value as number ]?.Name;
            case 'Moves':
            case 'RelearnMoves':
                if (Array.isArray(value))
                    return (value as number[]).map(v => othersData.Moves[ v ]?.Name);
                return value;
            case 'Gender':
            case 'OriginTrainerGender':
            case 'HandlingTrainerGender':
                return value === 0 ? '♂'
                    : value === 1 ? '♀'
                        : '-';
            case 'HeldItem':
            case 'Ball':
                const key = othersData.Items.VersionItems
                    .find(entry => entry.Versions.includes(version ?? 0))
                    ?.ComboItems[ value as number ] ?? '';
                return othersData.Items.Items[ key ]?.Name;
            case 'LanguageID':
                return LanguageID[ value as number ];
            default: return value;
        }
    };

    async function renderValue(key: SectionValue, value: unknown, version: number | undefined) {
        value = await overrideValue(key, value, version);
        if (value === null || value === undefined || value === '') {
            return textSpan("-");
        }

        if (Array.isArray(value)) {
            if (value.length === 0) return textSpan("[]");

            const isBoolArray = value.every(v => typeof v === 'boolean');
            if (isBoolArray) {
                const div = document.createElement("div");
                for (const item of value) {
                    div.appendChild(await renderValue(key, item, version));
                }
                return div;
            }

            const isPrimitiveArray = value.every(v => v === null || typeof v !== "object");
            if (isPrimitiveArray) return textSpan(value, "value-array");

            const ol = document.createElement("ol");
            ol.className = "value-array-objects";
            for (const item of value) {
                const li = document.createElement("li");
                li.appendChild(await renderValue(key, item, version));
                ol.appendChild(li);
            }
            return ol;
        }

        if (typeof value === "object") {
            const dl = document.createElement("dl");
            dl.className = "value-object";
            const entries = Object.entries(value);
            if (entries.length === 0)
                return textSpan("-");
            for (const [ k, v ] of entries) {
                const dt = document.createElement("dt");
                dt.textContent = k;
                const dd = document.createElement("dd");
                dd.appendChild(await renderValue(key, v, version));
                dl.appendChild(dt);
                dl.appendChild(dd);
            }
            return dl;
        }

        if (typeof value === 'boolean') {
            const span = document.createElement("span");
            span.className = [ "bool", value && 'bool-true' ].filter(Boolean).join(' ');
            span.title = String(value);
            return span;
        }

        return textSpan(String(value), `value-${typeof value}`);
    }

    function textSpan(value: unknown, className?: string) {
        const nullLikeValues = [ '', '-', '0', '[]', '(None)' ];
        const span = document.createElement("span");
        if (className)
            span.className = className;
        if (Array.isArray(value)) {
            if ((value).every(v => nullLikeValues.includes(String(v))))
                span.dataset[ 'empty' ] = 'true';
            value = `[${value.join(", ")}]`;
        }
        else if (nullLikeValues.includes(String(value)))
            span.dataset[ 'empty' ] = 'true';
        span.textContent = String(value);
        return span;
    }

    async function renderStepSuite(direction: ConvertDirection, steps: ConvertStep[]) {
        if (steps.length === 0)
            return;

        const stepSuiteTemplate = document.querySelector<HTMLTemplateElement>("#step-suite")!;
        const node = document.importNode(stepSuiteTemplate.content, true);

        const table = node.querySelector(".step-suite-table")!;
        table.appendChild(buildHeaderRow(direction, steps));

        const statusRow = buildStatusRow(steps);
        if (statusRow)
            table.appendChild(statusRow);

        const indexData = await getIndexData();

        for (const section of sections) {
            const keys = section === 'PkmVariant'
                ? (indexData.PkmVariantProperties as SectionValue[])
                : (indexData.PkmLegalityProperties as SectionValue[]);

            for (const key of keys) {
                table.appendChild(await buildFieldRow(section, key, steps));
            }
        }

        return node;
    }

    function buildHeaderRow(direction: ConvertDirection, steps: ConvertStep[]) {
        const tr = document.createElement("tr");
        tr.className = "step-header-row";

        const firstTh = document.createElement("th");
        const label = Object.keys(ConvertDirection)
            .find(key => ConvertDirection[ key as keyof typeof ConvertDirection ] === direction)!;
        firstTh.innerHTML = label;
        firstTh.dataset.type = label;
        tr.appendChild(firstTh);

        for (const step of steps) {
            const th = document.createElement("th");
            th.textContent = step.Type;
            th.dataset.status = step.Ok ? 'ok' : 'error';
            th.dataset.type = step.Type;
            tr.appendChild(th);
        }
        return tr;
    }

    function buildStatusRow(steps: ConvertStep[]) {
        if (steps.every(step => step.Ok))
            return;

        const tr = document.createElement("tr");
        tr.className = "field-row";
        tr.dataset.property = 'Status';

        const th = document.createElement("th");
        th.scope = "row";
        th.textContent = 'Status';
        tr.appendChild(th);

        for (const step of steps) {
            const td = document.createElement("td");

            td.dataset.type = step.Type;
            td.dataset.status = step.Ok ? 'ok' : 'error';
            td.appendChild(textSpan(step.Error || "-"));

            tr.appendChild(td);
        }
        return tr;
    }

    async function buildFieldRow(section: Section, key: SectionValue, steps: ConvertStep[]) {
        const tr = document.createElement("tr");
        tr.className = "field-row";
        tr.dataset.property = key;

        const th = document.createElement("th");
        th.scope = "row";
        th.textContent = key;
        tr.appendChild(th);

        let previousStepValue: string | undefined;

        for (const step of steps) {
            const td = document.createElement("td");
            const obj = step[ section ];
            let valueJson: string = 'null';

            td.dataset.type = step.Type;

            if (obj && key in obj) {
                const value = obj[ key as keyof typeof obj ];
                valueJson = JSON.stringify(value);
                td.appendChild(await renderValue(key, value, step.PkmVariant?.Version));
            } else {
                td.appendChild(textSpan("-"));
            }

            if (previousStepValue && !changedPropertiesToIgnore.has(key) && previousStepValue !== valueJson) {
                td.classList.add('changed');
                tr.classList.add('changed');
            }

            tr.appendChild(td);

            previousStepValue = valueJson;
        }
        return tr;
    }

    const filtersPromise = setupFilters();

    const rootChildren: Node[] = [];

    for (const entry of (await getIndexData()).Entries) {
        const formLineTem = document.importNode(formLineTemplate.content, true);

        const formLine = formLineTem.querySelector<HTMLDetailsElement>('.form-line')!;
        const formData = formLine.querySelector<HTMLDetailsElement>('.form-data')!;
        const formWarnings = formLine.querySelector('.warnings')!;

        formLine.id = entry.Species.toString().padStart(4, '0') + (entry.Form > 0
            ? '_' + entry.Form.toString().padStart(2, '0')
            : '');

        formLine.addEventListener('toggle', async () => {
            if (formLine.open) {
                const form = await fetchForm(entry.Id);

                const suites = await Promise.all(
                    form.Paths.map(async ({ Item1: direction, Item2: values }) => {
                        return await renderStepSuite(direction, values);
                    })
                );
                formData.append(...suites.filter(s => s !== undefined));

                formWarnings.innerHTML = [
                    form.MissingSavePkmTypes.length > 0
                    && `Missing test saves using PKM types: ${form.MissingSavePkmTypes.join(', ')}`,
                    form.MissingSavePkmsPresent.length > 0
                    && `Missing test saves which contains PKMs: ${form.MissingSavePkmsPresent.join(', ')}`,
                ].filter(Boolean).join('\n');

                window.location.hash = formLine.id;

                root.querySelectorAll<HTMLDetailsElement>('.form-line[open]').forEach(el => {
                    if (el.id !== formLine.id)
                        el.open = false;
                });

            } else {
                formData.innerHTML = '';
                formWarnings.innerHTML = '';
            }
        });

        const [ sheetsData, speciesData ] = await Promise.all([
            getSheetsData(),
            getSpeciesData(),
        ]);

        const speciesForm = Object.values(speciesData[ entry.Species ]?.Forms ?? {})
            .find(forms => forms.length > entry.Form)?.[ entry.Form ];

        const sprite = speciesForm?.SpriteDefault;
        const spriteObj = sheetsData[ sprite ?? '' ];

        if (!spriteObj) {
            console.warn('No sprite found for', entry, speciesData[ entry.Species ]);
            continue;
        }

        const imgSrc = `public/sheets/${spriteObj?.SheetName}`;

        const formTitle = formLine.querySelector<HTMLElement>('.form-left-title')!;
        formTitle.innerHTML = `#${entry.Species.toString().padStart(4, '0')} ${speciesForm?.Name}`;
        if (entry.Form > 0)
            formTitle.innerHTML = formTitle.innerHTML + `\nForm ${entry.Form}`;

        const speciesImg = formLine.querySelector<HTMLImageElement>('.species-img img')!;
        speciesImg.src = imgSrc;
        speciesImg.style.width = `${spriteObj?.Width}px`;
        speciesImg.style.height = `${spriteObj?.Height}px`;
        speciesImg.style.objectPosition = `-${spriteObj?.X}px -${spriteObj?.Y}px`;

        rootChildren.push(formLineTem);
    }

    root.append(...rootChildren);

    const scrollToHashIfAny = () => {
        if (window.location.hash) {
            const target = document.getElementById(window.location.hash.substring(1));
            if (target) {
                if (target instanceof HTMLDetailsElement)
                    target.open = true;
                target.scrollIntoView();
            }
        }
    };

    window.addEventListener('hashchange', scrollToHashIfAny);

    scrollToHashIfAny();

    await filtersPromise;

    console.timeEnd('setup');
};
