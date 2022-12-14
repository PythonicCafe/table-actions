import { deepCopy, mergeObjects } from "../src/utils.js";

describe("Test deepCopy, mergeObjects utils functions", () => {
  test("deepCopy returns a copy of an object", () => {
    const obj = {
      prop1: "value1",
      prop2: "value2",
      nested: {
        propA: "valueA",
        propB: "valueB"
      }
    };
    const copy = deepCopy(obj);
    expect(copy).toEqual(obj);
    expect(copy).not.toBe(obj);
    expect(copy.nested).toEqual(obj.nested);
    expect(copy.nested).not.toBe(obj.nested);
  });

  test("deepCopy returns a copy of an object with arrays", () => { 
    const arr = [1, 2, 3];
    const obj = {
      prop1: "value1",
      prop2: arr,
    }; 
    const copy = deepCopy(obj);
    expect(copy.prop2).toEqual([1, 2, 3]);
  });

  test("mergeObjects merges two objects with no conflicts", () => {
    const obj1 = {
      prop1: "value1",
      prop2: "value2",
      nested: {
        propA: "valueA",
        propB: "valueB"
      }
    };
    const obj2 = {
      prop3: "value3",
      prop4: "value4",
      nested: {
        propC: "valueC",
        propD: "valueD"
      }
    };
    const merged = mergeObjects(obj1, obj2);
    expect(merged).toEqual({
      prop1: "value1",
      prop2: "value2",
      prop3: "value3",
      prop4: "value4",
      nested: {
        propA: "valueA",
        propB: "valueB",
        propC: "valueC",
        propD: "valueD"
      }
    });
  });

  test("mergeObjects merges two objects with conflicts", () => {
    const obj1 = {
      prop1: "value1",
      prop2: "value2",
      nested: {
        propA: "valueA",
        propB: "valueB"
      }
    };
    const obj2 = {
      prop1: "newValue1",
      prop3: "value3",
      nested: {
        propB: "newValueB",
        propC: "valueC"
      }
    };
    const merged = mergeObjects(obj1, obj2);
    expect(merged).toEqual({
      prop1: "newValue1",
      prop2: "value2",
      prop3: "value3",
      nested: {
        propA: "valueA",
        propB: "newValueB",
        propC: "valueC"
      }
    });
  });

})
