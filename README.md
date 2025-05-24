# Greg Annandale Photography Portfolio

A minimalist, performant photography portfolio built with Eleventy.

## Features

- Responsive image optimization with multiple formats (AVIF, WebP, JPEG)
- Minimal JavaScript usage
- Smooth transitions and animations
- Accessible and SEO-friendly
- Dark theme with clean typography
- Easy image management through data files

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

The site will be available at `http://localhost:8080`

## Managing Content

### Portfolio Images
Add or modify images in the `src/_data/portfolio.json` file:

```json
{
  "images": [
    {
      "title": "Image Title",
      "image": "/assets/images/image-name.jpg",
      "alt": "Descriptive alt text",
      "category": "category-name"
    }
  ]
}
```

### Directory Structure

```
src/
├── _data/          # Data files for images and site config
├── _includes/      # Reusable components
├── _layouts/       # Base layouts
├── assets/         # Images and other static files
├── scss/          # Styles
└── index.njk       # Home page template
```

## Building for Production

```bash
npm run build
```

The built site will be in the `_site` directory.

## Performance Considerations

- Images are automatically optimized and served in modern formats
- CSS is minified
- JavaScript usage is minimal
- Lazy loading is implemented for gallery images
- Responsive images with appropriate sizes 
