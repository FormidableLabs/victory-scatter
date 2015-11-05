import React from "react";
import Radium from "radium";
import _ from "lodash";
import d3 from "d3";
import {VictoryAnimation} from "victory-animation";
import pathHelpers from "../path-helpers";

const styles = {
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
    textAnchor: "middle"
  }
};

const defaultPadding = 30;

@Radium
export default class VictoryScatter extends React.Component {
  static propTypes = {
    /**
     * The animate prop specifies props for victory-animation to use. It this prop is
     * not given, the scatter plot will not tween between changing data / style props.
     * Large datasets might animate slowly due to the inherent limits of svg rendering.
     * @examples {delay: 5, velocity: 10, onEnd: () => alert("woo!")}
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
     * @exampes [
     *   {x: 1, y: 125, fill: "red", symbol: "triangleUp", label: "foo"},
     *   {x: 10, y: 257, fill: "blue", symbol: "triangleDown", label: "bar"},
     *   {x: 100, y: 345, fill: "green", symbol: "diamond", label: "baz"},
     * ]
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
     * @exampes [-1, 1], {x: [0, 100], y: [0, 1]}
     */
    domain: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.shape({
        x: React.PropTypes.array,
        y: React.PropTypes.array
      })
    ]),
    /**
     * The height props specifies the height of the chart container element in pixels
     */
    height: React.PropTypes.number,
    /**
     * The maxBubbleSize prop sets an upper limit for scaling data points in a bubble chart
     */
    maxBubbleSize: React.PropTypes.number,
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
    samples: React.PropTypes.number,
    /**
     * The scale prop determines which scales your chart should use. This prop can be
     * given as a function, or as an object that specifies separate functions for x and y.
     * @exampes d3.time.scale(), {x: d3.scale.linear(), y:tickd3.scale.log()}
     */
    scale: React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.shape({
        x: React.PropTypes.func,
        y: React.PropTypes.func
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
    size: React.PropTypes.number,
    /**
     * The standalone prop determines whether the component will render a standalone svg
     * or a <g> tag that will be included in an external svg. Set standalone to false to
     * compose VictoryScatter with other components within an enclosing <svg> tag.
     */
    standalone: React.PropTypes.bool,
    /**
     * The style prop specifies styles for your chart. VictoryScatter relies on Radium,
     * so valid Radium style objects should work for this prop, however height, width, and margin
     * are used to calculate range, and need to be expressed as a number of pixels
     * @example {parent: {width: 300, margin: 50}, data: {fill: "red"}, labels: {padding: 20}}
     */
    style: React.PropTypes.object,
    /**
     * The symbol prop determines which symbol should be drawn to represent data points.
     */
    symbol: React.PropTypes.oneOf([
      "circle", "diamond", "plus", "square", "star", "triangleDown", "triangleUp"
    ]),
    /**
     * The width props specifies the width of the chart container element in pixels
     */
    width: React.PropTypes.number,
    /**
     * The x prop provides another way to supply data for scatter to plot. This prop can be given
     * as an array of values, and it will be plotted against whatever y prop is provided. If no
     * props are provided for y, the values in x will be plotted as the identity function (x) => x.
     * @examples [1, 2, 3]
     */
    x: React.PropTypes.array,
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
    padding: 30,
    samples: 50,
    scale: d3.scale.linear(),
    showLabels: true,
    size: 3,
    standalone: true,
    symbol: "circle",
    width: 500,
    y: (x) => x
  };

  componentWillMount() {
    // If animating, the `VictoryScatter` instance wrapped in `VictoryAnimation`
    // will compute these values.
    if (!this.props.animate) {
      this.getCalculatedValues(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.getCalculatedValues(nextProps);
  }

  getCalculatedValues(props) {
    this.style = this.getStyles(props);
    this.padding = this.getPadding(props);
    this.range = {
      x: this.getRange(props, "x"),
      y: this.getRange(props, "y")
    };
    this.domain = {
      x: this.getDomain(props, "x"),
      y: this.getDomain(props, "y")
    };
    this.scale = {
      x: this.getScale(props, "x"),
      y: this.getScale(props, "y")
    };
    this.data = this.getData(props);
  }

  getStyles(props) {
    const {data, labels, parent} = props.style;
    return {
      parent: _.merge({height: props.height, width: props.width}, parent),
      labels: _.merge({}, styles.labels, labels),
      data: _.merge({}, styles.data, data)
    };
  }

  getPadding(props) {
    const padding = _.isNumber(props.padding) ? props.padding : defaultPadding;
    return {
      top: props.padding.top || padding,
      bottom: props.padding.bottom || padding,
      left: props.padding.left || padding,
      right: props.padding.right || padding
    };
  }

  getScale(props, axis) {
    const scale = props.scale[axis] ? props.scale[axis].copy() :
      props.scale.copy();
    const range = this.range[axis];
    const domain = this.domain[axis];
    scale.range(range);
    scale.domain(domain);
    return scale;
  }

  getRange(props, axis) {
    // if the range is not given in props, calculate it from width, height and margin
    return axis === "x" ?
      [this.padding.left, props.width - this.padding.right] :
      [props.height - this.padding.bottom, this.padding.top];
  }

  getDomain(props, axis) {
    if (props.domain) {
      return props.domain[axis] || props.domain;
    } else if (props.data) {
      return [
        _.min(_.pluck(props.data, axis)),
        _.max(_.pluck(props.data, axis))
      ];
    }
    return props.scale[axis] ? props.scale[axis].domain() : props.scale.domain();
  }

  getData(props) {
    if (props.data) {
      return props.data;
    }
    const x = this.returnOrGenerateX(props);
    const y = this.returnOrGenerateY(props, x);
    const n = _.min([x.length, y.length]);
    // create a dataset from x and y with n points
    const dataset = _.zip(_.take(x, n), _.take(y, n));
    // return data as an array of objects
    return _.map(dataset, (point) => {
      return {x: point[0], y: point[1]};
    });
  }

  returnOrGenerateX(props) {
    if (props.x) {
      return props.x;
    }
    // if x is not given in props, create an array of values evenly
    // spaced across the x domain
    const domain = this.domain.x;
    const samples = _.isArray(props.y) ? props.y.length : props.samples;
    const step = _.max(domain) / samples;
    // return an array of x values spaced across the domain,
    // include the maximum of the domain
    return _.union(_.range(_.min(domain), _.max(domain), step), [_.max(domain)]);
  }

  returnOrGenerateY(props, x) {
    if (_.isFunction(props.y)) {
      // if y is a function, apply the function y to to each value of the array x,
      // and return the results as an array
      return _.map(x, (datum) => props.y(datum));
    }
    // y is either a function or an array, and is never undefined
    // if it isn't a function, just return it.
    return props.y;
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
      return _.max([data.size, 1]);
    } else if (z && data[z]) {
      return this.getBubbleSize(data, z);
    } else {
      return _.max([this.props.size, 1]);
    }
  }

  getBubbleSize(datum, z) {
    const data = this.data;
    const zMin = _.min(_.pluck(data, z));
    const zMax = _.max(_.pluck(data, z));
    const maxRadius = this.props.maxBubbleSize || _.max([_.min(_.values(this.padding)), 5]);
    const maxArea = Math.PI * Math.pow(maxRadius, 2);
    const area = ((datum[z] - zMin) / (zMax - zMin)) * maxArea;
    const radius = Math.sqrt(area / Math.PI);
    return _.max([radius, 1]);
  }

  getPathElement(data, index) {
    const pathFunctions = {
      circle: pathHelpers.circle,
      square: pathHelpers.square,
      diamond: pathHelpers.diamond,
      triangleDown: pathHelpers.triangleDown,
      triangleUp: pathHelpers.triangleUp,
      plus: pathHelpers.plus,
      star: pathHelpers.star
    };
    const x = this.scale.x.call(this, data.x);
    const y = this.scale.y.call(this, data.y);
    const size = this.getSize(data);
    const symbol = this.getSymbol(data);
    const path = pathFunctions[symbol].call(this, x, y, size);
    const styleData = _.omit(data, [
        "x", "y", "z", this.props.bubbleProperty, "size", "symbol", "name", "label"
      ]);
    const scatterStyle = _.merge({}, this.style.data, styleData);
    const pathElement = (
      <path
        d={path}
        key={index}
        shapeRendering="optimizeSpeed"
        style={scatterStyle}>
      </path>
    );
    if (data.label && this.props.showLabels) {
      return (
        <g key={"label-" + index}>
          {pathElement}
          <text
            x={x}
            y={y}
            dy={-this.style.labels.padding || size * -1.25}
            style={this.style.labels}>
            {data.label}
          </text>
        </g>
      );
    }
    return pathElement;
  }

  plotDataPoints() {
    const data = this.data;
    return _.map(data, (dataPoint, index) => {
      return this.getPathElement(dataPoint, index);
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
      const animateData = _.omit(this.props, [
        "animate", "scale", "showLabels", "standalone"
      ]);

      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {props => <VictoryScatter {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    }
    const style = this.style.parent;
    const group = <g style={style}>{this.plotDataPoints()}</g>;
    return this.props.standalone ? <svg style={style}>{group}</svg> : group;
  }
}
