import React from "react";
import Radium from "radium";
import _ from "lodash";
import d3 from "d3";
import log from "../log";
import {VictoryAnimation} from "victory-animation";
import pathHelpers from "../path-helpers";

class VScatter extends React.Component {
  constructor(props) {
    super(props);
    this.getCalculatedValues(props);
  }

  componentWillReceiveProps(nextProps) {
    this.getCalculatedValues(nextProps);
  }

  getStyles(props) {
    return _.merge({
      borderColor: "transparent",
      borderWidth: 0,
      color: "#756f6a",
      opacity: 1,
      margin: 20,
      width: 500,
      height: 500,
      fontFamily: "Helvetica",
      fontSize: 10,
      textAnchor: "middle"
    }, props.style);
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
    const scale = props.scale[axis] ? props.scale[axis]().copy() :
      props.scale().copy();
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
    return axis === "x" ?
      [this.style.margin, this.style.width - this.style.margin] :
      [this.style.height - this.style.margin, this.style.margin];
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
    const scaleDomain = props.scale[axis] ? props.scale[axis]().domain() :
      props.scale().domain();

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
    const maxRadius = this.props.maxBubbleSize || _.max([this.style.margin, 5]);
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

  getPathElement(data, style, index) {
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
    const pathElement = (
      <path
        d={path}
        fill={data.color || style.color}
        key={index}
        opacity={data.opacity || style.opacity}
        shapeRendering="optimizeSpeed"
        stroke={data.borderColor || style.borderColor}
        strokeWidth={data.borderWidth || style.borderWidth}>
      </path>
    );
    if (data.label && this.props.showLabels) {
      return (
        <g key={"label-" + index}>
          {pathElement}
          <text
            x={x}
            y={y}
            dy={-this.props.labelPadding || size * -1.25}
            fontFamily={style.fontFamily}
            fontSize={style.fontSize}
            textAnchor={style.textAnchor}>
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
      return this.getPathElement(dataPoint, this.style, index);
    });
  }

  render() {
    if (this.props.containerElement === "svg") {
      return (
        <svg style={this.style}>{this.plotDataPoints()}</svg>
      );
    }
    return (
      <g style={this.style}>{this.plotDataPoints()}</g>
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
        <VictoryAnimation data={this.props}>
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
  data: React.PropTypes.arrayOf(React.PropTypes.object),
  domain: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.shape({
      x: React.PropTypes.array,
      y: React.PropTypes.array
    })
  ]),
  range: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.shape({
      x: React.PropTypes.array,
      y: React.PropTypes.array
    })
  ]),
  scale: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.shape({
      x: React.PropTypes.func,
      y: React.PropTypes.func
    })
  ]),
  animate: React.PropTypes.bool,
  style: React.PropTypes.node,
  size: React.PropTypes.number,
  symbol: React.PropTypes.oneOf([
    "circle", "diamond", "plus", "square", "star", "triangleDown", "triangleUp"
  ]),
  labelPadding: React.PropTypes.number,
  bubbleProperty: React.PropTypes.string,
  maxBubbleSize: React.PropTypes.number,
  showLabels: React.PropTypes.bool,
  containerElement: React.PropTypes.oneOf(["g", "svg"])
};

const defaultProps = {
  animate: false,
  size: 3,
  symbol: "circle",
  scale: () => d3.scale.linear(),
  showLabels: true,
  containerElement: "svg"
};

VictoryScatter.propTypes = propTypes;
VictoryScatter.defaultProps = defaultProps;
VScatter.propTypes = propTypes;
VScatter.defaultProps = defaultProps;

export default VictoryScatter;
