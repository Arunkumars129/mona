/**
 * @mona/workbook-service — The abstraction layer between AI tools and the spreadsheet engine.
 *
 * Layer 1.5: WorkbookService + Command Bus + Event Bus.
 */

export type { WorkbookService } from "./service";
export { SpreadsheetCommandBus } from "./command-bus";
export { InProcessEventBus } from "./event-bus";
export { UniverAdapter } from "./univer-adapter";
export { SnapshotWorkbookService } from "./snapshot-service";
