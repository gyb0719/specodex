import { describe, expect, it } from "vitest";
import { renderPrompt } from "../src/core/prompt";
describe("renderPrompt", () => {
    it("지정된 플레이스홀더를 치환한다", () => {
        const template = "Hello {{ NAME }} from {{ PLACE }}";
        const output = renderPrompt(template, {
            NAME: "SpecoDex",
            PLACE: "Codex",
        });
        expect(output).toBe("Hello SpecoDex from Codex");
    });
    it("없는 키는 원본을 유지한다", () => {
        const template = "Value: {{ UNKNOWN }}";
        const output = renderPrompt(template, {});
        expect(output).toBe("Value: {{ UNKNOWN }}");
    });
});
//# sourceMappingURL=prompt.spec.js.map