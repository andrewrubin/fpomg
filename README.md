<img src="./logo-fpomg.png" alt="FPOMG logo" width="420" />

### The URL-based custom FPO image API

Custom colors to match your designs, and custom text to suit your needs. [Try it!](https://fpomg.com)

## Usage

Navigate to, or set your image source to:

```
https://fpomg.com/600/400
```

The two numbers in the URL correspond to the width and the height of the image.

## Color

Add a hexidecimal color code to the URL for a custom background color. Defaults to `ff00b3`.

```
https://fpomg.com/600/400/b4d455
```

The text color will automatically choose between white or black, based on its contrast with the background.

## Text

Use custom text by passing a `?text` variable to the URL. Defaults to the width and height of your image (i.e. "600 x 400").

```
https://fpomg.com/600/400/b4d455/?text=coming soon
```

### Text variables

If your text parameter contains the strings `${width}` or `${height}`, they will be replaced with the width and height of the image:

```
https://fpomg.com/600/400/b4d455/?text=this is ${width} wide
```

## Contributing:

Please feel free to open a pull request or an issue.

### Back end

For working on the Express app that handles all the image generation, you'll need to use Node.js v13.3.0](https://nodejs.org/en/download/releases/). This is required for Heroku to play nice with `node-canvas` (see the [GitHub issue](https://github.com/Automattic/node-canvas/issues/1563)).
