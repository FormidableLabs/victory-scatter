import React from "react";
import Radium from "radium";
import take from "lodash/array/take";
import union from "lodash/array/union";
import zip from "lodash/array/zip";
import pluck from "lodash/collection/pluck";
import isArray from "lodash/lang/isArray";
import isFunction from "lodash/lang/isFunction";
import isNumber from "lodash/lang/isNumber";
import isObject from "lodash/lang/isObject";
import merge from "lodash/object/merge";
import pick from "lodash/object/pick";
import values from "lodash/object/values";
import max from "lodash/math/max";
import min from "lodash/math/min";
import range from "lodash/utility/range";
import d3Scale from "d3-scale";
import Point from "./point";
import {PropTypes, Chart, Data, Scale} from "victory-util";
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
     * given as a function, or as an object that specifies separate functions for x and y.
     * @exampes d3Scale.time(), {x: d3Scale.linear(), y:tick d3Scale.log()}
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
    scale: d3Scale.linear(),
    showLabels: true,
    size: 3,
    standalone: true,
    symbol: "circle",
    width: 450,
    y: (x) => x
  };

  getCalculatedValues(props) {
    this.style = this.getStyles(props);
    this.padding = Chart.getPadding(props);
    this.range = {
      x: Chart.getRange(props, "x"),
      y: Chart.getRange(props, "y")
    };
    this.data = Data.getData(props);
    this.domain = {
      x: this.getDomain(props, "x"),
      y: this.getDomain(props, "y")
    };
    this.scale = {
      x: this.getScale(props, "x"),
      y: this.getScale(props, "y")
    };
  }

  getStyles(props) {
    const style = props.style || defaultStyles;
    const {data, labels, parent} = style;
    return {
      parent: merge({height: props.height, width: props.width}, parent),
      labels: merge({}, defaultStyles.labels, labels),
      data: merge({}, defaultStyles.data, data)
    };
  }

  getScale(props, axis) {
    const scale = Scale.getBaseScale(props, axis);
    scale.range(this.range[axis]);
    scale.domain(this.domain[axis]);
    return scale;
  }

  getDomain(props, axis) {
    if (props.domain && props.domain[axis]) {
      return props.domain[axis];
    } else if (props.domain && !isObject(props.domain)) {
      return props.domain;
    } else {
      return [
        min(pluck(this.data, axis)),
        max(pluck(this.data, axis))
      ];
    }
  }

  getSymbol(data) {
    if (this.props.bubbleProperty) {
      return "circle";
    }
    return data.symbol || this.props.symbol;
  }

  getSize(data) {
    const z = this.props.bubbleProperty;
    if (data.size) {
      return isFunction(data.size) ? data.size : max([data.size, 1]);
    } else if (isFunction(this.props.size)) {
      return this.props.size;
    } else if (z && data[z]) {
      return this.getBubbleSize(data, z);
    } else {
      return max([this.props.size, 1]);
    }
  }

  getBubbleSize(datum, z) {
    const data = this.data;
    const zMin = min(pluck(data, z));
    const zMax = max(pluck(data, z));
    const maxRadius = this.props.maxBubbleSize || max([min(values(this.padding)), 5]);
    const maxArea = Math.PI * Math.pow(maxRadius, 2);
    const area = ((datum[z] - zMin) / (zMax - zMin)) * maxArea;
    const radius = Math.sqrt(area / Math.PI);
    return max([radius, 1]);
  }

  renderPoint(data, index) {
    const position = {
      x: this.scale.x.call(this, data.x),
      y: this.scale.y.call(this, data.y)
    };
    const pointElement = (
      <Point
        key={`point-${index}`}
        labelComponent={this.props.labelComponent}
        showLabels={this.props.showLabels}
        style={this.style}
        x={position.x}
        y={position.y}
        data={data}
        size={this.getSize(data)}
        symbol={this.getSymbol(data)}
      />
    );

    return pointElement;
  }

  renderData() {
    return this.data.map((dataPoint, index) => {
      return this.renderPoint(dataPoint, index);
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
    } else {
      this.getCalculatedValues(this.props);
    }
    const style = this.style.parent;
    const group = <g style={style}>{this.renderData()}</g>;
    return this.props.standalone ? <svg style={style}>{group}</svg> : group;
  }
}
