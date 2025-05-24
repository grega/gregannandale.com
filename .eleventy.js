const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const path = require("path");
const directoryOutputPlugin = require("@11ty/eleventy-plugin-directory-output");

// Process images at build time instead of during template rendering
async function processImage(src, options) {
  const inputPath = path.join(__dirname, "src", src);
  return await Image(inputPath, options);
}

function generateImageHTML(metadata, imageAttributes) {
  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function(eleventyConfig) {
  // Add plugins
  eleventyConfig.addPlugin(directoryOutputPlugin);
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // widths: [400, 800, 1200, 1600, 2000],
    // formats: ["avif", "webp", "jpeg"],
    // sizes: "100vw"
  });
  
  // Add pagination data
  eleventyConfig.addFilter("getPaginationData", function(page) {
    if (!page || !page.url) return null;
    
    const matches = page.url.match(/\/(\d+)\/$/);
    if (!matches) return null;
    
    const currentIndex = parseInt(matches[1], 10);
    const isTravel = page.url.includes("/travel/");
    const basePath = isTravel ? "/travel/" : "/";
    
    return {
      currentIndex,
      basePath
    };
  });
  
  // Add navigation helper
  eleventyConfig.addFilter("getNavigation", function(paginationData, totalImages) {
    if (!paginationData || typeof totalImages !== 'number') return {};
    
    const { currentIndex, basePath } = paginationData;
    
    return {
      previous: currentIndex > 0 ? `${basePath}${currentIndex - 1}/` : null,
      next: currentIndex < totalImages - 1 ? `${basePath}${currentIndex + 1}/` : null
    };
  });
  
  // Pass through static files
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/css");
  
  // Watch CSS files for changes
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
