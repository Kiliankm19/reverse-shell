import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const [common, builder, collections, listener, upgrade, legal] =
    await Promise.all([
      import(`../../messages/${locale}/common.json`),
      import(`../../messages/${locale}/builder.json`),
      import(`../../messages/${locale}/collections.json`),
      import(`../../messages/${locale}/listener.json`),
      import(`../../messages/${locale}/upgrade.json`),
      import(`../../messages/${locale}/legal.json`),
    ]);

  return {
    locale,
    messages: {
      ...common.default,
      builder: builder.default,
      collections: collections.default,
      listener: listener.default,
      upgrade: upgrade.default,
      legal: legal.default,
    },
  };
});
