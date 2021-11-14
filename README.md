# fpomg

### A node-based, custom FPO image API

![image](https://user-images.githubusercontent.com/30575213/141658278-094247e0-b512-415b-a85d-472f9738fb22.png)

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

- [Node v16](https://nodejs.org)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
