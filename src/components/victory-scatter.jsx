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

  componentWillReceiveProps(nextProps) {
    if (nextProps.symbolScale !== this.props.symbolScale) {
      this.setState({ symbolSvgPaths: this.getSymbolPaths() });
    }
  }

  getSymbolPath(symbol, symbolScale) {
    const s = symbolScale || this.props.symbolScale;

    switch (symbol) {
      case "circle":
        return "M" + (-5 * s) + ",0a" + (5 * s) + "," + (5 * s) + " 0 1,0 " + (10 * s) +
          ",0a" + (5 * s) + "," + (5 * s) + " 0 1,0 " + (-10 * s) + ",0";
      case "diamond":
        return "M0," + (-6.5 * s) + " l" + (6.5 * s) + "," + (6.5 * s) + " l" + (-6.5 * s) +
          "," + (6.5 * s) + " l" + (-6.5 * s) + "," + (-6.5 * s) + " z";
      case "plus":
        return "M" + (-1.75 * s) + "," + (-5 * s) + " l" + (3.3 * s) + ",0 l0," + (3.3 * s) +
          " l" + (3.3 * s) + ",0 l0," + (3.3 * s) + " l" + (-3.3 * s) + ",0 l0," + (3.3 * s) +
          " l" + (-3.3 * s) + ",0 l0," + (-3.3 * s) + " l" + (-3.3 * s) + ",0 " + "l0," +
          (-3.3 * s) + " l" + (3.3 * s) + ",0 z";
      case "star":
        return "M0," + (3.5 * s) + " L" + (4.114 * s) + "," + (5.663 * s) + " L" +
          (3.329 * s) + "," + (1.082 * s) + " L" + (6.657 * s) + "," + (-2.163 * s) + " L" +
          (2.057 * s) + "," + (-2.832 * s) + " L0," + (-7 * s) + " L" + (-2.057 * s) + "," +
          (-2.832 * s) + " " + "L" + (-6.657 * s) + "," + (-2.163 * s) + " L" + (-3.329 * s) + "," +
          (1.082 * s) + " L" + (-4.114 * s) + "," + (5.663 * s) + " Z";
      case "square":
        return "M" + (4.5 * s) + "," + (-4.5 * s) + " l0," + (9 * s) + " l" + (-9 * s) +
          ",0 l0," + (-9 * s) + " z";
      case "triangleDown":
        return "M" + (5.5 * s) + "," + (-4.763 * s) + " l" + (-5.5 * s) + "," + (9.526 * s) +
          " l" + (-5.5 * s) + "," + (-9.526 * s) + " z";
      case "triangleUp":
        return "M" + (5.5 * s) + "," + (4.763 * s) + " l" + (-5.5 * s) + "," + (-9.526 * s) +
          " l" + (-5.5 * s) + "," + (9.526 * s) + " z";
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
    const domain = this.props.domain;
    const isXAxisData = axis === "x";
    const range = isXAxisData ? [0, this.props.width] : [this.props.height, 0];
    const scale = d3.scale.linear().range(range);

    if (_.isArray(domain)) {
      return scale.domain(isXAxisData ? domain : domain.reverse());
    } else if (domain && domain[axis]) {
      return scale.domain(isXAxisData ? domain[axis] : domain[axis].reverse());
    }
    return scale.domain([_.min(_.pluck(this.props.data, axis)),
      _.max(_.pluck(this.props.data, axis))]);
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
                d={data.symbolScale ? this.getSymbolPath(data.symbol, data.symbolScale) :
                  this.state.symbolSvgPaths[data.symbol] || data.symbol ||
                  this.state.symbolSvgPaths.circle}
                fill={data.color || this.props.color}
                key={index}
                opacity={data.opacity || this.props.opacity}
                shapeRendering={data.shapeRendering || this.props.shapeRendering}
                stroke={data.borderColor || this.props.borderColor}
                strokeWidth={data.borderWidth || this.props.borderWidth}
                transform={"translate(" + xScale(data.x) + " " +
                  (this.props.height - yScale(data.y)) + ")"}/>
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
