import React from "react";
import Radium from "radium";
import _ from "lodash";
import d3 from "d3";
import {VictoryAnimation} from "victory-animation";

@Radium
class VictoryScatter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { symbolSvgPaths: this.getSymbolPaths() };
  }

  getSymbolPath(symbol) {
    switch (symbol) {
      case "circle":
        return "M-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0";
      case "diamond":
        return "M0,-6.5 l6.5,6.5 l-6.5,6.5 l-6.5,-6.5 l6.5,-6.5";
      case "plus":
        return "M-1.75,-5 l3.3,0 l0,3.3 l3.3,0 l0,3.3 l-3.3,0 l0,3.3 l-3.3,0 l0,-3.3 l-3.3,0 " +
          "l0,-3.3 l3.3,0 l0,-3.3";
      case "star":
        return "M0,3.5 L4.114,5.663 L3.329,1.082 L6.657,-2.163 L2.057,-2.832 L0,-7 " +
          "L-2.057,-2.832 L-6.657,-2.163 L-3.329,1.082 L-4.114,5.663 L0,3.5";
      case "square":
        return "M4.5,-4.5 l0,9 l-9,0 l0,-9 l9,0";
      case "triangleDown":
        return "M5.5,-4.763 l-5.5,9.526 l-5.5,-9.526 l11,0";
      case "triangleUp":
        return "M5.5,4.763 l-5.5,-9.526 l-5.5,9.526 l11,0";
      // no default
    }
  }

  getSymbolPaths() {
    return {
      circle: this.getSymbolPath("circle"),
      diamond: this.getSymbolPath("diamond"),
      plus: this.getSymbolPath("plus"),
      star: this.getSymbolPath("star"),
      square: this.getSymbolPath("square"),
      triangleDown: this.getSymbolPath("triangleDown"),
      triangleUp: this.getSymbolPath("triangleUp")
    };
  }

  getScale(axis) {
    let domain = this.props.domain;
    const isXAxisData = axis === "x";
    const range = isXAxisData ?
      [this.props.maxBubbleRadius, this.props.width - this.props.maxBubbleRadius] :
      [this.props.height - this.props.maxBubbleRadius, this.props.maxBubbleRadius];
    const scale = d3.scale.linear().range(range);

    if (_.isArray(domain)) {
      return scale.domain(isXAxisData ? domain : domain.reverse());
    } else if (domain && domain[axis]) {
      return scale.domain(isXAxisData ? domain[axis] : domain[axis].reverse());
    }

    domain = [_.min(_.pluck(this.props.data, axis)), _.max(_.pluck(this.props.data, axis))];
    return scale.domain(isXAxisData ? domain : domain.reverse());
  }

  getBubbleScale() {
    const maxZ = _.max(_.pluck(this.props.data, "z"));
    const maxRadius = Math.sqrt(maxZ / Math.PI);
    const maxRadiusMultiplier = maxRadius / this.props.maxBubbleRadius;

    return (z) => {
      return Math.sqrt(z / Math.PI) / maxRadiusMultiplier / 5;
    };
  }

  plotDataPoints() {
    const xScale = this.getScale("x");
    const yScale = this.getScale("y");
    let zScale;

    if (this.props.bubble) {
      zScale = this.getBubbleScale();
    }

    const dataPoints = _.map(this.props.data, (dataPoint, index) => {
      if (!this.props.bubble) {
        _.extend(dataPoint, {
          d: this.state.symbolSvgPaths[dataPoint.symbol] || dataPoint.symbol
        });
      }

      return (
        <VictoryAnimation data={dataPoint} key={index}>
          {(data) => {
            return (
              <g
                transform={"translate(" + xScale(data.x) + " " +
                  (this.props.height - yScale(data.y)) + ")"}>
                <path
                  d={data.d || this.state.symbolSvgPaths.circle}
                  fill={data.color || this.props.color}
                  key={index}
                  opacity={data.opacity || this.props.opacity}
                  shapeRendering={data.shapeRendering || this.props.shapeRendering}
                  stroke={data.borderColor || this.props.borderColor}
                  strokeWidth={data.borderWidth || this.props.borderWidth}
                  transform={"scale(" + (zScale && data.z ? zScale(data.z) : data.symbolScale ||
                    this.props.symbolScale) + ")"}/>
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
      <svg height={this.props.height} width={this.props.width}>
        {this.plotDataPoints()}
      </svg>
    );
  }
}

VictoryScatter.propTypes = {
  borderColor: React.PropTypes.string,
  borderWidth: React.PropTypes.number,
  bubble: React.PropTypes.bool,
  color: React.PropTypes.string,
  data: React.PropTypes.arrayOf(React.PropTypes.object),
  domain: React.PropTypes.oneOfType([
    React.PropTypes.arrayOf(React.PropTypes.number),
    React.PropTypes.shape({
      x: React.PropTypes.arrayOf(React.PropTypes.number),
      y: React.PropTypes.arrayOf(React.PropTypes.number)
    }),
    React.PropTypes.shape({
      x: React.PropTypes.arrayOf(React.PropTypes.number)
    }),
    React.PropTypes.shape({
      y: React.PropTypes.arrayOf(React.PropTypes.number)
    })
  ]),
  height: React.PropTypes.number,
  maxBubbleRadius: React.PropTypes.number,
  opacity: React.PropTypes.number,
  symbolScale: React.PropTypes.number,
  shapeRendering: React.PropTypes.oneOf([
    "auto",
    "optimizeSpeed",
    "crispEdges",
    "geometricPrecision",
    "inherit"
  ]),
  width: React.PropTypes.number
};

VictoryScatter.defaultProps = {
  borderColor: "transparent",
  borderWidth: 0,
  bubble: false,
  color: "red",
  data: [{}],
  domain: null,
  height: 600,
  maxBubbleRadius: 0,
  opacity: 0.8,
  symbolScale: 1,
  shapeRendering: "auto",
  width: 1200
};

export default VictoryScatter;
