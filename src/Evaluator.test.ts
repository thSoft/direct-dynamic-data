import { evaluateAst, transpileMainBlock } from "./Evaluator";
import { basicArithmetic, bmiCalculator } from "./Examples";
import { Block } from "./Model";

function testEvaluator(block: Block, expectedResult: any) {
  const ast = transpileMainBlock(block);
  expect(evaluateAst(ast)).toBe(expectedResult);
}

test("Basic arithmetic", () => {
  testEvaluator(basicArithmetic, 5);
});

test("BMI calculator", () => {
  testEvaluator(bmiCalculator, 10000);
});
