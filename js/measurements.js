export default class Measurements {
  static measurements = {
    THICKNESS: 1,
    LENGTH: 40,
    BREADTH: 20,
    DEPTH: 20,
    TRENCH_OFFSET: 1,
    BAR_OFFSET: 0.6,
    HOLE_OFFSET: 0.8,
    FRONT_ANGLE: 45,
    SVG_SCALE: 10,
  };

  static setInches(field, value) {
    value = value * 2;
    this.measurements[field] = value;
  }
  static setMM(field, value) {
    value = 0.0393701 * value;
    this.setInches(field, value);
  }
  static set(field, value, unit) {
    if (unit === "in") {
      this.setInches(field, value);
    } else if (unit == "mm") {
      this.setMM(field, value);
    } else {
      this.measurements[field] = value;
    }
  }

  static convert(value, toUnit) {
    return toUnit == "in"
      ? (value * 0.0393701).toFixed(3)
      : (value * 25.4).toFixed(3);
  }

  static convertToBase(value, fromUnit) {
    return fromUnit === "in" ? value * 2 : this.convert(value, "in") * 2;
  }

  static isNotValid(length, breadth, depth, thickness, unit) {
    let baseValues = [length, breadth, depth, thickness].map((val) =>
      this.convertToBase(val, unit)
    );

    if (
      baseValues[1] <=
      this.measurements.BAR_OFFSET +
        this.measurements.THICKNESS +
        this.measurements.TRENCH_OFFSET +
        1
    ) {
      return [true, "Width should atleast be greater than 3 inches or 7mm"];
    }
    if (
      baseValues[2] <=
      this.measurements.THICKNESS + this.measurements.TRENCH_OFFSET + 1
    ) {
      return [true, "Height should atleast be greater than 2 inches or 5mm"];
    }
    if (baseValues[0] <= 2 * this.measurements.THICKNESS) {
      return [true, "Length should atleast be greater than 1 inches or 5mm"];
    }
    if ([length, breadth, depth, thickness].some((item) => item <= 0)) {
      return [true, "All the Measurements should be greater than zero"];
    }
    if (
      thickness > breadth * 0.4 ||
      thickness > depth * 0.4 ||
      thickness > length * 0.4
    ) {
      return [
        true,
        `Thickness should be less than ${(
          Math.min(length, breadth, depth) * 0.4
        ).toFixed(3)}`,
      ];
    }
    return [false];
  }
}
