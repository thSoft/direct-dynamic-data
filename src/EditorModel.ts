import { Entity, entity } from "simpler-state";
import { bmiCalculator } from "./Examples";
import { WritableDraft } from "immer/dist/types/types-external";
import produce from "immer";
import { ExpressionType, numberLiteral, Property, Type } from "./Model";

export const blockEntity = entity(bmiCalculator);

const newProperty = (id: number): Property => {
  return {
    id: id.toString(),
    name: "property" + id,
    type: Type.number,
    internal: false,
    value: { type: ExpressionType.NumberLiteral, value: 0 },
  };
};

function change<T>(entity: Entity<T>, recipe: (draft: WritableDraft<T>) => void) {
  entity.set(produce(entity.get(), recipe));
}

export function addProperty(id: number) {
  change(blockEntity, (block) => {
    block.properties.push(newProperty(id));
  });
}

export function deleteProperty(index: number) {
  change(blockEntity, (block) => {
    deleteElement(block.properties, index);
  });
}

function deleteElement(array: any[], index: number) {
  array.splice(index, 1);
}

export function changePropertyValue(index: number, value: number) {
  change(blockEntity, (block) => {
    block.properties[index].value = numberLiteral(value);
  });
}
