import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";

@Radium
class VictoryScatter extends React.Component {
  constructor(props) {
    super(props);
    this.colors = d3.scale.ordinal().range(this.props.dotColors);
  }

  drawDots() {
    const dotComponents = _.map(this.props.data, (dot, index) => {
      return (
        <circle
          cx={dot.x}
          cy={this.props.height - dot.y}
          fill={this.colors(dot.z)}
          key={index}
          r={3.5}
          stroke={this.props.borderColor}/>
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
  dotColors: ["pink", "lightblue", "gold"],
  height: 800,
  width: 1200
};

export default VictoryScatter;
