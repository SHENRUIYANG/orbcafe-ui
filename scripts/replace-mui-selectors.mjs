import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const files = execFileSync('rg', ['-l', '\\.Mui|Mui[A-Z]', 'src'], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)
  .filter((file) => !file.endsWith('.md'));

const replacements = [
  ['.MuiTableRow-root.Mui-selected', 'tr.orb-selected'],
  ['.MuiTableContainer-root', '.orb-table-container'],
  ['.MuiCheckbox-root.Mui-checked, & .MuiCheckbox-root.MuiCheckbox-indeterminate', '.orb-chk:has(input:checked), & .orb-chk:has(input:indeterminate)'],
  ['.MuiGrid-root > .MuiGrid-item, & .MuiGrid-root > .MuiGrid-sizeXs-1, & .MuiGrid-root > [class*="MuiGrid-grid-"]', '.orb-grid > *'],
  ['.MuiOutlinedInput-notchedOutline', '.orb-inp'],
  ['.MuiTableSortLabel-root', '.orb-table-sort-label'],
  ['.MuiTableSortLabel-icon', 'svg'],
  ['.MuiAutocomplete-noOptions', '.orb-autocomplete-empty'],
  ['.MuiAutocomplete-root', '.orb-autocomplete'],
  ['.MuiOutlinedInput-input', '.orb-inp'],
  ['.MuiInputBase-input', '.orb-inp'],
  ['.MuiInputBase-root', '.orb-inp-adornment-wrap, & .orb-inp'],
  ['.MuiSelect-select', 'select.orb-inp'],
  ['.MuiSelect-icon', '.orb-select-icon'],
  ['.MuiTableCell-root', 'th, & td'],
  ['.MuiAlert-message', 'span'],
  ['.MuiChip-label', '.orb-chip-label'],
  ['.MuiToolbar-root', '.orb-toolbar'],
  ['.MuiTextField-root', '.orb-fld'],
  ['.MuiIconButton-root', '.orb-icon-btn'],
  ['.MuiTypography-root', '.orb-body, & .orb-body-dense, & .orb-label, & .orb-meta'],
  ['.MuiButtonBase-root', 'button'],
  ['.MuiButton-root', '.orb-btn'],
  ['.MuiMenuItem-root', '.orb-menu-item, & option'],
  ['.MuiListSubheader-root', '.orb-list-subheader'],
  ['.MuiCheckbox-root', '.orb-chk'],
  ['.MuiFormControlLabel-label', '.orb-form-control-label > span'],
  ['.MuiDialog-paper', '.orb-dialog'],
  ['.MuiDialogTitle-root', '.orb-dialog-title'],
  ['.MuiDialogContent-root', '.orb-dialog-content'],
  ['.MuiPaper-root', '.orb-card'],
  ['.MuiGrid-root', '.orb-grid'],
  ['.MuiSvgIcon-root', 'svg'],
  ['.Mui-focused', ':focus-within'],
  ['.Mui-selected', '.orb-selected'],
  ['.Mui-active', '.orb-is-active'],
];

for (const file of files) {
  let source = await readFile(file, 'utf8');
  for (const [from, to] of replacements) source = source.split(from).join(to);
  await writeFile(file, source);
}

process.stdout.write(`Updated ${files.length} source files.\n`);
