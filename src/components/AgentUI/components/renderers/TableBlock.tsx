'use client'

import React, { useMemo } from 'react'
import type { TableBlockProps } from '../cardTypes'
import { CTable } from '../../../StdReport/CTable'

const TableBlock: React.FC<TableBlockProps> = ({
  content,
  data,
  columns,
  className = '',
  style
}) => {
  const parseMarkdownTable = (markdownContent: string) => {
    const lines = markdownContent.trim().split('\n')
    if (lines.length < 2) return { headers: [], rows: [] }

    const headerLine = lines[0].trim()
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h)

    const dataLines = lines.slice(2)
    const rows = dataLines.map(line => {
      const cells = line.split('|').map(c => c.trim()).filter(c => c)
      return cells
    })

    return { headers, rows }
  }

  const tableConfig = useMemo(() => {
    if (data && columns) {
      return {
        columns: columns.map(col => ({
          id: col.key,
          label: col.title,
          numeric: col.dataType === 'number'
        })),
        rows: data.map((item, index) => ({
          ...item,
          id: item.id || `row_${index}`
        }))
      }
    } else if (content) {
      const parsed = parseMarkdownTable(content)
      const generatedColumns = parsed.headers.map((header, index) => ({
        id: `col_${index}`,
        label: header,
        numeric: false
      }))
      
      const generatedRows = parsed.rows.map((rowArray, rowIndex) => {
        const rowObj: any = { id: `row_${rowIndex}` }
        rowArray.forEach((cell, cellIndex) => {
          rowObj[`col_${cellIndex}`] = cell
        })
        return rowObj
      })

      return {
        columns: generatedColumns,
        rows: generatedRows
      }
    }
    return { columns: [], rows: [] }
  }, [content, data, columns])

  if (tableConfig.rows.length === 0) {
    return null
  }

  return (
    <div className={`my-4 ${className}`} style={style}>
      <CTable
        appId="agent-ui-table-block"
        title="表格数据"
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

export default TableBlock
