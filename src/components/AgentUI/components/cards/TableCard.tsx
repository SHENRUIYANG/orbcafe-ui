'use client'

import { FC, useMemo } from 'react'
import { CTable } from '../../../StdReport/CTable'

export const TableCard: FC<{ data: any }> = ({ data }) => {
  if (!data) return null;

  const tableConfig = useMemo(() => {
    let rows: any[] = []
    let columns: any[] = []
    let title = '数据表格'

    // Handle array of objects directly
    if (Array.isArray(data)) {
      rows = data
      if (rows.length > 0) {
        columns = Object.keys(rows[0]).map(key => ({
          id: key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          numeric: typeof rows[0][key] === 'number'
        }))
      }
    } 
    // Handle structured object { title, columns, rows/data }
    else if (typeof data === 'object') {
      title = data.title || title
      
      const rawRows = Array.isArray(data.rows) ? data.rows : (Array.isArray(data.data) ? data.data : [])
      rows = rawRows

      if (Array.isArray(data.columns)) {
         columns = data.columns.map((col: any) => ({
           id: col.key || col.id,
           label: col.title || col.label,
           numeric: col.dataType === 'number' || col.numeric
         }))
      } else if (rows.length > 0) {
         // Auto-generate columns from rows if columns missing but rows exist
         columns = Object.keys(rows[0]).map(key => ({
           id: key,
           label: key,
           numeric: typeof rows[0][key] === 'number'
         }))
      }
    }

    // Ensure rows have unique IDs
    rows = rows.map((row, index) => ({
      ...row,
      id: row.id || `row_${index}`
    }))

    return { title, columns, rows }
  }, [data])

  if (tableConfig.rows.length === 0) {
    return (
        <div className="w-full my-4 p-4 border border-dashed border-gray-300 rounded text-center text-gray-500">
            暂无表格数据
        </div>
    )
  }

  return (
    <div className="w-full my-4">
      <CTable
        appId="agent-ui-table-card"
        title={tableConfig.title}
        columns={tableConfig.columns}
        rows={tableConfig.rows}
        count={tableConfig.rows.length}
        rowKey="id"
        fitContainer={false}
        maxHeight="500px"
        rowsPerPage={10}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
    </div>
  )
}

export default TableCard;
