/** Bump in .env when you replace public/logo.png to bust browser + Next image cache. */
export function getLogoUrl(): string {
  const version = process.env.NEXT_PUBLIC_LOGO_VERSION ?? "1";
  return `/logo.png?v=${version}`;
}
