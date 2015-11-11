Victory Scatter
=============

VictoryScatter creates a scatter of points from data. Scatter is a composable component, so it does not include an axis.  Check out Victory Chart for easy to use scatter plots and more.

## Examples

VictoryScatter is written to be highly configurable, but it also includes a set of sensible defaults and fallbacks. If no props are provided, VictoryScatter plots the identity function `(x) => x` as a set of points.

```playground
 <VictoryScatter/>
```

To display your own data, just pass in an array of data objects via the data prop.

```playground
 <VictoryScatter
    data={[
      {x: 1, y: 3},
      {x: 2, y: 5},      
      {x: 3, y: 4},
      {x: 4, y: 2},
      {x: 5, y: 5}
    ]}
 />
```

VictoryScatter can also plot functions:

```playground
 <VictoryScatter
    y={(x) => Math.sin(2 * Math.PI * x)}
 />
```
