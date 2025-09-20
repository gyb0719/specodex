import { describe, expect, it } from "vitest";
import { orderTasks } from "../src/core/task-runner";
describe("orderTasks", () => {
    it("의존성을 만족하는 순서로 정렬한다", () => {
        const tasks = [
            { id: "TASK-002", title: "second", steps: ["echo 2"], depends_on: ["TASK-001"] },
            { id: "TASK-001", title: "first", steps: ["echo 1"] },
            { id: "TASK-003", title: "third", steps: ["echo 3"], depends_on: ["TASK-002"] },
        ];
        const ordered = orderTasks(tasks).map((task) => task.id);
        expect(ordered).toEqual(["TASK-001", "TASK-002", "TASK-003"]);
    });
    it("순환 의존성을 감지하면 예외를 던진다", () => {
        const tasks = [
            { id: "A", title: "A", steps: ["echo A"], depends_on: ["B"] },
            { id: "B", title: "B", steps: ["echo B"], depends_on: ["A"] },
        ];
        expect(() => orderTasks(tasks)).toThrow(/순환 의존성/);
    });
});
//# sourceMappingURL=example.spec.js.map