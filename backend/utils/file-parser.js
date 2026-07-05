// utils/file-parser.js — CSV and XLSX file parsing utilities
//
// Parses uploaded bulk files into an array of row objects.
// Each row object has: { name, price, categoryName, image }
// These are validated in bulk-upload.service.js AFTER parsing.

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const ExcelJS = require('exceljs');

/**
 * Parse a CSV file into an array of row objects.
 *
 * Uses csv-parse with the following options:
 * - columns: true → use the first row as column headers (keys for each row object)
 * - skip_empty_lines: true → ignore blank lines
 * - trim: true → strip whitespace from cell values
 *
 * @param {string} filePath - Absolute path to the CSV file
 * @returns {Promise<Array<object>>} Array of { name, price, categoryName, image? } objects
 */
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(parse({
        columns: true,       // First row = column headers
        skip_empty_lines: true,
        trim: true,
        cast: false          // Keep all values as strings — we validate types later
      }))
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', () => {
        resolve(rows);
      })
      .on('error', (err) => {
        reject(new Error(`CSV parsing error: ${err.message}`));
      });
  });
}

/**
 * Parse an XLSX file into an array of row objects.
 *
 * Uses ExcelJS to read the first worksheet.
 * The first row is treated as the header row.
 * Each subsequent row is converted into an object keyed by header names.
 *
 * @param {string} filePath - Absolute path to the XLSX file
 * @returns {Promise<Array<object>>} Array of row objects
 */
async function parseXLSX(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.getWorksheet(1);  // Get the first sheet
  if (!worksheet) {
    throw new Error('XLSX file has no worksheets.');
  }

  const rows = [];
  let headers = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // First row = headers
      // row.values is 1-indexed (index 0 is undefined), so we slice from 1
      headers = row.values.slice(1).map((h) => String(h).trim());
    } else {
      // Data rows — map cell values to header keys
      const rowData = {};
      row.values.slice(1).forEach((value, index) => {
        if (headers[index]) {
          rowData[headers[index]] = value !== null && value !== undefined ? String(value).trim() : '';
        }
      });
      rows.push(rowData);
    }
  });

  return rows;
}

/**
 * Parse a file based on its extension.
 * @param {string} filePath - Path to the file
 * @param {string} extension - File extension (.csv or .xlsx)
 * @returns {Promise<Array<object>>} Parsed rows
 */
async function parseFile(filePath, extension) {
  if (extension === '.csv') {
    return parseCSV(filePath);
  } else if (extension === '.xlsx') {
    return parseXLSX(filePath);
  }
  throw new Error(`Unsupported file format: ${extension}`);
}

module.exports = { parseCSV, parseXLSX, parseFile };
