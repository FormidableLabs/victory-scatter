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
