import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

// Home-screen icon for iOS, which ignores SVG favicons. Rendered from app/icon.svg at build time.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  // iOS rounds the corners itself, so draw the tile square.
  const svg = fs.readFileSync(path.join(process.cwd(), "app", "icon.svg"), "utf8").replace(/ rx="12"/, "");
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`} width={180} height={180} alt="" />
    ),
    size,
  );
}
