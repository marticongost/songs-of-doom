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

In this phase, players, allies and enemies alternate to take their turn. This phase
is repeated until no player or enemy can take an action (i.e. they all _pass_).

### Turn phase T0

Trigger a `turnStart` event.

### Turn phase T1: Planning

This phase establishes the actions that players and enemies will undertake during their
next turn.

#### Turn phase T1a: Enemy planning

The phase starts by looking at each enemy in play (either attached to a location or to a
player), and deciding its action. To do so, go in order through the enemy's Action
capabilities; those in the enemy's own card or any card attached to the enemy's card(recursively). Actions are sorted in two tiers: prioritary actions take precedence, all
others follow after. Within a tier, actions must preserve the order in which they are
defined.

Each enemy will do the first action it can perform, if any. This means:

- The enemy must be able to pay the action's cost
- At least 1+ effects in the action must be condition-free, or satisfy all of their
  requisite conditions (i.e. ConditionalEffect)
- If no action fulfills these requirements, the enemy will do nothing and _pass_

If the enemy does act, its action will get a numeric value to represent its _initiative_.
This is calculated from the sum of:

- The enemy's initiative modifier: starts equal to their `agility` stat, plus any
  modifier from `modifyInitiative` effects in Constant capabilities in their card or
  attachments.
- The chosen action's initiative modifier: the sum of any `modifyInitiative` effects in
  the action itself.

#### Turn phase T1b: Player planning

Similar to enemies, now players establish their action for the turn. Contrary to enemies,
players get to choose freely from their available actions. These come from any Action
capability in the cards under their control.

The chosen action gets an initiative, calculated in the same fashion. Any of the cards
controlled by the player can influence their initiative.

They also choose actions for their controlled allies, if any, with each ally getting
its own action with its own separate initiative.

### Turn phase T2: Execution

In descending order of initiative, players, allies and enemies execute their planned
action for the turn.

Ties in initiative are broken as follows:

1. By agility (highest goes first)
2. If still tied, by intelligence (highest goes first)
3. If still tied, players and allies go before enemies
4. If still tied, allies go before enemies
5. If still tied, players go in player order
6. If still tied, players choose order between themselves and their allies
7. If still tied, allies go in order of GameState#players
8. If still tied, enemies go in order of id

To execute an action, invoke its trigger() method.

### Turn phase T3: Turn end

Trigger a `turnEnd` event.

If at least 1+ players, allies or enemies performed an action, a new turn (T1) begins.
If not, play proceeds with phase C3.

## Phase C3: Draw cards

In player order, each player draws a card from their deck (i.e. trigger a drawCards(1)
effect).

## Phase C4: Encounters

In player order, each player draws an encounter card and triggers an `encounterRevealed`
event to execute its effects.

## Phase C5: Clean up

Trigger a `chapterEnd` event.

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
