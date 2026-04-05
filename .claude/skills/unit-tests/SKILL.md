---
name: unit-tests
description: Guidelines for writing unit tests in the game package — how to use mock(), when to use real instances, and the principle of only defining what a test needs.
---

# Unit tests

## Test framework

Tests use **vitest** and are co-located with the source files they test (e.g.
`playerstate.test.ts` next to `playerstate.ts`). All tests require assertions
(`expect.requireAssertions: true` is set globally).

Run game-package tests with:

```bash
cd packages/game && npx vitest run
```

## The `mock()` helper

Use the `mock()` helper from `@songsofdoom/common/test-utils`, not the raw
`mock` from `vitest-mock-extended` directly. The wrapper returns a fully typed
`MockProxy<T>` and lets you set initial property values inline:

```typescript
import { mock } from '@songsofdoom/common/test-utils';
```

### Basic usage — no properties needed

```typescript
const gameState = mock<MutableGameState>();
```

All methods are auto-mocked and return `undefined` by default. Access
`.mockReturnValue()` / `.mockImplementation()` directly on the result:

```typescript
gameState.requirePlayer.mockReturnValue(mutablePlayer);
```

### Setting initial properties

Pass only the properties the test actually reads:

```typescript
const card = mock<ReadonlyCardState>({ exhausted: false });
```

Do **not** use `Object.defineProperty` to set properties — just pass them to
`mock()`:

```typescript
// Wrong
const card = mock<ReadonlyCardState>();
Object.defineProperty(card, 'exhausted', { value: false });

// Right
const card = mock<ReadonlyCardState>({ exhausted: false });
```

### Stubbing methods

Pass functions directly to `mock()` to stub method implementations:

```typescript
const player = mock<ReadonlyPlayerState>({
	getCard: (id) => (id === 'c1' ? card : undefined)
});
```

When the stub needs to reference the mock object itself (e.g. for
self-referential return values), use `.mockImplementation()` after creation:

```typescript
const c1 = mock<ReadonlyCardState>();
c1.getCard.mockImplementation((id) => (id === 'c1' ? c1 : undefined));
```

## Only define what the test needs

Each test should declare only the properties and behaviours that are directly
exercised by that test. Anything else should be left to the mock's default.

```typescript
// Wrong — sets id even though the test never reads it
it('returns ready cards', () => {
    const card = mock<ReadonlyCardState>({ id: 'c1', exhausted: false });
    ...
});

// Right
it('returns ready cards', () => {
    const card = mock<ReadonlyCardState>({ exhausted: false });
    ...
});
```

This applies to method stubs too — do not stub methods that the code under
test does not call for this particular case.

## When to use real instances instead of mocks

Use a real instance when:

- The class has a simple constructor and the test is actually about the class
  being constructed (e.g. `ReadonlyCardState`, `ReadonlyPlayerState`).
- The real implementation's methods are needed (e.g. `mutable()`, `getCard()`)
  and mocking them would be more complex than just constructing the real object.

Use `mock<Entity>()` for complex dependencies that the constructor requires but
the test does not exercise:

```typescript
const c1 = new ReadonlyCardState({
	id: 'c1',
	card: mock<Entity>(), // not exercised — mock is fine
	ownerId: 'p1',
	location: { container: 'hand', playerId: 'p1' }
});
```

The pattern in the `drawFromDeck` and `addAttachment` tests is a good example:
the player state needs real `ReadonlyCardState` instances (so that `mutable()`
works correctly), but their internal `Entity` can be a mock.

## Test structure

Group related tests with `describe` blocks and use section comments to visually
separate them:

```typescript
// ─── PlayerState.cards ────────────────────────────────────────────────────────

describe('PlayerState.cards', () => { ... });

// ─── PlayerState.getCard ──────────────────────────────────────────────────────

describe('PlayerState.getCard', () => { ... });
```

Use a `makeX()` helper at the top of the file when multiple tests share the
same construction boilerplate. Keep helpers minimal — only accept parameters
that vary across tests:

```typescript
function makePlayer(
    id: PlayerId,
    cards: { deck?: ReadonlyCardState[]; hand?: ReadonlyCardState[] } = {}
): ReadonlyPlayerState {
    return new ReadonlyPlayerState({
        id,
        character: mock<CharacterState>(),
        deck: cards.deck ?? [],
        hand: cards.hand ?? [],
        ...
    });
}
```

## Validation

After writing tests, run:

```bash
npm run check   # TypeScript type checking
npm run test    # Run all tests
npm run format  # Reformat with Prettier
```
