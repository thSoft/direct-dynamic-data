export type BlockValue = Expression | BuiltInExpression;

export type Block = {
  id: BlockId;
  name: string;
  header: Header;
  type: Type;
  properties: Property[];
  value: BlockValue;
};

export type BlockId = string;

export type Direction = "horizontal" | "vertical";

export type Header = {
  segments: HeaderSegment[];
  direction: Direction;
};

export function header(segments: HeaderSegment[], direction: Direction = "horizontal") {
  return { segments, direction };
}

export type HeaderSegment = TextSegment | PropertySegment;

export enum HeaderSegmentType {
  TextSegment = "TextSegment",
  PropertySegment = "PropertySegment",
}

export function textSegment(text: string): TextSegment {
  return {
    type: HeaderSegmentType.TextSegment,
    text,
  };
}

export type TextSegment = {
  type: HeaderSegmentType.TextSegment;
  text: string;
};

export function propertySegment(propertyId: PropertyId): PropertySegment {
  return {
    type: HeaderSegmentType.PropertySegment,
    propertyId,
  };
}

export type PropertySegment = {
  type: HeaderSegmentType.PropertySegment;
  propertyId: PropertyId;
};

export enum Type {
  number = "number",
}

export type Property = {
  id: PropertyId;
  name: string;
  type: Type;
  internal: boolean;
  value: Expression;
  description?: string;
};

export type PropertyId = string;

export type Expression = NumberLiteral | PropertyReference | BlockReference;

export enum ExpressionType {
  NumberLiteral = "NumberLiteral",
  PropertyReference = "PropertyReference",
  BlockReference = "BlockReference",
}

export type NumberLiteral = {
  type: ExpressionType.NumberLiteral;
  value: number;
};

export function numberLiteral(value: number): NumberLiteral {
  return {
    type: ExpressionType.NumberLiteral,
    value,
  };
}

export type PropertyReference = {
  type: ExpressionType.PropertyReference;
  propertyId: PropertyId;
};

export function propertyReference(propertyId: PropertyId): PropertyReference {
  return {
    type: ExpressionType.PropertyReference,
    propertyId,
  };
}

export type BlockReference = {
  type: ExpressionType.BlockReference;
  blockId: BlockId;
  propertyOverrides: PropertyOverride[];
};

export function blockReference(blockId: BlockId, propertyOverrides: PropertyOverride[]): BlockReference {
  return {
    type: ExpressionType.BlockReference,
    blockId,
    propertyOverrides,
  };
}

export type PropertyOverride = {
  propertyId: PropertyId;
  value: Expression;
};

export function propertyOverride(propertyId: PropertyId, value: Expression): PropertyOverride {
  return {
    propertyId,
    value,
  };
}

export type BuiltInExpression = BinaryOperatorCall | FunctionCall;

export enum BuiltInExpressionType {
  BinaryOperatorCall = "BinaryOperatorCall",
  FunctionCall = "FunctionCall",
}

export type BinaryOperatorCall = {
  type: BuiltInExpressionType.BinaryOperatorCall;
  operator: string;
  left: Expression;
  right: Expression;
};

export type FunctionCall = {
  type: BuiltInExpressionType.FunctionCall;
  functionName: string;
  arguments: Expression[];
};
