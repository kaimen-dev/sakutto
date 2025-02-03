/**
 * This script imports SVG icons from a directory, optimises them and exports as IconifyJSON.
 * It is a Node.js script that should be run from command line.
 * 
 * Usage:npm install @iconify/tools --save
 * node [dir]/iconify_tools.js
 * 
 * 生成したIconifyJSONファイルをルートレベルで追加登録することで、iconify-vueでアイコンを使用することができます。
 * import { addCollection } from "@iconify/vue";
 * import icons from "./assets/icons.json";
 * addCollection(icons);
 * iconify-vueでアイコンを追加する
 * @see https://iconify.design/docs/libraries/tools/export/svg.html
 */

import { promises as fs } from "fs";
import {
  importDirectory,
  cleanupSVG,
  runSVGO,
  parseColors,
  isEmptyColor,
} from "@iconify/tools";

const importDir = "./src/assets/icon";
const outputDir = "./src/assets";
const prefix = "icons";// 生成されるIconifyJSONファイルのプレフィックスとファイル名に使用されます。

(async () => {
  // Import icons
  const iconSet = await importDirectory(importDir, {
    prefix: prefix,
  });

  // Validate, clean up, fix palette and optimise
  iconSet.forEach((name, type) => {
    if (type !== "icon") {
      return;
    }

    const svg = iconSet.toSVG(name);
    if (!svg) {
      // Invalid icon
      iconSet.remove(name);
      return;
    }

    // Clean up and optimise icons
    try {
      // Clean up icon code
      cleanupSVG(svg);

      // Assume icon is monotone: replace color with currentColor, add if missing
      // If icon is not monotone, remove this code
      parseColors(svg, {
        defaultColor: "currentColor",
        callback: (attr, colorStr, color) => {
          return !color || isEmptyColor(color) ? colorStr : "currentColor";
        },
      });

      // Optimise
      runSVGO(svg);
    } catch (err) {
      // Invalid icon
      console.error(`Error parsing ${name}:`, err);
      iconSet.remove(name);
      return;
    }

    // Update icon
    iconSet.fromSVG(name, svg);
  });
  // Export as IconifyJSON
  const exported = JSON.stringify(iconSet.export(), null, "\t") + "\n";

  // Save to file
  await fs.writeFile(`${outputDir}/${iconSet.prefix}.json`, exported, "utf8");
  // Export
  // console.log(iconSet.export());
})();
