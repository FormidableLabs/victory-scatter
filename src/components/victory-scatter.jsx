import React from "react";
import Radium from "radium";
import _ from "lodash";
import d3 from "d3";
import log from "../log";
import {VictoryAnimation} from "victory-animation";
import pathHelpers from "../path-helpers";

const styles = {
  base: {
    width: 500,
    height: 300,
    margin: 50
  },
  data: {
    fill: "#756f6a",
    opacity: 1,
    stroke: "transparent",
    strokeWidth: 0
  },
  labels: {
    stroke: "none",
    fill: "black",
    fontFamily: "Helvetica",
    fontSize: 10,
    textAnchor: "middle"
  }
};

class VScatter extends React.Component {
  constructor(props) {
    super(props);
    this.getCalculatedValues(props);
  }

  componentWillReceiveProps(nextProps) {
    this.getCalculatedValues(nextProps);
  }

  getStyles(props) {
    if (!props.style) {
      return styles;
    }
    const {data, labels, ...base} = props.style;
    return {
      base: _.merge({}, styles.base, base),
      labels: _.merge({}, styles.labels, labels),
      data: _.merge({}, styles.data, data)
    };
  }

  getCalculatedValues(props) {
    this.style = this.getStyles(props);
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
  }

  getScale(props, axis) {
    const scale = props.scale[axis] ? props.scale[axis].copy() :
      props.scale.copy();
    const range = this.range[axis];
    const domain = this.domain[axis];
    scale.range(range);
    scale.domain(domain);
    // hacky check for identity scale
    if (_.difference(scale.range(), range).length !== 0) {
      // identity scale, reset the domain and range
      scale.range(range);
      scale.domain(range);
      log.warn("Identity Scale: domain and range must be identical. " +
        "Domain has been reset to match range.");
    }
    return scale;
  }

  getRange(props, axis) {
    if (props.range) {
      return props.range[axis] ? props.range[axis] : props.range;
    }
    // if the range is not given in props, calculate it from width, height and margin
    const style = this.style.base;
    return axis === "x" ?
      [style.margin, style.width - style.margin] :
      [style.height - style.margin, style.margin];
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
    return this._getDomainFromScale(props, axis);
  }

  // helper method for getDomain
  _getDomainFromScale(props, axis) {
    // The scale will never be undefined due to default props
    const scaleDomain = props.scale[axis] ? props.scale[axis].domain() :
      props.scale.domain();

    // Warn when particular types of scales need more information to produce meaningful lines
    if (_.isDate(scaleDomain[0])) {
      log.warn("please specify a domain or data when using time scales");
    } else if (scaleDomain.length === 0) {
      log.warn("please specify a domain or data when using ordinal or quantile scales");
    } else if (scaleDomain.length === 1) {
      log.warn("please specify a domain or data when using a threshold scale");
    }
    return scaleDomain;
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
    const data = this.props.data;
    const zMin = _.min(_.pluck(data, z));
    const zMax = _.max(_.pluck(data, z));
    const maxRadius = this.props.maxBubbleSize || _.max([this.style.base.margin, 5]);
    const maxArea = Math.PI * Math.pow(maxRadius, 2);
    const area = ((datum[z] - zMin) / (zMax - zMin)) * maxArea;
    const radius = Math.sqrt(area / Math.PI);
    return _.max([radius, 1]);
  }

  getMockData() {
    const samples = 20;
    const domain = {
      x: this.domain.x,
      y: this.domain.y
    };
    return _.map(_.range(samples), (index) => {
      return {
        x: (_.max(domain.x) - _.min(domain.x)) / samples * (index + 1),
        y: (_.max(domain.y) - _.min(domain.y)) / samples * (index + 1)
      };
    });
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
    const scatterStyle = _.merge({}, this.style.data, data);
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
    const data = this.props.data || this.getMockData();
    return _.map(data, (dataPoint, index) => {
      return this.getPathElement(dataPoint, index);
    });
  }

  render() {
    if (this.props.containerElement === "svg") {
      return (
        <svg style={this.style.base}>{this.plotDataPoints()}</svg>
      );
    }
    return (
      <g style={this.style.base}>{this.plotDataPoints()}</g>
    );
  }
}

@Radium
class VictoryScatter extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.animate) {
      return (
        <VictoryAnimation {...this.props.animate} data={this.props}>
          {(props) => {
            return (
              <VScatter
                {...props}
                animate={this.props.animate}
                scale={this.props.scale}
                showLabels={this.props.showLabels}
                containerElement={this.props.containerElement}/>
            );
          }}
        </VictoryAnimation>
      );
    }
    return (<VScatter {...this.props}/>);
  }
}

const propTypes = {
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
   * The range prop describes the range of pixels your chart will cover. This prop can be
   * given as a array of the minimum and maximum expected values for your chart,
   * or as an object that specifies separate arrays for x and y.
   * If this prop is not provided, a range will be calculated based on the height,
   * width, and margin provided in the style prop, or in default styles. It is usually
   * a good idea to let the chart component calculate its own range.
   * @exampes [0, 500], {x: [0, 500], y: [500, 300]}
   */
  range: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.shape({
      x: React.PropTypes.array,
      y: React.PropTypes.array
    })
  ]),
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
   * The animate prop specifies props for victory-animation to use. It this prop is
   * not given, the scatter plot will not tween between changing data / style props.
   * Large datasets might animate slowly due to the inherent limits of svg rendering.
   * @examples {delay: 5, velocity: 10, onEnd: () => alert("woo!")}
   */
  animate: React.PropTypes.object,
  /**
   * The style prop specifies styles for your chart. VictoryScatter relies on Radium,
   * so valid Radium style objects should work for this prop, however height, width, and margin
   * are used to calculate range, and need to be expressed as a number of pixels
   * @example {width: 300, margin: 50, data: {fill: "red", opacity, 0.8}, labels: {padding: 20}}
   */
  style: React.PropTypes.object,
  /**
   * The size prop determines how to scale each data point
   */
  size: React.PropTypes.number,
  /**
   * The symbol prop determines which symbol should be drawn to represent data points.
   */
  symbol: React.PropTypes.oneOf([
    "circle", "diamond", "plus", "square", "star", "triangleDown", "triangleUp"
  ]),
  /**
   * The bubbleProperty prop indicates which property of the data object should be used
   * to scale data points in a bubble chart
   */
  bubbleProperty: React.PropTypes.string,
  /**
   * The maxBubbleSize prop sets an upper limit for scaling data points in a bubble chart
   */
  maxBubbleSize: React.PropTypes.number,
  /**
   * The showLabels prop determines whether to show any labels associated with a data point.
   * Large datasets might animate slowly due to the inherent limits of svg rendering.
   * If animations are running slowly, try setting this prop to false to cut down on
   * the number of svg nodes
   */
  showLabels: React.PropTypes.bool,
  /**
   * The containerElement prop specifies which element the compnent will render.
   * For standalone scatter plots, the containerElement prop should be "svg". If you need to
   * compose scatter with other chart components, the containerElement prop should
   * be "g", and will need to be rendered within an svg tag.
   */
  containerElement: React.PropTypes.oneOf(["g", "svg"])
};

const defaultProps = {
  size: 3,
  symbol: "circle",
  scale: d3.scale.linear(),
  showLabels: true,
  containerElement: "svg"
};

VictoryScatter.propTypes = propTypes;
VictoryScatter.defaultProps = defaultProps;
VScatter.propTypes = propTypes;
VScatter.defaultProps = defaultProps;

export default VictoryScatter;
