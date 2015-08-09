import React from "react";
import Radium from "radium";
import _ from "lodash";
import {VictoryAnimation} from "victory-animation";

@Radium
class VictoryScatter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: this.props.data };
    this.symbolSvgPaths = {
      circle: "M-5,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0",
      diamond: "M0,-6.5 l6.5,6.5 l-6.5,6.5 l-6.5,-6.5 z",
      plus: "M-1.75,-5 l3.3,0 l0,3.3 l3.3,0 l0,3.3 l-3.3,0 l0,3.3 l-3.3,0 l0,-3.3 l-3.3,0" +
        "l0,-3.3 l3.3,0 z",
      star: "M0,3.5 L4.114,5.663 L3.329,1.082 L6.657,-2.163 L2.057,-2.832 L0,-7 L-2.057,-2.832" +
        "L-6.657,-2.163 L-3.329,1.082 L-4.114,5.663 Z",
      square: "M4.5,-4.5 l0,9 l-9,0 l0,-9 z",
      triangleDown: "M5.5,-4.763 l-5.5,9.526 l-5.5,-9.526 z",
      triangleUp: "M5.5,4.763 l-5.5,-9.526 l-5.5,9.526 z"
    };
  }

  componentWillMount() {
    if (this.props.scaleToFit) {
      this.scaleDataToFitChart(this.props.data);
    }
  }

  componentWillReceiveProps() {
    if (this.props.scaleToFit) {
      this.scaleDataToFitChart(this.props.data);
    } else {
      this.setState({ data: this.props.data });
    }
  }

  scaleDataToFitChart(data) {
    const xMax = _.max(_.pluck(data, "x"));
    const yMax = _.max(_.pluck(data, "y"));

    const xMultiplier = _.floor(this.props.width / xMax, 1);
    const yMultiplier = _.floor(this.props.height / yMax, 1);
    const minMultiplier = _.min([xMultiplier, yMultiplier]);

    const scaledData = _.cloneDeep(data);
    _.forEach(scaledData, (dataPoint) => {
      dataPoint.x *= minMultiplier;
      dataPoint.y *= minMultiplier;
    });

    this.setState({ data: scaledData });
  }

  plotDataPoints() {
    const dataPointComponents = _.map(this.state.data, (dataPoint, index) => {
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
  height: React.PropTypes.number,
  opacity: React.PropTypes.number,
  scale: React.PropTypes.number,
  scaleToFit: React.PropTypes.bool,
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
  scaleToFit: true,
  shapeRendering: "auto",
  width: 1200
};

export default VictoryScatter;
