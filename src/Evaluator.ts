import {
  Block,
  BlockId,
  BuiltInExpression,
  BuiltInExpressionType,
  Expression,
  ExpressionType,
  Property,
  PropertyId,
  PropertyOverride,
} from "./Model";
import { generate } from "astring";
import { BinaryExpression, CallExpression, Literal, Node } from "estree";
import { blocks } from "./StandardLibrary";
import { uniqBy } from "lodash";

export function createScope(block: Block) {
  const allBlocks = [...blocks, block];
  const scope = {
    blocks: allBlocks,
    properties: allBlocks.flatMap((it) => it.properties),
  };
  return scope;
}

export function transpileBlock(block: Block): Node {
  const scope = createScope(block);
  return transpileExpression(block.value, scope);
}

export function evaluateAst(node: Node): any {
  const code = generate(node);
  return eval(code);
}

export type Scope = {
  blocks: Block[];
  properties: Property[];
};

export function resolveProperty(scope: Scope, propertyId: PropertyId) {
  return scope.properties.find((it) => it.id === propertyId);
}

export function resolveBlock(scope: Scope, blockId: BlockId) {
  return scope.blocks.find((it) => it.id === blockId);
}

function transpileExpression(value: Expression | BuiltInExpression, scope: Scope): Node {
  switch (value.type) {
    case BuiltInExpressionType.BinaryOperatorCall:
      return {
        type: "BinaryExpression",
        operator: value.operator,
        left: transpileExpression(value.left, scope),
        right: transpileExpression(value.right, scope),
      } as BinaryExpression;
    case BuiltInExpressionType.FunctionCall:
      return {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: value.functionName,
        },
      } as CallExpression;
    case ExpressionType.NumberLiteral:
      return {
        type: "Literal",
        value: value.value,
      } as Literal;
    case ExpressionType.PropertyReference:
      const property = resolveProperty(scope, value.propertyId);
      if (property) {
        return transpileExpression(property.value, scope);
      } else {
        throw new Error(`Property "${value.propertyId}" not found`);
      }
    case ExpressionType.BlockReference:
      const block = resolveBlock(scope, value.blockId);
      if (block) {
        const newScope = changeScope(scope, value.propertyOverrides);
        return transpileExpression(block.value, newScope);
      } else {
        throw new Error(`Block "${value.blockId}" not found`);
      }
  }
}

export function changeScope(scope: Scope, propertyOverrides: PropertyOverride[]): Scope {
  const overridenProperties: Property[] = propertyOverrides.flatMap((propertyOverride) => {
    const property = scope.properties.find((it) => it.id === propertyOverride.propertyId);
    return property ? [{ ...property, value: propertyOverride.value }] : [];
  });
  const mergedProperties = uniqBy([...overridenProperties, ...scope.properties], (it) => it.id);
  return {
    blocks: scope.blocks,
    properties: mergedProperties,
  };
}
