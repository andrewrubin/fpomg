# fpomg

### A node-based, custom FPO image API

![image](https://user-images.githubusercontent.com/30575213/141667324-6a15bfc5-6771-429b-830e-2bd9bd44eb8b.png)



Navigate to, or set your image source to:

```
https://fpomg.com/600/400
```

The two numbers in the URL correspond to the width and the height of the image. Images are generated at a `2x` size, for high pixel density displays.

## Color

Add a hexidecimal color code to the URL for a custom background color. Defaults to `ff00b3`.

```
https://fpomg.com/600/400/b4d455
```

The text color will automatically choose between white or black, based on its contrast with the background.

## Text

Use custom text by passing a `?text` variable to the URL. Defaults to `FPO`.

```
https://fpomg.com/600/400/b4d455/?text=coming soon
```

## Development Requirements:

- [Node v13.3.0](https://nodejs.org/en/download/releases/) (required for Heroku to play nice with `node-canvas`: see the [GitHub issue](https://github.com/Automattic/node-canvas/issues/1563))
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
