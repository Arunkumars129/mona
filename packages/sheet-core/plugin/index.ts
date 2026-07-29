/**
 * Sheet Plugin Module
 *
 * Custom Univer plugin registration & menu command helpers.
 * @see https://docs.univer.ai/guides/recipes/tutorials/custom-plugin
 */

export { HomeRibbonPlugin } from "./home-ribbon-plugin";

export interface CustomMenuOption {
  id: string;
  title: string;
  action: (univerAPI: any) => void;
}

export interface PluginHooks {
  onWorkbookCreated?: (univerAPI: any) => void;
}

/**
 * Custom Mona Spreadsheet Plugin helper class.
 */
export class MonaCustomPlugin {
  static type = 0;
  static pluginName = "MONA_CUSTOM_PLUGIN";

  onStarting(): void {
    // Custom plugin lifecycle hook
  }
}

/**
 * Registers custom menu commands with the Univer facade API.
 */
export function registerCustomMenuItems(
  univerAPI: any,
  options: CustomMenuOption[]
): void {
  if (!univerAPI) return;
  options.forEach((opt) => {
    try {
      univerAPI.registerCommand({
        id: opt.id,
        handler: () => opt.action(univerAPI),
      });
    } catch {
      // Ignore if command already registered
    }
  });
}

/**
 * Sets up optional lifecycle hooks after workbook creation.
 */
export function setupPluginHooks(
  univerAPI: any,
  hooks?: PluginHooks
): void {
  if (hooks?.onWorkbookCreated) {
    hooks.onWorkbookCreated(univerAPI);
  }
}
