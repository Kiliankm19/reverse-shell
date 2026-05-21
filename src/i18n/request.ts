import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const [common, builder, collections, listener, upgrade, legal] =
    await Promise.all([
      import("../../messages/en/common.json"),
      import("../../messages/en/builder.json"),
      import("../../messages/en/collections.json"),
      import("../../messages/en/listener.json"),
      import("../../messages/en/upgrade.json"),
      import("../../messages/en/legal.json"),
    ]);

  return {
    locale: "en",
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
