import { evaluateAst, transpileBlock } from "./Evaluator";
import { basicArithmetic, bmiCalculator } from "./Examples";

test("Basic arithmetic", () => {
  const ast = transpileBlock(basicArithmetic);
  expect(evaluateAst(ast)).toBe(5);
});

test("BMI calculator", () => {
  const ast = transpileBlock(bmiCalculator);
  expect(evaluateAst(ast)).toBe(10000);
});
