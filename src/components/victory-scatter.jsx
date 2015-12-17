import React, { PropTypes } from "react";
import Radium from "radium";
import _ from "lodash";
import d3Scale from "d3-scale";
import Point from "./point";
import Util from "victory-util";
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
    animate: PropTypes.object,
    /**
     * The bubbleProperty prop indicates which property of the data object should be used
     * to scale data points in a bubble chart
     */
    bubbleProperty: PropTypes.string,
    /**
     * The data prop specifies the data to be plotted. Data should be in the form of an array
     * of data points where each data point should be an object with x and y properties.
     * Other properties may be added to the data point object, such as fill, size, and symbol.
     * These properties will be interpreted and applied to the individual lines
     * @examples [{x: 1, y: 2, fill: "red"}, {x: 2, y: 3, label: "foo"}]
     */
    data: PropTypes.arrayOf(
      PropTypes.shape({
        x: PropTypes.any,
        y: PropTypes.any
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
    domain: PropTypes.oneOfType([
      Util.PropTypes.domain,
      PropTypes.shape({
        x: Util.PropTypes.domain,
        y: Util.PropTypes.domain
      })
    ]),
    /**
     * The height props specifies the height of the chart container element in pixels
     */
    height: Util.PropTypes.nonNegative,
    /**
     * The labelComponent prop takes in an entire, HTML-complete label component
     * which will be used to create labels for scatter to use
     */
    labelComponent: PropTypes.element,
    /**
     * The maxBubbleSize prop sets an upper limit for scaling data points in a bubble chart
     */
    maxBubbleSize: Util.PropTypes.nonNegative,
    /**
     * The padding props specifies the amount of padding in number of pixels between
     * the edge of the chart and any rendered child components. This prop can be given
     * as a number or as an object with padding specified for top, bottom, left
     * and right.
     */
    padding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        top: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
        right: PropTypes.number
      })
    ]),
    /**
     * The samples prop specifies how many individual points to plot when plotting
     * y as a function of x. Samples is ignored if x props are provided instead.
     */
    samples: Util.PropTypes.nonNegative,
    /**
     * The scale prop determines which scales your chart should use. This prop can be
     * given as a function, or as an object that specifies separate functions for x and y.
     * @exampes d3Scale.time(), {x: d3Scale.linear(), y:tick d3Scale.log()}
     */
    scale: PropTypes.oneOfType([
      Util.PropTypes.scale,
      PropTypes.shape({
        x: Util.PropTypes.scale,
        y: Util.PropTypes.scale
      })
    ]),
    /**
     * The showLabels prop determines whether to show any labels associated with a data point.
     * Large datasets might animate slowly due to the inherent limits of svg rendering.
     * If animations are running slowly, try setting this prop to false to cut down on
     * the number of svg nodes
     */
    showLabels: PropTypes.bool,
    /**
     * The size prop determines how to scale each data point
     */
    size: PropTypes.oneOfType([
      Util.PropTypes.nonNegative,
      PropTypes.func
    ]),
    /**
     * The standalone prop determines whether the component will render a standalone svg
     * or a <g> tag that will be included in an external svg. Set standalone to false to
     * compose VictoryScatter with other components within an enclosing <svg> tag.
     */
    standalone: PropTypes.bool,
    /**
     * The style prop specifies styles for your scatter plot. VictoryScatter relies on Radium,
     * so valid Radium style objects should work for this prop. Height, width, and
     * padding should be specified via the height, width, and padding props, as they
     * are used to calculate the alignment of components within chart.
     * @examples {parent: {margin: 50}, data: {fill: "red"}, labels: {padding: 20}}
     */
    style: PropTypes.shape({
      parent: PropTypes.object,
      data: PropTypes.object,
      labels: PropTypes.object
    }),
    /**
     * The symbol prop determines which symbol should be drawn to represent data points.
     */
    symbol: PropTypes.oneOfType([
      PropTypes.oneOf([
        "circle", "diamond", "plus", "square", "star", "triangleDown", "triangleUp"
      ]),
      PropTypes.func
    ]),
    /**
     * The width props specifies the width of the chart container element in pixels
     */
    width: Util.PropTypes.nonNegative,
    /**
     * The x prop provides another way to supply data for scatter to plot. This prop can be given
     * as an array of values, and it will be plotted against whatever y prop is provided. If no
     * props are provided for y, the values in x will be plotted as the identity function.
     * @examples [1, 2, 3]
     */
    x: Util.PropTypes.homogeneousArray,
    /**
     * The y prop provides another way to supply data for scatter to plot. This prop can be given
     * as a function of x, or an array of values. If x props are given, they will be used
     * in plotting (x, y) data points. If x props are not provided, a set of x values
     * evenly spaced across the x domain will be calculated, and used for plotting data points.
     * @examples (x) => Math.sin(x), [1, 2, 3]
     */
    y: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.func
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
    this.padding = this.getPadding(props);
    this.range = {
      x: this.getRange(props, "x"),
      y: this.getRange(props, "y")
    };
    this.data = this.getData(props);
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
      parent: _.merge({height: props.height, width: props.width}, parent),
      labels: _.merge({}, defaultStyles.labels, labels),
      data: _.merge({}, defaultStyles.data, data)
    };
  }

  getPadding(props) {
    const padding = _.isNumber(props.padding) ? props.padding : 0;
    const paddingObj = _.isObject(props.padding) ? props.padding : {};
    return {
      top: paddingObj.top || padding,
      bottom: paddingObj.bottom || padding,
      left: paddingObj.left || padding,
      right: paddingObj.right || padding
    };
  }

  getScale(props, axis) {
    let scale;
    if (props.scale && props.scale[axis]) {
      scale = props.scale[axis].copy();
    } else if (props.scale && !_.isObject(props.scale)) {
      scale = props.scale.copy();
    } else {
      scale = d3Scale.linear().copy();
    }
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
    if (props.domain && props.domain[axis]) {
      return props.domain[axis];
    } else if (props.domain && !_.isObject(props.domain)) {
      return props.domain;
    } else {
      return [
        _.min(_.pluck(this.data, axis)),
        _.max(_.pluck(this.data, axis))
      ];
    }
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
    const domainFromProps = props.domain && props.domain.x || props.domain;
    const domainFromScale = props.scale && props.scale.x ?
      props.scale.x.domain() : props.scale.domain();
    const domain = domainFromProps || domainFromScale;

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
      return _.isFunction(data.size) ? data.size : _.max([data.size, 1]);
    } else if (_.isFunction(this.props.size)) {
      return this.props.size;
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
    return _.map(this.data, (dataPoint, index) => {
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
      const animateData = _.pick(this.props, [
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
