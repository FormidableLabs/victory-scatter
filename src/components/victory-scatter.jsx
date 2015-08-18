import React from "react";
import Radium from "radium";
import _ from "lodash";
import d3 from "d3";
import {VictoryAnimation} from "victory-animation";

@Radium
class VictoryScatter extends React.Component {
  constructor(props) {
    super(props);
    this.symbolSvgPaths = {
      circle: "M-5,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0",
      diamond: "M0,-6.5 l6.5,6.5 l-6.5,6.5 l-6.5,-6.5 z",
      plus: "M-1.75,-5 l3.3,0 l0,3.3 l3.3,0 l0,3.3 l-3.3,0 l0,3.3 l-3.3,0 l0,-3.3 l-3.3,0 " +
        "l0,-3.3 l3.3,0 z",
      star: "M0,3.5 L4.114,5.663 L3.329,1.082 L6.657,-2.163 L2.057,-2.832 L0,-7 L-2.057,-2.832 " +
        "L-6.657,-2.163 L-3.329,1.082 L-4.114,5.663 Z",
      square: "M4.5,-4.5 l0,9 l-9,0 l0,-9 z",
      triangleDown: "M5.5,-4.763 l-5.5,9.526 l-5.5,-9.526 z",
      triangleUp: "M5.5,4.763 l-5.5,-9.526 l-5.5,9.526 z"
    };
  }

  getScale(axis) {
    const isXAxisData = axis === "x";
    const range = isXAxisData ? [0, this.props.width] : [this.props.height, 0];
    const scale = d3.scale.linear().range(range);
    let domain;

    if (_.isArray(this.props.domain)) {
      domain = isXAxisData ? this.props.domain : this.props.domain.reverse();
    } else if (this.props.domain && this.props.domain[axis]) {
      domain = isXAxisData ? this.props.domain[axis] : this.props.domain[axis].reverse();
    } else {
      domain = [_.min(_.pluck(this.props.data, axis)), _.max(_.pluck(this.props.data, axis))];
    }

    return scale.domain(domain);
  }

  plotDataPoints() {
    const xScale = this.getScale("x");
    const yScale = this.getScale("y");

    const dataPoints = _.map(this.props.data, (dataPoint, index) => {
      return (
        <VictoryAnimation data={dataPoint} key={index}>
          {(data) => {
            return (
              <path
                d={this.symbolSvgPaths[data.symbol] || data.symbol || this.symbolSvgPaths.circle}
                fill={data.color || this.props.color}
                key={index}
                opacity={data.opacity || this.props.opacity}
                shapeRendering={data.shapeRendering || this.props.shapeRendering}
                stroke={data.borderColor || this.props.borderColor}
                strokeWidth={data.borderWidth || this.props.borderWidth}
                transform={"translate(" + xScale(data.x) + "," +
                  (this.props.height - yScale(data.y)) + ") " +
                  "scale(" + (data.symbolScale || this.props.symbolScale) + ")"}/>
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
  borderWidth: 1,
  color: "red",
  data: [{}],
  domain: null,
  height: 600,
  opacity: 1,
  symbolScale: 1,
  shapeRendering: "auto",
  width: 1200
};

export default VictoryScatter;
