import CleanCSS from "clean-css";
import sitemap from "@quasibit/eleventy-plugin-sitemap";
import pluginFilters from "./_config/filters.js";

export default function (eleventyConfig) {
  console.log(eleventyConfig)
  eleventyConfig.addFilter("cssmin", function (code) {
		return new CleanCSS({level: 2}).minify(code).styles;
	});
  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      // Hostname is needed when the URLs of the items don't include it.
      hostname: "https://oakchris1955.eu",
    }
  });
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy({"public": "/"});

  eleventyConfig.addPlugin(pluginFilters);
};

export const config = {
  dir: {
    input: "content",
    includes: "../_includes",
    data: "../_data"
  }
};
