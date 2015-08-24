import React from "react";
import Radium from "radium";
import _ from "lodash";
import d3 from "d3";
import log from "../log";
import {VictoryAnimation} from "victory-animation";

@Radium
class VictoryScatter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scale: {
        x: this.getScale("x"),
        y: this.getScale("y")
      }
    };
  }

  getStyles() {
    return _.merge({
      borderColor: "transparent",
      borderWidth: 0,
      color: "blue",
      opacity: 1,
      margin: 20,
      width: 500,
      height: 200
    }, this.props.style);
  }

  getScale(type) {
    const scale = this.props.scale[type] ? this.props.scale[type]().copy() :
      this.props.scale().copy();
    const range = this.getRange(type);
    const domain = this.getDomain(type);
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
    // if data is given, return the max/min of the data (reversed for y)
    return type === "x" ?
      [_.min(_.pluck(this.props.data, type)), _.max(_.pluck(this.props.data, type))] :
      [_.max(_.pluck(this.props.data, type)), _.min(_.pluck(this.props.data, type))];
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

  getPath(options) {
    const symbol = options.symbol;
    const size = options.size;
    const x = options.x;
    const y = options.y;

    switch (symbol) {
      case "circle":
        return this._circlePath(x, y, size);
      case "square":
        return this._squarePath(x, y, size);
      case "diamond":
        return this._diamondPath(x, y, size);
      case "triangleDown":
        return this._triangleDownPath(x, y, size);
      case "triangleUp":
        return this._triangleUpPath(x, y, size);
      case "plus":
        return this._plusPath(x, y, size);
      case "star":
        return this._starPath(x, y, size);
    }
  }

  _circlePath(x, y, size) {
    return "M " + x + "," + y + " " +
      "m " + -size + ", 0 " +
      "a " + size + "," + size + " 0 1,0 " + (size * 2) + ",0 " +
      "a " + size + "," + size + " 0 1,0 " + (-size * 2) + ",0";
  }

  _squarePath(x, y, size) {
    return "M " + (x - size) + "," + (y + size) + " " +
      "L " + (x + size) + "," + (y + size) +
      "L " + (x + size) + "," + (y - size) +
      "L " + (x - size) + "," + (y - size) +
      "z";
  }

  _diamondPath(x, y, size) {
    const length = Math.sqrt(2 * (size * size));
    return "M " + x + "," + (y + length) + " " +
      "L " + (x + length) + "," + y +
      "L " + x + "," + (y - length) +
      "L " + (x - length) + "," + y +
      "z";
  }

  _triangleDownPath(x, y, size) {
    const height = (size / 2 * Math.sqrt(3));
    return "M " + (x - size) + "," + (y - size) + " " +
      "L " + (x + size) + "," + (y - size) +
      "L " + x + "," + (y + height) +
      "z";
  }

  _triangleUpPath(x, y, size) {
    const height = (size / 2 * Math.sqrt(3));
    return "M " + (x - size) + "," + (y + size) + " " +
      "L " + (x + size) + "," + (y + size) +
      "L " + x + "," + (y - height) +
      "z";
  }

  _plusPath(x, y, size) {
    return "M " + (x - size / 2) + "," + (y + size) + " " +
      "L " + (x + size / 2) + "," + (y + size) +
      "L " + (x + size / 2) + "," + (y + size / 2) +
      "L " + (x + size) + "," + (y + size / 2) +
      "L " + (x + size) + "," + (y - size / 2) +
      "L " + (x + size / 2) + "," + (y - size / 2) +
      "L " + (x + size / 2) + "," + (y - size) +
      "L " + (x - size / 2) + "," + (y - size) +
      "L " + (x - size / 2) + "," + (y - size / 2) +
      "L " + (x - size) + "," + (y - size / 2) +
      "L " + (x - size) + "," + (y + size / 2) +
      "L " + (x - size / 2) + "," + (y + size / 2) +
      "z";
  }

  _starPath(x, y, size) {
    const angle = Math.PI / 5;
    const starCoords = _.map(_.range(10), (index) => {
      const length = index % 2 === 0 ? size : size / 2;
      return "L " + (length * Math.sin(angle * (index + 1)) + x) + ", " +
        (length * Math.cos(angle * (index + 1)) + y);
    });
    const path = starCoords.toString();
    return "M " + (x + size) + "," + (y + size) + " " + path + "z";
  }

  getSize(data) {
    const z = this.props.symbolScaleProperty;
    if (data.size) {
      return data.size;
    } else if (z && data[z]) {
      const zMin = _.min(_.pluck(this.props.data, z));
      const zMax = _.max(_.pluck(this.props.data, z));
      const maxRadius = _.max(5, this.getStyles.margin / 2);
      return ((data[z] - zMin) / (zMax - zMin)) * maxRadius;
    } else {
      return this.props.size;
    }
  }

  plotDataPoints() {
    const xScale = this.getScale("x");
    const yScale = this.getScale("y");

    const dataPoints = _.map(this.props.data, (dataPoint, index) => {
      const style = this.getStyles();
      return (
        <VictoryAnimation data={dataPoint} key={index}>
          {(data) => {
            const x = xScale(data.x);
            const y = yScale(data.y);
            const size = this.getSize(data);
            const symbol = data.symbol || this.props.symbol;
            return (
              <g style={this.getStyles()}>
                <path
                  d={data.path || this.getPath({symbol, size, x, y})}
                  fill={data.color || style.color}
                  key={index}
                  opacity={data.opacity || style.opacity}
                  shapeRendering={data.shapeRendering || this.props.shapeRendering}
                  stroke={data.borderColor || style.borderColor}
                  strokeWidth={data.borderWidth || style.borderWidth}/>
                {data.label ? (
                  <text
                    fontFamily="Helvetica"
                    fontSize={10}
                    textAnchor="middle">
                    {data.label}
                  </text>
                ) : null}
              </g>
            );
          }}
        </VictoryAnimation>
      );
    });

    return (<g>{dataPoints}</g>);
  }

  render() {
    return (
      <g style={this.getStyles()}>
        {this.plotDataPoints()}
      </g>
    );
  }
}

VictoryScatter.propTypes = {
  style: React.PropTypes.node,
  color: React.PropTypes.string,
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
  size: React.PropTypes.number,
  symbol: React.PropTypes.oneOf([
    "circle", "diamond", "plus", "star", "square", "triangleDown", "triangleUp"
  ]),
  path: React.PropTypes.string,
  shapeRendering: React.PropTypes.oneOf([
    "auto",
    "optimizeSpeed",
    "crispEdges",
    "geometricPrecision",
    "inherit"
  ]),
  symbolScaleProperty: React.PropTypes.string
};

VictoryScatter.defaultProps = {
  size: 3,
  symbol: "circle",
  shapeRendering: "auto",
  scale: () => d3.scale.linear()
};

export default VictoryScatter;
