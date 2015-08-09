import React from "react";
import Radium from "radium";
import _ from "lodash";
import {VictoryAnimation} from "victory-animation";

@Radium
class VictoryScatter extends React.Component {
  constructor(props) {
    super(props);
    this.symbolPaths = {
      circle: "M0,5 m-5,-5 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0",
      diamond: "M5,0 l7,7 l-7,7 l-7,-7 z",
      plus: "M3,0 l4,0 l0,4 l4,0 l0,4 l-4,0 l0,4 l-4,0 l0,-4 l-4,0 l0,-4 l4,0 z",
      star: "M0,3.5 L4.114,5.663 L3.329,1.082 L6.657,-2.163 L2.057,-2.832 L0,-7 L-2.057,-2.832" +
        "L-6.657,-2.163 L-3.329,1.082 L-4.114,5.663 Z",
      square: "M0,0 l0,9 l-9,0 l0,-9 z",
      triangleDown: "M0,0 l-5.5,9.526 l-5.5,-9.526 z",
      triangleUp: "M0,9.526 l-5.5,-9.526 l-5.5,9.526 z"
    };
  }

  drawDataPoints() {
    const dataPointComponents = _.map(this.props.data, (dataPoint, index) => {
      return (
        <VictoryAnimation data={dataPoint} key={index}>
          {(data) => {
            return (
              <path
                d={this.symbolPaths[data.symbol] || data.symbol || this.symbolPaths.circle}
                fill={data.color || this.props.color}
                key={index}
                opacity={data.opacity || this.props.opacity}
                shapeRendering={data.shapeRendering || this.props.shapeRendering}
                stroke={data.borderColor || this.props.borderColor}
                strokeWidth={data.borderWidth || this.props.borderWidth}
                transform={"translate(" + data.x + "," + (this.props.height - data.y) + ") " +
                  "scale(" + (data.scale || this.props.scale) + ")"}/>
            );
          }}
        </VictoryAnimation>
      );
    });

    return (<g>{dataPointComponents}</g>);
  }

  render() {
    return (
      <svg height={this.props.height} width={this.props.width}>
        {this.drawDataPoints()}
      </svg>
    );
  }
}

VictoryScatter.propTypes = {
  borderColor: React.PropTypes.string,
  borderWidth: React.PropTypes.number,
  color: React.PropTypes.string,
  data: React.PropTypes.arrayOf(React.PropTypes.object),
  height: React.PropTypes.number,
  opacity: React.PropTypes.number,
  scale: React.PropTypes.number,
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
  height: 600,
  opacity: 1,
  scale: 1,
  shapeRendering: "auto",
  width: 1200
};

export default VictoryScatter;
