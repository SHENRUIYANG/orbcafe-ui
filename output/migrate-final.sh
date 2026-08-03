#!/bin/bash
# Complete MUI→ORBIS migration script for remaining modules
set -e

cd /Users/shenruiyang/AI/ORBCAFE

echo "=== Phase 1: Fix all lucide-react imports ==="
find src/components/{GraphReport,StdReport,Molecules,Pad,Kanban,Planning,Tree,PivotTable,DetailInfo,AgentUI,CustomizeAgent} examples/app -name "*.tsx" -type f -exec sed -i '' \
  -e 's/import \([A-Za-z0-9_]*\) from "lucide-react";/LUCIDE_PLACEHOLDER_\1/g' \
  {} \;

# Collect all unique icon names and create proper import
for dir in src/components/{GraphReport,StdReport,Molecules,Pad,Kanban,Planning,Tree,PivotTable,DetailInfo,AgentUI,CustomizeAgent} examples/app; do
  if [ -d "$dir" ]; then
    find "$dir" -name "*.tsx" -type f -print0 | while IFS= read -r -d '' file; do
      if grep -q "LUCIDE_PLACEHOLDER_" "$file"; then
        icons=$(grep -o "LUCIDE_PLACEHOLDER_[A-Za-z0-9_]*" "$file" | sed 's/LUCIDE_PLACEHOLDER_//' | sort -u | tr '\n' ',' | sed 's/,$//')
        if [ -n "$icons" ]; then
          # Replace placeholders with proper destructured import
          sed -i '' "1s/^/import { $icons } from 'lucide-react';\n/" "$file"
          sed -i '' 's/LUCIDE_PLACEHOLDER_//g' "$file"
        fi
      fi
    done
  fi
done

echo "=== Phase 2: Fix @mui/material imports ==="
find src/components/{GraphReport,StdReport,Molecules,Pad,Kanban,Planning,Tree,PivotTable,DetailInfo,AgentUI,CustomizeAgent} examples/app -name "*.tsx" -type f -exec sed -i '' \
  -e '/^import.*@mui\/material/d' \
  -e '/^import.*@mui\/icons-material/d' \
  -e '/^import.*@mui\/x-date-pickers/d' \
  {} \;

echo "=== Phase 3: Add ORBIS Atoms imports where components used ==="
for file in $(find src/components/{GraphReport,StdReport,Molecules,Pad,Kanban,Planning,Tree,PivotTable,DetailInfo,AgentUI,CustomizeAgent} examples/app -name "*.tsx" -type f); do
  needs_atoms=false
  atoms_list=""

  grep -q "<CButton\|<CTextField\|<CSelect\|<CCheckbox\|<CChip\|<CBadge\|<CAlert\|<CPaper\|<CStack\|<CTypography\|<CDialog\|<CIconButton\|<CTooltip\|<CMenu\|<CTabs\|<CDatePicker\|<CRadioGroup\|<CSwitch\|<CTextArea\|<CProgress\|<CSkeleton\|<CSpinner\|<CAvatar\|<CPopover\|<CFileUpload\|<CDivider" "$file" && needs_atoms=true

  if [ "$needs_atoms" = true ]; then
    # Detect which atoms are used
    [ $(grep -c "<CButton" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CButton,"
    [ $(grep -c "<CTextField" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CTextField,"
    [ $(grep -c "<CSelect" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CSelect,"
    [ $(grep -c "<CCheckbox" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CCheckbox,"
    [ $(grep -c "<CChip" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CChip,"
    [ $(grep -c "<CBadge" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CBadge,"
    [ $(grep -c "<CAlert" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CAlert,"
    [ $(grep -c "<CPaper" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CPaper,"
    [ $(grep -c "<CStack" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CStack,"
    [ $(grep -c "<CTypography" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CTypography,"
    [ $(grep -c "<CDialog" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CDialog,"
    [ $(grep -c "<CIconButton" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CIconButton,"
    [ $(grep -c "<CTooltip" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CTooltip,"
    [ $(grep -c "<CMenu" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CMenu,"
    [ $(grep -c "<CTabs" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CTabs,"
    [ $(grep -c "<CDatePicker" "$file" || true) -gt 0 ] && atoms_list="$atoms_list CDatePicker,"

    atoms_list=$(echo "$atoms_list" | sed 's/,$//')
    if [ -n "$atoms_list" ]; then
      # Compute relative path to Atoms
      depth=$(echo "$file" | grep -o "/" | wc -l)
      rel_path=$(printf '../%.0s' $(seq 1 $((depth - 3))))
      sed -i '' "1s|^|import { $atoms_list } from '${rel_path}Atoms';\n|" "$file"
    fi
  fi
done

echo "=== Phase 4: Fix sx props → style props ==="
find src/components/{GraphReport,StdReport,Molecules,Pad,Kanban,Planning,Tree,PivotTable,DetailInfo,AgentUI,CustomizeAgent} examples/app -name "*.tsx" -type f -exec sed -i '' \
  -e 's/ sx=/ style=/g' \
  {} \;

echo "=== Phase 5: Type fixes in type files ==="
find src/components/{GraphReport,StdReport,Molecules,Pad,Kanban,Planning,Tree,PivotTable,DetailInfo,AgentUI,CustomizeAgent} -name "types.ts" -type f -exec sed -i '' \
  -e 's/SxProps<Theme>/React.CSSProperties/g' \
  -e '/import.*@mui.*Theme/d' \
  -e "1s|^|import type { CSSProperties } from 'react';\n|" \
  {} \;

echo "=== Done. Verifying... ==="
echo "Remaining @mui imports:"
grep -r "@mui" src/components/{GraphReport,StdReport,Molecules,Pad,Kanban,Planning,Tree,PivotTable,DetailInfo,AgentUI,CustomizeAgent} examples/app --include="*.tsx" --include="*.ts" | wc -l
