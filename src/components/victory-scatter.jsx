import React from "react";
import Radium from "radium";
import _ from "lodash";
import d3 from "d3";
import log from "../log";
import {VictoryAnimation} from "victory-animation";
import pathHelpers from "../path-helpers";

@Radium
class VictoryScatter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.domain = {
      x: this.getDomain("x"),
      y: this.getDomain("y")
    };
    this.state.range = {
      x: this.getRange("x"),
      y: this.getRange("y")
    };
    this.state.scale = {
      x: this.getScale("x"),
      y: this.getScale("y")
    };
  }

  getStyles() {
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
    }, this.props.style);
  }

  getScale(type) {
    const scale = this.props.scale[type] ? this.props.scale[type]().copy() :
      this.props.scale().copy();
    const range = this.state.range[type];
    const domain = this.state.domain[type];
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

  getRange(type) {
    if (this.props.range) {
      return this.props.range[type] ? this.props.range[type] : this.props.range;
    }
    // if the range is not given in props, calculate it from width, height and margin
    const style = this.getStyles();
    return type === "x" ?
      [style.margin, style.width - style.margin] :
      [style.height - style.margin, style.margin];
  }

  getDomain(type) {
    if (this.props.domain) {
      return this._getDomainFromProps(type);
    } else if (this.props.data) {
      return this._getDomainFromData(type);
    } else {
      return this._getDomainFromScale(type);
    }
  }

  // helper method for getDomain
  _getDomainFromProps(type) {
    if (this.props.domain[type]) {
      // if the domain for this type is given, return it
      return this.props.domain[type];
    }
    // if the domain is given without the type specified, return the domain (reversed for y)
    return type === "x" ? this.props.domain : this.props.domain.concat().reverse();
  }

  // helper method for getDomain
  _getDomainFromData(type) {
    const data = this.props.data;
    // if data is given, return the max/min of the data (reversed for y)
    return type === "x" ?
      [_.min(_.pluck(data, type)), _.max(_.pluck(data, type))] :
      [_.max(_.pluck(data, type)), _.min(_.pluck(data, type))];
  }

  // helper method for getDomain
  _getDomainFromScale(type) {
    // The scale will never be undefined due to default props
    const scaleDomain = this.props.scale[type] ? this.props.scale[type]().domain() :
      this.props.scale().domain();

    // Warn when particular types of scales need more information to produce meaningful lines
    if (_.isDate(scaleDomain[0])) {
      log.warn("please specify a domain or data when using time scales");
    } else if (scaleDomain.length === 0) {
      log.warn("please specify a domain or data when using ordinal or quantile scales");
    } else if (scaleDomain.length === 1) {
      log.warn("please specify a domain or data when using a threshold scale");
    }
    // return the default domain for the scale (reversed for y)
    return type === "x" ? scaleDomain : scaleDomain.reverse();
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
    const style = this.getStyles();
    const zMin = _.min(_.pluck(data, z));
    const zMax = _.max(_.pluck(data, z));
    const maxRadius = this.props.maxBubbleSize || _.max([style.margin, 5]);
    const maxArea = Math.PI * Math.pow(maxRadius, 2);
    const area = ((datum[z] - zMin) / (zMax - zMin)) * maxArea;
    const radius = Math.sqrt(area / Math.PI);
    return _.max([radius, 1]);
  }

  getMockData() {
    const samples = 20;
    const domain = this.state.domain;
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
    const x = this.state.scale.x.call(this, data.x);
    // svg coordinates start from the top left instead of the bottom left
    const y = style.height - this.state.scale.y.call(this, data.y);
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
        <g>
          {pathElement}
          <text
            x={x}
            y={y}
            dy={-this.props.labelPadding || size * -1.25}
            key={"label-" + index}
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
      const style = this.getStyles();
      if (this.props.animate) {
        return (
          <VictoryAnimation data={dataPoint} key={index}>
            {(datum) => {
              return this.getPathElement(datum, style, index);
            }}
          </VictoryAnimation>
        );
      } else {
        return this.getPathElement(dataPoint, style, index);
      }
    });
  }

  render() {
    if (this.props.containerElement === "svg") {
      return (
        <svg style={this.getStyles()}>{this.plotDataPoints()}</svg>
      );
    }
    return (
      <g style={this.getStyles()}>{this.plotDataPoints()}</g>
    );
  }
}

VictoryScatter.propTypes = {
  data: React.PropTypes.arrayOf(React.PropTypes.object),
  domain: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.objectOf(
      React.PropTypes.shape({
        x: React.PropTypes.array,
        y: React.PropTypes.array
      })
    )
  ]),
  range: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.objectOf(
      React.PropTypes.shape({
        x: React.PropTypes.array,
        y: React.PropTypes.array
      })
    )
  ]),
  scale: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.objectOf(
      React.PropTypes.shape({
        x: React.PropTypes.func,
        y: React.PropTypes.func
      })
    )
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

VictoryScatter.defaultProps = {
  animate: false,
  size: 3,
  symbol: "circle",
  scale: () => d3.scale.linear(),
  showLabels: true,
  containerElement: "svg"
};

export default VictoryScatter;
