import React from "react";
import Radium from "radium";
import pick from "lodash/object/pick";
import values from "lodash/object/values";
import Point from "./point";
import {PropTypes, Chart, Data, Domain, Scale} from "victory-util";
import {VictoryAnimation} from "victory-animation";

const defaultStyles = {
  data: {
    fill: "#756f6a",
    opacity: 1,
    stroke: "transparent",
    strokeWidth: 0
  },
  labels: {
    stroke: "transparent",
    fill: "#756f6a",
    fontFamily: "Helvetica",
    fontSize: 10,
    textAnchor: "middle",
    padding: 5
  }
};

@Radium
export default class VictoryScatter extends React.Component {
  static role = "scatter";
  static propTypes = {
    /**
     * The animate prop specifies props for victory-animation to use. It this prop is
     * not given, the scatter plot will not tween between changing data / style props.
     * Large datasets might animate slowly due to the inherent limits of svg rendering.
     * @examples {delay: 5, velocity: 0.02, onEnd: () => alert("woo!")}
     */
    animate: React.PropTypes.object,
    /**
     * The bubbleProperty prop indicates which property of the data object should be used
     * to scale data points in a bubble chart
     */
    bubbleProperty: React.PropTypes.string,
    /**
     * The data prop specifies the data to be plotted. Data should be in the form of an array
     * of data points where each data point should be an object with x and y properties.
     * Other properties may be added to the data point object, such as fill, size, and symbol.
     * These properties will be interpreted and applied to the individual lines
     * @examples [{x: 1, y: 2, fill: "red"}, {x: 2, y: 3, label: "foo"}]
     */
    data: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        x: React.PropTypes.any,
        y: React.PropTypes.any
      })
    ),
    /**
     * The domain prop describes the range of values your chart will include. This prop can be
     * given as a array of the minimum and maximum expected values for your chart,
     * or as an object that specifies separate arrays for x and y.
     * If this prop is not provided, a domain will be calculated from data, or other
     * available information.
     * @examples [-1, 1], {x: [0, 100], y: [0, 1]}
     */
    domain: React.PropTypes.oneOfType([
      PropTypes.domain,
      React.PropTypes.shape({
        x: PropTypes.domain,
        y: PropTypes.domain
      })
    ]),
    /**
     * The height props specifies the height of the chart container element in pixels
     */
    height: PropTypes.nonNegative,
    /**
     * The labelComponent prop takes in an entire, HTML-complete label component
     * which will be used to create labels for scatter to use
     */
    labelComponent: React.PropTypes.element,
    /**
     * The maxBubbleSize prop sets an upper limit for scaling data points in a bubble chart
     */
    maxBubbleSize: PropTypes.nonNegative,
    /**
     * The padding props specifies the amount of padding in number of pixels between
     * the edge of the chart and any rendered child components. This prop can be given
     * as a number or as an object with padding specified for top, bottom, left
     * and right.
     */
    padding: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.shape({
        top: React.PropTypes.number,
        bottom: React.PropTypes.number,
        left: React.PropTypes.number,
        right: React.PropTypes.number
      })
    ]),
    /**
     * The samples prop specifies how many individual points to plot when plotting
     * y as a function of x. Samples is ignored if x props are provided instead.
     */
    samples: PropTypes.nonNegative,
    /**
     * The scale prop determines which scales your chart should use. This prop can be
     * given as a string specifying a supported scale ("linear", "time", "log", "sqrt"),
     * as a d3 scale function, or as an object with scales specified for x and y
     * @exampes d3Scale.time(), {x: "linear", y: "log"}
     */
    scale: React.PropTypes.oneOfType([
      PropTypes.scale,
      React.PropTypes.shape({
        x: PropTypes.scale,
        y: PropTypes.scale
      })
    ]),
    /**
     * The showLabels prop determines whether to show any labels associated with a data point.
     * Large datasets might animate slowly due to the inherent limits of svg rendering.
     * If animations are running slowly, try setting this prop to false to cut down on
     * the number of svg nodes
     */
    showLabels: React.PropTypes.bool,
    /**
     * The size prop determines how to scale each data point
     */
    size: React.PropTypes.oneOfType([
      PropTypes.nonNegative,
      React.PropTypes.func
    ]),
    /**
     * The standalone prop determines whether the component will render a standalone svg
     * or a <g> tag that will be included in an external svg. Set standalone to false to
     * compose VictoryScatter with other components within an enclosing <svg> tag.
     */
    standalone: React.PropTypes.bool,
    /**
     * The style prop specifies styles for your scatter plot. VictoryScatter relies on Radium,
     * so valid Radium style objects should work for this prop. Height, width, and
     * padding should be specified via the height, width, and padding props, as they
     * are used to calculate the alignment of components within chart.
     * @examples {parent: {margin: 50}, data: {fill: "red"}, labels: {padding: 20}}
     */
    style: React.PropTypes.shape({
      parent: React.PropTypes.object,
      data: React.PropTypes.object,
      labels: React.PropTypes.object
    }),
    /**
     * The symbol prop determines which symbol should be drawn to represent data points.
     */
    symbol: React.PropTypes.oneOfType([
      React.PropTypes.oneOf([
        "circle", "diamond", "plus", "square", "star", "triangleDown", "triangleUp"
      ]),
      React.PropTypes.func
    ]),
    /**
     * The width props specifies the width of the chart container element in pixels
     */
    width: PropTypes.nonNegative,
    /**
     * The x prop provides another way to supply data for scatter to plot. This prop can be given
     * as an array of values, and it will be plotted against whatever y prop is provided. If no
     * props are provided for y, the values in x will be plotted as the identity function.
     * @examples [1, 2, 3]
     */
    x: PropTypes.homogeneousArray,
    /**
     * The y prop provides another way to supply data for scatter to plot. This prop can be given
     * as a function of x, or an array of values. If x props are given, they will be used
     * in plotting (x, y) data points. If x props are not provided, a set of x values
     * evenly spaced across the x domain will be calculated, and used for plotting data points.
     * @examples (x) => Math.sin(x), [1, 2, 3]
     */
    y: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.func
    ])
  };

  static defaultProps = {
    height: 300,
    padding: 50,
    samples: 50,
    scale: "linear",
    showLabels: true,
    size: 3,
    standalone: true,
    symbol: "circle",
    width: 450,
    y: (x) => x
  };

  static getDomain = (props, axis) => {
    return Domain.getDomain(props, axis);
  };

  getSymbol(data) {
    if (this.props.bubbleProperty) {
      return "circle";
    }
    return data.symbol || this.props.symbol;
  }

  getSize(data, calculatedProps) {
    const z = this.props.bubbleProperty;
    if (data.size) {
      return typeof data.size === "function" ? data.size : Math.max(data.size, 1);
    } else if (typeof this.props.size === "function") {
      return this.props.size;
    } else if (z && data[z]) {
      return this.getBubbleSize(data, z, calculatedProps);
    } else {
      return Math.max(this.props.size, 1);
    }
  }

  getBubbleSize(datum, z, calculatedProps) {
    const data = calculatedProps.data;
    const getMaxRadius = () => {
      const minPadding = Math.min(...values(Chart.getPadding(this.props)));
      return Math.max(minPadding, 5);
    };
    const zData = data.map((point) => point.z);
    const zMin = Math.min(...zData);
    const zMax = Math.max(...zData);
    const maxRadius = this.props.maxBubbleSize || getMaxRadius();
    const maxArea = Math.PI * Math.pow(maxRadius, 2);
    const area = ((datum[z] - zMin) / (zMax - zMin)) * maxArea;
    const radius = Math.sqrt(area / Math.PI);
    return Math.max(radius, 1);
  }

  renderPoint(data, index, calculatedProps) {
    const position = {
      x: calculatedProps.scale.x.call(this, data.x),
      y: calculatedProps.scale.y.call(this, data.y)
    };
    const pointElement = (
      <Point
        key={`point-${index}`}
        labelComponent={this.props.labelComponent}
        showLabels={this.props.showLabels}
        style={calculatedProps.style}
        x={position.x}
        y={position.y}
        data={data}
        size={this.getSize(data, calculatedProps)}
        symbol={this.getSymbol(data)}
      />
    );

    return pointElement;
  }

  renderData(props, style) {
    const data = Data.getData(props);
    const range = {
      x: Chart.getRange(props, "x"),
      y: Chart.getRange(props, "y")
    };
    const domain = {
      x: Domain.getDomain(props, "x"),
      y: Domain.getDomain(props, "y")
    };
    const scale = {
      x: Scale.getBaseScale(props, "x").domain(domain.x).range(range.x),
      y: Scale.getBaseScale(props, "y").domain(domain.y).range(range.y)
    };

    const calculatedProps = {data, scale, style};
    return data.map((dataPoint, index) => {
      return this.renderPoint(dataPoint, index, calculatedProps);
    });
  }

  render() {
    // If animating, return a `VictoryAnimation` element that will create
    // a new `VictoryScatter` with nearly identical props, except (1) tweened
    // and (2) `animate` set to null so we don't recurse forever.
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const animateData = pick(this.props, [
        "data", "domain", "height", "maxBubbleSize", "padding", "samples", "size",
        "style", "width", "x", "y"
      ]);

      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {(props) => <VictoryScatter {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    }
    const style = Chart.getStyles(this.props, defaultStyles);
    const group = <g style={style.parent}>{this.renderData(this.props, style)}</g>;
    return this.props.standalone ? <svg style={style.parent}>{group}</svg> : group;
  }
}
