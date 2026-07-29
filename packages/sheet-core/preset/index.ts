"use client";

/**
 * Univer Sheet Preset Configuration
 *
 * Following the official Univer preset mode documentation:
 * https://docs.univer.ai/guides/sheets/getting-started/installation
 *
 * Preset mode provides a pre-configured combination of plugins,
 * requiring minimal setup to get a fully functional spreadsheet.
 */

import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverPresetSheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US';
import { LocaleType } from '@univerjs/presets';

/**
 * Creates the Univer Sheets Core Preset configuration.
 * This is the primary preset that includes:
 * - Spreadsheet rendering engine
 * - Formula engine
 * - UI toolbar, context menus, and formula bar
 * - Cell editing and selection
 */
export function createSheetPreset(options: {
  container: string | HTMLElement;
  header?: boolean;
  footer?: boolean;
  toolbar?: boolean;
  formulaBar?: boolean;
}) {
  return UniverSheetsCorePreset({
    container: options.container,
    header: options.header,
    footer: options.footer === true ? undefined : options.footer,
    toolbar: options.toolbar,
    formulaBar: options.formulaBar,
  });
}

/**
 * Returns merged locale objects for the Univer engine.
 * Supplies the full preset locale bundle so all ribbon/toolbar labels resolve.
 * The "Start" → "Home" override is applied separately in HomeRibbonPlugin.onStarting()
 * because preset plugin locale loading can overwrite values set at init time.
 */
export function getPresetLocales() {
  return {
    [LocaleType.EN_US]: UniverPresetSheetsCoreEnUS,
  };
}

/**
 * Returns a default workbook data snapshot with access to millions of cells.
 * Uses virtual scrolling so only visible cells are rendered regardless of dimensions.
 * Sample data is provided in the first rows as a starting point.
 */
export function getSalesForecastData() {
  return {
    id: 'mona-sheet',
    name: 'Sheet',
    sheetOrder: ['sheet-01'],
    sheets: {
      'sheet-01': {
        id: 'sheet-01',
        name: 'Sheet1',
        rowCount: 1_000_000,
        columnCount: 100,
        defaultColumnWidth: 100,
        defaultRowHeight: 24,
        cellData: {
          0: {
            0: { v: 'Hello!', s: 'bold' },
            1: { v: 'Start editing or scroll down for millions more rows', s: 'italic' },
          },
        },
        styles: {
          bold: { bl: 1 },
          italic: { it: 1 },
        },
      },
    },
  };
}

// Re-export useful types and utilities from @univerjs/presets
export { createUniver, LocaleType } from '@univerjs/presets';
export { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
