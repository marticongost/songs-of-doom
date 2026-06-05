Goal: plan how to reflect the game sequence in src/models/game/gamegraph.ts

# Game sequence

The game is divided in so called chapters, which in turn consists of multiple turns.
Chapters and turns are divided into a series of distinct phases.

## Chapter phase C0

Trigger a `chapterStart` event.

## Chapter phase C1: Focus

In player order, each player executes the following two steps.

If players had remaining focus tokens in their hand from a previous chapter, they
must discard all but X - where X is their concentration characteristic. Concentration
is calculated as:

- Starts at 1
- Plus, the sum of all modifyConcentration() effects from Constant capabilities in cards
  under their control
- Can't be lower than 0

Each player draws 5 focus tokens from their bag (i.e. resolve a drawFocus(5) effect).

## Chapter phase C2: Turns

In this phase, players, allies and enemies alternate to take a turn. Each actor gets a
single action per turn. Players and allies act first, followed by enemies.

### Turn phase T0

Set the `activated` status from all actors (players, allies, creatures) to false.
Trigger a `turnStart` event.

### Turn phase T1: Player actions

In this phase, players choose one of the actions available to any of the players or
allies that haven't been activated yet during the turn (i.e. `activated === false`).
That player or ally becomes the active actor, pays the cost of their chosen action and
executes its effects. Players and allies can also pass instead, if they don't have any
eligible actions or they would rather not act this turn. In either case, the actor's
`activated` state is set to `true`.

Allies can't be activated if they are `exhausted`.

When choosing actions, players and allies MUST choose actions designated as "prioritary"
over regular ones, where possible.

This is repeated until all players and allies are exhausted.

#### Turn phase T2: Creature actions

Similar to phase T1, but for creatures. During this phase, non-exhausted enemies are
given a chance to execute a single action.

The phase follows this loop:

- If no more non-exhausted, not-activated enemies remain, the phase ends
- Otherwise, players select one non-exhausted, not-activated enemy
- An action for the enemy is selected (see below) and executed
- The enemy is set to `activated = true`

To choose an enemy's action, go in order through the enemy's Action capabilities; those
in the enemy's own card or any card attached to the enemy's card (recursively). As with
players, prioritary actions must be given precedence. Within each priority tier, actions
must preserve the order in which they are defined.

Each enemy will do the first action it can perform, if any. This means:

- The enemy must be able to pay the action's cost
- At least 1+ effects in the action must be condition-free, or satisfy all of their
  requisite conditions (i.e. ConditionalEffect)
- If no action fulfills these requirements, the enemy will do nothing and _pass_

### Turn phase T3: Turn end

Trigger a `turnEnd` event.

If at least 1+ players, allies or enemies performed an action (other than passing), a
new turn (T0) begins. If not, play proceeds with phase C3.

## Phase C3: Draw cards

In player order, each player draws a card from their deck (i.e. trigger a drawCards(1)
effect).

## Phase C4: Encounters

In player order, each player draws an encounter card and triggers an `encounterRevealed`
event to execute its effects.

## Phase C5: Clean up

Trigger a `chapterEnd` event. All exhausted cards are readied.

# Common definitions

## Player order

Wherever players have to alternate "in player order", iterate through undefeated players
in GameState#players.

## Cards in player control

Several parts of the spec refer to "cards under player control" or "in their control".
For a player, this means any of:

- Skill cards in their hand
- Attached cards (recursive; this includes, but is not limited to, traits, allies,
  objects)
