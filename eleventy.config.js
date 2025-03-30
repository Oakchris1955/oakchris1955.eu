import CleanCSS from "clean-css";
import sitemap from "@quasibit/eleventy-plugin-sitemap";

import pluginFilters from "./_config/filters.js";
import { genSitemap } from "./_config/sitemapUtils.js";

const hostname = "oakchris1955.eu"

export default function (eleventyConfig) {
  eleventyConfig.setNunjucksEnvironmentOptions({
    trimBlocks: true,
    lstripBlocks: true,
  });
  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({ level: 2 }).minify(code).styles;
  });
  eleventyConfig.globalData["hostname"] = hostname;
  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      // Hostname is needed when the URLs of the items don't include it.
      hostname: `https://${hostname}/`,
    }
  });
  eleventyConfig.addCollection("sitemap", async (collectionsApi) => {
    genSitemap("./public");
    return [
      ...collectionsApi.getAll(),
      ...genSitemap("./public")
    ];
  });
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy({ "public": "/" });

  eleventyConfig.addPlugin(pluginFilters);
};

export const config = {
  dir: {
    input: "content",
    includes: "../_includes",
    data: "../_data"
  }
};
