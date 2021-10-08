import {
  Block,
  BlockId,
  BlockValue,
  BuiltInExpressionType,
  ExpressionType,
  Property,
  PropertyId,
  PropertyOverride,
} from "./Model";
import { generate } from "astring";
import {
  BinaryExpression,
  CallExpression,
  Expression as ESExpression,
  FunctionDeclaration,
  Identifier,
  Literal,
  Node,
  Program,
} from "estree";
import { blocks } from "./StandardLibrary";
import { uniqBy } from "lodash";

export function createScope(block: Block): Scope {
  const allBlocks = [...blocks, block];
  const scope = {
    blocks: allBlocks,
    properties: allBlocks.flatMap((it) => it.properties),
  };
  return scope;
}

export function transpileBlock(block: Block): ESExpression {
  const scope = createScope(block);
  return transpileExpression(block.value, scope);
}

export function transpileMainBlock(block: Block): Program {
  const scope = createScope(block);
  return {
    type: "Program",
    sourceType: "module",
    body: [
      ...scope.blocks.filter((it) => !isBuiltInBlock(it)).map(transpileBlockDefinition),
      { type: "ExpressionStatement", expression: transpileBlockCall(block, scope) },
    ],
  };
}

function getId(name: string): Identifier {
  return {
    type: "Identifier",
    name:
      "_" +
      Array.from(name)
        .map((char) => char.codePointAt(0))
        .join("_"),
  };
}

export function transpileBlockDefinition(block: Block): FunctionDeclaration {
  return {
    type: "FunctionDeclaration",
    id: getId(block.name),
    params: block.properties.map((it) => getId(it.name)),
    body: {
      type: "BlockStatement",
      body: [
        {
          type: "ReturnStatement",
          argument: transpileBlock(block),
        },
      ],
    },
  };
}

export function evaluateAst(node: Node): any {
  const code = generate(node);
  return eval(code);
}

export type Scope = {
  blocks: Block[];
  properties: Property[];
};

export function resolveProperty(scope: Scope, propertyId: PropertyId): Property | undefined {
  return scope.properties.find((it) => it.id === propertyId);
}

export function resolveBlock(scope: Scope, blockId: BlockId): Block | undefined {
  return scope.blocks.find((it) => it.id === blockId);
}

function isBuiltInBlock(block: Block): boolean {
  const builtInTypes: (ExpressionType | BuiltInExpressionType)[] = [
    BuiltInExpressionType.FunctionCall,
    BuiltInExpressionType.BinaryOperatorCall,
  ];
  return builtInTypes.includes(block.value.type);
}

function transpileBlockCall(block: Block, scope: Scope): CallExpression {
  return {
    type: "CallExpression",
    callee: getId(block.name),
    arguments: block.properties.map((it) => transpilePropertyToArgument(it, scope)),
    optional: false,
  };
}

function transpileExpression(value: BlockValue, scope: Scope): ESExpression {
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
        callee: getId(value.functionName),
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
        if (isBuiltInBlock(block)) {
          const newScope = changeScope(scope, value.propertyOverrides);
          return transpileExpression(block.value, newScope);
        } else {
          return transpileBlockCall(block, scope);
        }
      } else {
        throw new Error(`Block "${value.blockId}" not found`);
      }
  }
}

function transpilePropertyToArgument(property: Property, scope: Scope): ESExpression {
  return transpileExpression(property.value, scope);
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
