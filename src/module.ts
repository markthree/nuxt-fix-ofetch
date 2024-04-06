import { addPlugin, createResolver, defineNuxtModule } from "@nuxt/kit";

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-fix-ofetch",
    configKey: "fixOfetch",
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup() {
    const resolver = createResolver(import.meta.url);

    addPlugin(resolver.resolve("./runtime/fetch.client"));
  },
});
