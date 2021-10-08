import {
  Block,
  blockReference,
  header,
  numberLiteral,
  propertyOverride,
  propertyReference,
  textSegment,
  Type,
} from "./Model";
import {
  add,
  addend,
  augend,
  base,
  divide,
  dividend,
  divisor,
  exponent,
  exponentiate,
  property,
} from "./StandardLibrary";

export const basicArithmetic: Block = {
  id: "basicArithmetic",
  name: "Basic arithmetic",
  header: header([textSegment("Basic arithmetic")]),
  type: Type.number,
  properties: [],
  value: blockReference(add.id, [
    propertyOverride(augend.id, numberLiteral(2)),
    propertyOverride(addend.id, numberLiteral(3)),
  ]),
};

export const bmiCalculatorWeight = property("bmiCalculator.weight", "weight (kg)");
export const bmiCalculatorHeight = property("bmiCalculator.height", "height (cm)");
export const bmiCalculator: Block = {
  id: "bmiCalculator",
  name: "BMI Calculator",
  header: header([textSegment("BMI Calculator")]),
  type: Type.number,
  properties: [bmiCalculatorWeight, bmiCalculatorHeight],
  value: blockReference(divide.id, [
    propertyOverride(dividend.id, propertyReference(bmiCalculatorWeight.id)),
    propertyOverride(
      divisor.id,
      blockReference(exponentiate.id, [
        propertyOverride(
          base.id,
          blockReference(divide.id, [
            propertyOverride(dividend.id, propertyReference(bmiCalculatorHeight.id)),
            propertyOverride(divisor.id, numberLiteral(100)),
          ])
        ),
        propertyOverride(exponent.id, numberLiteral(2)),
      ])
    ),
  ]),
};
