# Greg Annandale Photography portfolio

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

```bash
npm run build
```

Auto-resize images in the `assets/images` directory (recursively) to 2000px max width and height, maintaining aspect ratio:

```bash
npm run resize-images
```

Test (the Cloudflare Worker):

```bash
npm test
```
