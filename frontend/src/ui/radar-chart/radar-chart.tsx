import { css } from '@emotion/css';
import type React from 'react';
import { theme } from '../theme';

export const RadarChart: React.FC<{
  width: number;
  data: number[][];
  dataMax: number[][];
  caption?: React.ReactNode;
  legend: React.ReactNode[];
  labels: React.ReactNode[];
  colors: string[];
}> = ({
  width, data, dataMax, caption, legend, labels, colors
}) => {
    const dataPercentRaw = data.map((values, valuesIndex) => values
      .map((value, i) => value * 100 / dataMax[ valuesIndex ]![ i ]!)
    );
    const dataPercent = dataPercentRaw.map((values) => values
      .map((value, i) => {
        const prevValue = values[ (i - 1) % values.length ]!;
        const nextValue = values[ (i + 1) % values.length ]!;
        const nextNextValue = values[ (i + 2) % values.length ]!;

        if (prevValue > 10 && value < 10 && nextValue > 10 && nextNextValue < 10) {
          return 10;
        }

        return value;
      })
    );

    return <table
      className={css(`
@charset "UTF-8";
& {
  --scale: 100;
  --step: 5;
  --items: ${data[ 0 ]!.length};
  --areas: ${data.length};
  --radius: ${width / 3}px; //12.8em;
  --unitless-radius: calc(1024 / 16 / 5);
  --size: calc(var(--radius) / var(--scale));
  --part: calc(360deg / var(--items));
  --integer: calc(var(--scale));

  block-size: calc(var(--radius) * 2);
  border: 1px solid;
  border-color: ${theme.border.default};
  border-radius: 50%;
  contain: layout;
  counter-reset: scale var(--integer);
  inline-size: calc(var(--radius) * 2);
  margin: 10px 2lh ${caption ? 5 : 3}lh;
  overflow: visible;
  position: relative;
  max-inline-size: 100%;
}

&, th, td {
  cursor: default;
}

& caption {
  background: none;
  inset-block-end: ${width / -4}px;
  position: absolute;
}

& [scope=col] {
  --away: calc((var(--radius) * -1) - 50%);
  background-color: transparent;
  left: 50%;
  margin: 0;
  padding: 0 4px;
  position: absolute;
  top: 50%;
  transform: translate3d(-50%, -50%, 0) rotate(calc(var(--part) * var(--index, 1))) translate(var(--away)) rotate(calc(var(--part) * var(--index, 1) * -1));
}

& th {
  display: flex;
  align-items: center;
  gap: 2px;
  font-weight: normal;
}

${data[ 0 ]!.map((value, i) => `& tr > *:nth-of-type(${i + 1}) {
  --index: ${i + 1};
}`)}

& td {
  --skew: calc(90deg - var(--part));
  block-size: 50%;
  border-block-end: 1px solid ${theme.border.default};
  inline-size: 50%;
  left: 0;
  padding: 0;
  margin: 0;
  position: absolute;
  top: 0;
  transform: rotate(calc(var(--part) * var(--index, 1))) skew(var(--skew));
  transform-origin: 100% 100%;
  align-items: flex-end;
  border-color: var(--color, ${theme.border.default});
  display: flex;
  justify-content: flex-end;
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
}

${data[ 0 ]!.map((value, i) => `& td:nth-of-type(${i + 1}) span {
  --point: var(--${i + 1});
  --pos: calc(100% - (var(--${i + 2}) * 100% / (var(--scale) * var(--ratio))));
}`)}

& td::after, & td::before {
  display: none;
}

& span {
  --to-radians: 0.01745329251;
  --opposite: calc(180 - (90 + (90 - (360 / var(--items)))));
  --angle: calc(var(--opposite) * var(--to-radians));
  --sin-angle: sin(var(--angle));
  --hypo: calc(var(--unitless-radius) / var(--sin-angle));
  --ratio: calc(var(--hypo) / var(--unitless-radius));
  --polygon: polygon(
  		100% var(--pos),
  		calc(100% - (var(--point) * 100% / var(--scale))) 100%,
  		100% 100%
  );
  block-size: 100%;
  clip-path: var(--polygon);
  inline-size: 100%;
  position: absolute;
  background: var(--color, currentcolor);
  pointer-events: auto;
}

& [scope=col]::after {
  display: block;
  font-size: small;
}

& tbody {
  columns: var(--areas);
  vertical-align: bottom;
}

& [scope=row] {
  block-size: 2rem;
  bottom: ${width / -5}px;
  left: 1rem;
  position: absolute;
}

& [scope=row]::before {
  background: var(--color, currentcolor);
  block-size: 1rem;
  content: "";
  display: inline-block;
  inline-size: 1rem;
  margin-inline-end: 0.25rem;
  translate: 0 0.1rem 0;
}

${labels.map((label, i) => `& tr:nth-child(${i + 1}) [scope=row] {
  left: calc(1rem + 100% / var(--areas) * ${i});
}`)}

& td::after {
  display: block;
  inline-size: 100%;
  text-indent: -0.5rem;
  transform: skew(calc(var(--skew) * -1)) rotate(calc(var(--part) * var(--index, 1) * -1));
  transform-origin: 0 0;
  white-space: nowrap;
}

${data[ 0 ]!.map((value, i) => `& td:nth-of-type(${i + 1})::after {
  --integer: calc(var(--${i + 1}-label));
  content: counter(value);
  counter-reset: value var(--integer);
  inline-size: calc(var(--${i + 1}) * 100% / var(--scale));
}`)}

@media (hover: hover) {
  & tbody:hover td {
    opacity: 0.25;
  }
  & td::after {
    opacity: 0;
    transition: inherit;
  }
  & tbody tr:hover td {
    opacity: 1;
    z-index: 1;
  }
  & tr:hover td::after {
    opacity: inherit;
  }
}
`)}
    >
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>
          <td></td>
          {legend.map((label, i) => <th key={i} scope="col">{label}</th>)}
        </tr>
      </thead>
      <tbody>
        {dataPercent.map((values, valuesIndex) => <tr
          key={valuesIndex}
          className={css(`
                        --color: ${colors[ valuesIndex ]};
                        ${values.map((value, i) => `--${i + 1}: ${value};\n`).join('')}
                        ${data[ valuesIndex ]!.map((value, i) => `--${i + 1}-label: ${value};\n`).join('')}
                        --${values.length + 1}: var(--1);
                    `)}
        >
          <th scope="row">{labels[ valuesIndex ]}</th>
          {data[ valuesIndex ]!.map((value, i) => <td key={i}><span>{value}</span></td>)}
        </tr>)}
      </tbody>
    </table>;
  };
