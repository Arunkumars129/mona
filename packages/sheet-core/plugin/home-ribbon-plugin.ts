"use client";

import { Plugin, Injector, LocaleType, LocaleService } from "@univerjs/presets";

/**
 * HomeRibbonPlugin
 *
 * Custom Univer plugin that overrides the "Start" ribbon tab label to "Home".
 * The locale override must happen in onStarting() because preset plugins
 * load their locales during startup, which would overwrite any locales
 * passed at createUniver() time.
 *
 * Registered via the `plugins` array in `createUniver()`.
 */
export class HomeRibbonPlugin extends Plugin {
  static pluginName = "HOME_RIBBON_PLUGIN";

  protected declare _injector: Injector;

  constructor() {
    super();
  }

  onStarting(): void {
    try {
      const localeService = this._injector?.get(LocaleService);
      if (localeService) {
        localeService.load({
          [LocaleType.EN_US]: {
            ui: {
              ribbon: {
                start: "Home",
              },
            },
          },
        });
      }
    } catch {
      // Plugin may not have full injector available yet
    }
  }
}
