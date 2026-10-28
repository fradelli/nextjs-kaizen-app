import assert from "node:assert/strict";
import test from "node:test";
import { validateUiIconSource } from "./validate-ui-icons.mjs";

const validate = (source) => validateUiIconSource("src/features/training/ui/example.tsx", source);

test("rejects a handwritten SVG action", () => {
  assert.equal(
    validate('<Button aria-label="Editar"><svg><path d="m1 1" /></svg></Button>').length,
    1,
  );
});
test("rejects an emoji action inside a decorative child", () => {
  assert.equal(validate('<Button><span aria-hidden="true">🗑</span></Button>').length, 1);
});
test("rejects alternative player symbol literals", () => {
  assert.equal(validate('<Button>{paused ? "▶" : "⏸"}</Button>').length, 2);
});
test("rejects a plain plus action and an emoji alongside its label", () => {
  assert.equal(validate("<Button>+</Button><Button>💬 Comentário</Button>").length, 2);
});
test("accepts public icon components and accessible labels", () => {
  assert.deepEqual(
    validate(
      '<Button aria-label="Pausar"><PauseIcon aria-hidden="true" focusable="false" /></Button>',
    ),
    [],
  );
});
test("preserves dose text, arrows in explanatory prose, and arithmetic", () => {
  assert.deepEqual(
    validate(
      "<><p>3+ repetições; esquerda → direita</p><Button>Avançar → próxima etapa</Button><span>{count + 1}</span></>",
    ),
    [],
  );
});
test("preserves product identity, user content, indicators and event data", () => {
  assert.deepEqual(
    validate(
      '<><span lang="ja">改善</span><p>{userComment}</p><div role="meter"><span /></div><Button onClick={() => save("+")}>Salvar</Button></>',
    ),
    [],
  );
});
test("does not treat attribute strings as rendered action symbols", () => {
  assert.deepEqual(validate('<Button aria-label={paused ? "▶" : "⏸"}>Pausar</Button>'), []);
});
