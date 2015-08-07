import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";
import {VictoryAnimation} from "victory-animation";

@Radium
class VictoryScatter extends React.Component {
  constructor(props) {
    super(props);
    this.colors = d3.scale.ordinal().range(this.props.dotColors);
    this.symbols = d3.scale.ordinal().range([
      "M0,5 m-5,-5 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0", // circle
      "M 0.000 3.500 L 4.114 5.663 L 3.329 1.082 L 6.657 -2.163 L 2.057 -2.832 L 0.000 -7.000" +
        "L -2.057 -2.832 L -6.657 -2.163 L -3.329 1.082 L -4.114 5.663 L 0.000 3.500", // star
      "M0,0 l0,9 l-9,0 l0,-9 z", // square
      "M0,9.526 l-5.5,-9.526 l-5.5,9.526 z", // up triangle
      "M0,0 l-5.5,9.526 l-5.5,-9.526 z", // down triangle
      "M5,0 l7,7 l-7,7 l-7,-7 z", // diamond
      "M3,0 l4,0 l0,4 l4,0 l0,4 l-4,0 l0,4 l-4,0 l0,-4 l-4,0 l0,-4 l4,0 z" // plus
    ]);
  }

  drawDots() {
    const dotComponents = _.map(this.props.data, (dot, index) => {
      return (
        <VictoryAnimation data={dot} key={index}>
          {(data) => {
            return (
              <path
                d={this.symbols(data.z)}
                transform={"translate(" + data.x + "," + (this.props.height - data.y) +
                  ") scale(" + this.props.symbolScale + ")"}
                fill={this.colors(data.z)}
                key={index}
                stroke={this.props.stroke}
                strokeWidth="1px"
                opacity={this.props.opacity}
                shapeRendering="geometricPrecision"/>
            );
          }}
        </VictoryAnimation>
      );
    });

    return (<g>{dotComponents}</g>);
  }

  render() {
    return (
      <svg
        height={this.props.height}
        width={this.props.width}>
        {this.drawDots()}
      </svg>
    );
  }
}

VictoryScatter.propTypes = {
  borderColor: React.PropTypes.string,
  data: React.PropTypes.arrayOf(React.PropTypes.shape({
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    z: React.PropTypes.string
  })),
  dotColors: React.PropTypes.arrayOf(React.PropTypes.string),
  height: React.PropTypes.number,
  opacity: React.PropTypes.number,
  stroke: React.PropTypes.string,
  symbolScale: React.PropTypes.number,
  width: React.PropTypes.number
};

VictoryScatter.defaultProps = {
  borderColor: "black",
  data: [
    { x: 20, y: 20, z: "sampleSeriesOne" },
    { x: 30, y: 30, z: "sampleSeriesOne" },
    { x: 100, y: 100, z: "sampleSeriesTwo" },
    { x: 110, y: 110, z: "sampleSeriesTwo" },
    { x: 200, y: 200, z: "sampleSeriesThree" },
    { x: 210, y: 210, z: "sampleSeriesThree" }
  ],
  dotColors: ["pink", "lightblue", "gold", "orange", "lightgreen", "lavender", "tan"],
  height: 800,
  opacity: 1,
  stroke: "none",
  symbolScale: 1,
  width: 1200
};

export default VictoryScatter;
