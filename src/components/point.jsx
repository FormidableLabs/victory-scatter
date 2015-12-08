import React, { PropTypes } from "react";
import Radium from "radium";
import d3 from "d3";
import pathHelpers from "../path-helpers";



@Radium
export default class Point extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      x: React.PropTypes.any,
      y: React.PropTypes.any
    }),
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    symbol: React.PropTypes.string,
    size: React.PropTypes.number,
    showLabels:
    style: PropTypes.shape({
      data: React.PropTypes.object,
      labels: React.PropTypes.object
    })
  };

  getPath(props) {
    const pathFunctions = {
      circle: pathHelpers.circle,
      square: pathHelpers.square,
      diamond: pathHelpers.diamond,
      triangleDown: pathHelpers.triangleDown,
      triangleUp: pathHelpers.triangleUp,
      plus: pathHelpers.plus,
      star: pathHelpers.star
    };
    return pathFunctions[props.symbol].call(this, props.x, props.y, props.size);
  }

  if (data.label && this.props.showLabels) {
    return (
      <g key={`data-label-${index}`}>
        {pointElement}
        {this.renderLabel(position, data, index)}
      </g>
    );
  }

  getDataStyle(props) {
    // TODO functional styles
    return props.style.data;
  }

  renderPoint(props) {
    return (
      <path
        style={this.getStyle(props)}
        d={this.getPath(props)}
        shapeRendering="optimizeSpeed"
      />
    );
  }

  getLabelStyle(props) {
    // match labels styles to data style by default (fill, opacity, others?)
    const dataStyle = _.pick(props.style.data, ["opacity", "fill"])
    const padding = this.style.labels.padding || this.props.size * 0.25;
    return _.merge({padding}, dataStyle, this.style.labels);
  }

  renderLabel(props) {
    const component = props.labelComponent;
    const componentStyle = component && component.props.style || {};
    const style = _.merge({}, this.getLabelStyle(props), componentStyle);
    const children = component && component.props.children || props.data.label;
    const labelProps = {
      x: component && component.props.x || props.x,
      y: component && component.props.y || props.y - style.padding,
      dy: component && component.props.dy,
      data, // Pass data for custom label component to access
      textAnchor: component && component.props.textAnchor || style.textAnchor,
      verticalAnchor: component && component.props.verticalAnchor || "end",
      style
    };

    return component ?
      React.cloneElement(component, labelProps, children) :
      React.createElement(VictoryLabel, labelProps, children);
  }

  render() {

  }
}
