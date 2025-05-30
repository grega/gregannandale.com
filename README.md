# Photography portfolio

https://gregannandale.com

Deployed via [Cloudflare Pages](https://dash.cloudflare.com/c37b1434e9c3d7c46cf23c17acd54595/pages/view/gregannandale-com).

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
