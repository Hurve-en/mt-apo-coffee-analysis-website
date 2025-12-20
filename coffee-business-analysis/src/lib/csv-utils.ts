/**
 * CSV UTILITIES
 * 
 * Helper functions for exporting and importing CSV files
 * 
 * FEATURES:
 * - Export data to CSV
 * - Parse CSV files
 * - Download CSV files
 * - Validate CSV data
 */

// Convert array of objects to CSV string
export function convertToCSV(data: any[], headers: string[]): string {
  if (data.length === 0) return ''

  // Create header row
  const headerRow = headers.join(',')
  
  // Create data rows
  const dataRows = data.map(item => {
    return headers.map(header => {
      const value = item[header]
      // Escape values with commas or quotes
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

// Download CSV file
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Parse CSV string to array of objects
export function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []

  // Get headers from first line
  const headers = lines[0].split(',').map(h => h.trim())
  
  // Parse data rows
  const data = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === headers.length) {
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index].trim()
      })
      data.push(row)
    }
  }

  return data
}

// Parse a single CSV line (handles quoted values)
function parseCSVLine(line: string): string[] {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

// Validate customer CSV data
export function validateCustomerCSV(data: any[]): { valid: boolean, errors: string[] } {
  const errors: string[] = []

  data.forEach((row, index) => {
    if (!row.name || !row.name.trim()) {
      errors.push(`Row ${index + 2}: Name is required`)
    }
    if (!row.email || !row.email.trim()) {
      errors.push(`Row ${index + 2}: Email is required`)
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push(`Row ${index + 2}: Invalid email format`)
    }
  })

  return { valid: errors.length === 0, errors }
}

// Validate product CSV data
export function validateProductCSV(data: any[]): { valid: boolean, errors: string[] } {
  const errors: string[] = []

  data.forEach((row, index) => {
    if (!row.name || !row.name.trim()) {
      errors.push(`Row ${index + 2}: Name is required`)
    }
    if (!row.category || !row.category.trim()) {
      errors.push(`Row ${index + 2}: Category is required`)
    }
    if (!row.price || isNaN(parseFloat(row.price))) {
      errors.push(`Row ${index + 2}: Valid price is required`)
    }
    if (!row.cost || isNaN(parseFloat(row.cost))) {
      errors.push(`Row ${index + 2}: Valid cost is required`)
    }
    if (row.stock && isNaN(parseInt(row.stock))) {
      errors.push(`Row ${index + 2}: Stock must be a number`)
    }
  })

  return { valid: errors.length === 0, errors }
}

// Validate order CSV data
export function validateOrderCSV(data: any[]): { valid: boolean, errors: string[] } {
  const errors: string[] = []

  data.forEach((row, index) => {
    if (!row.customerEmail || !row.customerEmail.trim()) {
      errors.push(`Row ${index + 2}: Customer email is required`)
    }
    if (!row.productName || !row.productName.trim()) {
      errors.push(`Row ${index + 2}: Product name is required`)
    }
    if (!row.quantity || isNaN(parseInt(row.quantity))) {
      errors.push(`Row ${index + 2}: Valid quantity is required`)
    }
  })

  return { valid: errors.length === 0, errors }
}