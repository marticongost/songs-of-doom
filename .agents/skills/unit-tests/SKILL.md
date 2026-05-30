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

When a stub's argument is another mock object, declare that object first so it
can be used precisely in `.calledWith()`. Never use `expect.anything()` as a
placeholder — if you know what value will be passed, use it:

```typescript
// Wrong — loses the self-verifying property of the chain
player.drawFromDeck.calledWith(expect.anything(), 2).mockReturnValue([c1, c2]);

// Right — declare mutableState first so it can be referenced here
const mutableState = mock<MutableGameState>();
const player = mock<MutablePlayerState>();
player.drawFromDeck.calledWith(mutableState, 2).mockReturnValue([c1, c2]);
mutableState.requireActivePlayer.mockReturnValue(player);
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

## Test what the method promises, not how it works internally

Tests should describe what happens end-to-end under a given condition, not
assert each intermediate method call in isolation. A test like "calls
`requestSingleTargetOrActiveCard` with `this.target`" followed by a separate
test "calls `effectTriggered` with itself" fragments a single flow into
implementation details.

Instead, write one test per meaningful condition. Use `.calledWith()` on stubs
to chain them together — if any step in the chain receives the wrong argument,
the stub returns `undefined`, the chain breaks, and the final assertion fails.
This makes intermediate `expect(...).toHaveBeenCalledWith(...)` calls
unnecessary:

```typescript
// Wrong — fragments the flow and asserts intermediate steps explicitly
it('calls requestSingleTargetOrActiveCard with this.target', async () => { ... });
it('calls effectTriggered with itself', async () => { ... });
it('state callback calls requireTarget with the resolved targetId', async () => { ... });

// Right — stubs are chained with calledWith; one final assertion proves the whole flow
it('attaches the active card to the given target', async () => {
    const target = new Target({});
    const mutableState = mock<MutableGameState>();
    const targetCard = mock<MutableCardState>();
    const attachmentCard = mock<MutableCardState>();
    mutableState.requireTarget.calledWith('c2').mockReturnValue(targetCard);
    mutableState.requireActiveCard.mockReturnValue(attachmentCard);
    const graph = mock<GameGraph>();
    graph.requestSingleTargetOrActiveCard.calledWith(target).mockResolvedValue('c2');
    graph.effectTriggered.mockImplementation((_effect, callback) => {
        callback(mutableState);
    });

    await attach({ target }).trigger(graph);

    expect(targetCard.addAttachment).toHaveBeenCalledWith(mutableState, attachmentCard);
});
```

If `requestSingleTargetOrActiveCard` is called with the wrong argument, it
returns `undefined`; `requireTarget` never matches `'c2'`; `targetCard` is
never returned; `addAttachment` is never called — the final assertion fails.
The chain is self-verifying without any intermediate assertions.

The conditions to cover are the different inputs or states the method can
receive (e.g. `target` defined vs undefined). Each condition gets one test.

## When to use real instances instead of mocks

Use a **real instance only for the class under test itself**. Every dependency
the class under test interacts with must be mocked — regardless of how simple
or convenient the real implementation might seem.

```typescript
// Testing AttachEffect — mock GameGraph and all state objects
const graph = mock<GameGraph>();
const mutableState = mock<MutableGameState>();
const targetCard = mock<MutableCardState>();
graph.requestSingleTargetOrActiveCard.mockResolvedValue('c2');
graph.effectTriggered.mockImplementation((_effect, callback) => {
	callback(mutableState);
});
mutableState.requireTarget.mockReturnValue(targetCard);
mutableState.requireActiveCard.mockReturnValue(mock<MutableCardState>());
```

When the class under test has a constructor that takes dependencies (like
`Entity` inside a `ReadonlyCardState`), those dependencies are mocked:

```typescript
const c1 = new ReadonlyCardState({
	id: 'c1',
	card: mock<Entity>(), // dependency — mock it
	ownerId: 'p1',
	location: { container: 'hand', playerId: 'p1' }
});
```

The pattern in the `drawFromDeck` and `addAttachment` tests is a good example:
the player state (the class under test) uses real `ReadonlyCardState` instances
because those are inputs, not dependencies called by the player state itself.
Their internal `Entity` is still a mock.

## Parameterised tests

When multiple tests share the same logic but differ only in their inputs, use
`it.each` to avoid duplication. Name each case with a descriptive `label`
property and interpolate it into the test name with `$label`:

```typescript
it.each([
	{ label: 'without a target', target: undefined },
	{ label: 'with a target', target: new Target({}) }
])('exhausts the card and returns its id $label', async ({ target }) => {
	const card = mock<MutableCardState>({ exhausted: false });
	const mutableState = mock<MutableGameState>();
	mutableState.requireCard.calledWith('c1').mockReturnValue(card);
	const graph = mock<GameGraph>();
	graph.requestSingleTargetOrActiveCard.calledWith(target).mockResolvedValue('c1');
	let callbackReturn: unknown;
	graph.effectTriggered.mockImplementation((_effect, callback) => {
		callbackReturn = callback(mutableState);
	});

	await exhaust({ target }).trigger(graph);

	expect(card.exhausted).toBe(true);
	expect(callbackReturn).toEqual({ card: 'c1' });
});
```

Note that `.calledWith(target)` works correctly for both `undefined` and a real
`Target` instance — there is no need to branch the mock setup.

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
