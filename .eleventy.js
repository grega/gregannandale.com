const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const directoryOutputPlugin = require("@11ty/eleventy-plugin-directory-output");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(directoryOutputPlugin);
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    widths: [400, 800, 1200, 1600, 2000],
    formats: ["jpeg"],
    sizes: "(min-width: 1200px) 1200px, 100vw"
  });
  
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/_headers");
  
  eleventyConfig.addWatchTarget("src/scss/");
  
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}; 
