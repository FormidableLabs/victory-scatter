const _ = require("lodash");

module.exports = {
  circle(x, y, size) {
    return "M " + x + "," + y + " " +
      "m " + -size + ", 0 " +
      "a " + size + "," + size + " 0 1,0 " + (size * 2) + ",0 " +
      "a " + size + "," + size + " 0 1,0 " + (-size * 2) + ",0";
  },

  square(x, y, size) {
    return "M " + (x - size) + "," + (y + size) + " " +
      "L " + (x + size) + "," + (y + size) +
      "L " + (x + size) + "," + (y - size) +
      "L " + (x - size) + "," + (y - size) +
      "z";
  },

  diamond(x, y, size) {
    const length = Math.sqrt(2 * (size * size));
    return "M " + x + "," + (y + length) + " " +
      "L " + (x + length) + "," + y +
      "L " + x + "," + (y - length) +
      "L " + (x - length) + "," + y +
      "z";
  },

  triangleDown(x, y, size) {
    const height = (size / 2 * Math.sqrt(3));
    return "M " + (x - size) + "," + (y - size) + " " +
      "L " + (x + size) + "," + (y - size) +
      "L " + x + "," + (y + height) +
      "z";
  },

  triangleUp(x, y, size) {
    const height = (size / 2 * Math.sqrt(3));
    return "M " + (x - size) + "," + (y + size) + " " +
      "L " + (x + size) + "," + (y + size) +
      "L " + x + "," + (y - height) +
      "z";
  },

  plus(x, y, size) {
    return "M " + (x - size / 2) + "," + (y + size) + " " +
      "L " + (x + size / 2) + "," + (y + size) +
      "L " + (x + size / 2) + "," + (y + size / 2) +
      "L " + (x + size) + "," + (y + size / 2) +
      "L " + (x + size) + "," + (y - size / 2) +
      "L " + (x + size / 2) + "," + (y - size / 2) +
      "L " + (x + size / 2) + "," + (y - size) +
      "L " + (x - size / 2) + "," + (y - size) +
      "L " + (x - size / 2) + "," + (y - size / 2) +
      "L " + (x - size) + "," + (y - size / 2) +
      "L " + (x - size) + "," + (y + size / 2) +
      "L " + (x - size / 2) + "," + (y + size / 2) +
      "z";
  },

  star(x, y, size) {
    const baseSize = 1.2 * size;
    const angle = Math.PI / 5;
    const starCoords = _.map(_.range(10), (index) => {
      const length = index % 2 === 0 ? baseSize : baseSize / 2;
      return "L " + (length * Math.sin(angle * (index + 1)) + x) + ", " +
        (length * Math.cos(angle * (index + 1)) + y);
    });
    const path = starCoords.toString();
    return "M " + (x + baseSize) + "," + (y + baseSize) + " " + path + "z";
  }
};
