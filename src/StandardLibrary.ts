import {
  Block,
  BuiltInExpressionType,
  Direction,
  numberLiteral,
  Property,
  propertyReference,
  propertySegment,
  textSegment,
  Type,
} from "./Model";

export function property(id: string, name: string): Property {
  return {
    id: id,
    name: name,
    type: Type.number,
    internal: false,
    value: numberLiteral(1),
  };
}

function numericOperator(
  operator: string,
  nativeOperator: string,
  left: Property,
  right: Property,
  direction: Direction = "horizontal"
): Block {
  return {
    id: operator,
    name: operator,
    header: {
      segments: [propertySegment(left.id), textSegment(operator), propertySegment(right.id)],
      direction,
    },
    type: Type.number,
    value: {
      type: BuiltInExpressionType.BinaryOperatorCall,
      operator: nativeOperator,
      left: propertyReference(left.id),
      right: propertyReference(right.id),
    },
    properties: [left, right],
  };
}

export const augend = property("add.augend", "augend");
export const addend = property("add.addend", "addend");
export const add = numericOperator("+", "+", augend, addend);

export const minuend = property("subtract.minuend", "minuend");
export const subtrahend = property("subtract.subtrahend", "subtrahend");
export const subtract = numericOperator("-", "-", minuend, subtrahend);

export const multiplier = property("multiply.multiplier", "multiplier");
export const multiplicand = property("multiply.multiplicand", "multiplicand");
export const multiply = numericOperator("*", "*", multiplier, multiplicand);

export const dividend = property("divide.dividend", "dividend");
export const divisor = property("divide.divisor", "divisor");
export const divide = numericOperator("/", "/", dividend, divisor, "vertical");

export const base = property("exponentiate.base", "base");
export const exponent = property("exponentiate.exponent", "exponent");
export const exponentiate = numericOperator("^", "**", base, exponent);

export const blocks = [add, subtract, multiply, divide, exponentiate];
