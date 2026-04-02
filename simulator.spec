Create a /simulator page that makes it possible to simulate game sessions.
It should manage game state and flow, resolving capabilities and effects,
and keeping track of components (e.g. card hands and decks, focus tokens, etc).
It should also offer commands to setup particular testing scenarios and alter the
game state at any moment to test different situations.

## UI

Should display the following new components:

- GameLog: A log of game events and resolved effects
- PlayerHand: A hand of cards
- PlayerTableau: A set of cards in play, in front of the player
- PlayerFocusesHand: The set of focus tokens currently available to the player

## Triggering actions

The Action capabilities in the cards should be clickable, which will activate all of
their effects, in order.

## Triggering reactions

If necessary triggering conditions for a Reaction are met, the game must:

- Trigger it straight away, like a

straight away (if it's a )

activate it (ask in the case )
