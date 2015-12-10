import React, { PropTypes } from "react";
import Radium from "radium";
import pathHelpers from "../path-helpers";
import {VictoryLabel} from "victory-label";
import {VictoryAnimation} from "victory-animation";

@Radium
export default class Point extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      x: React.PropTypes.any,
      y: React.PropTypes.any
    }),
    labelComponent: React.PropTypes.element,
    symbol: React.PropTypes.string,
    size: React.PropTypes.number,
    showLabels: React.PropTypes.bool,
    style: PropTypes.shape({
      data: React.PropTypes.object,
      labels: React.PropTypes.object
    }),
    x: React.PropTypes.number,
    y: React.PropTypes.number
  };

  static defaultProps = {
    showLabels: true,
  }

  getCalculatedValues(props) {
    this.style = this.getStyle(props);
  }

  getStyle(props) {
    // TODO: functional styles
    const stylesFromData = _.omit(props.data, [
      "x", "y", "z", this.props.bubbleProperty, "size", "symbol", "name", "label"
    ]);
    const dataStyle = _.merge({}, props.style.data, stylesFromData);
    // match certain label styles to data if styles are not given
    const matchedStyle = _.pick(dataStyle, ["opacity", "fill"]);
    const padding = props.style.labels.padding || props.size * 0.25;
    const labelStyle = _.merge({padding}, matchedStyle, props.style.labels);
    return {data: dataStyle, labels: labelStyle};
  }

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

  renderPoint(props) {
    return (
      <path
        style={this.style.data}
        d={this.getPath(props)}
        shapeRendering="optimizeSpeed"
      />
    );
  }

  renderLabel(props) {
    if (props.showLabels === false || !props.data.label) {
      return undefined;
    }
    const component = props.labelComponent;
    const componentStyle = component && component.props.style || {};
    const style = _.merge({}, this.style.labels, componentStyle);
    const children = component && component.props.children || props.data.label;
    const labelProps = {
      x: component && component.props.x || props.x,
      y: component && component.props.y || props.y - style.padding,
      dy: component && component.props.dy,
      data: props.data,
      textAnchor: component && component.props.textAnchor || style.textAnchor,
      verticalAnchor: component && component.props.verticalAnchor || "end",
      style
    };

    return component ?
      React.cloneElement(component, labelProps, children) :
      React.createElement(VictoryLabel, labelProps, children);
  }

  render() {
    // If animating, return a `VictoryAnimation` element that will create
    // a new `VictoryScatter` with nearly identical props, except (1) tweened
    // and (2) `animate` set to null so we don't recurse forever.
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const animateData = _.pick(this.props, ["data", "size", "style", "x", "y"]);

      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {(props) => <Point {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    } else {
      this.getCalculatedValues(this.props);
    }
    return (
      <g>
        {this.renderPoint(this.props)}
        {this.renderLabel(this.props)}
      </g>
    );
  }
}
