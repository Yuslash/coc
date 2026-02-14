# 🗺️ Future Roadmap

Here is the plan for the upcoming features, ordered logically for development:

## Phase 1: Economy & Resources
*Before we train troops, we need the currency to pay for them.*
- [ ] **Resource System**: Implement **Gold** and **Elixir**.
- [ ] **Costs**:
    -   Buildings require **Gold** to build.
    -   Troops require **Elixir** to train.
- [ ] **UI**: Add a resource bar at the top (Gold/Elixir counters).

## Phase 2: Army & Training
- [ ] **Army Camp**: A new building type.
    -   Defines the "Troop Limit" (how many units you can have).
    -   Trained troops move here and stay until used.
- [ ] **Troop Training**:
    -   Add "Train" button to Barracks.
    -   UI to select troops to train.
    -   Queue system (takes time to train).

## Phase 3: Combat Basics
- [ ] **Stats**: Add HP (Health Points) and Damage stats to Buildings and Troops.
- [ ] **HP Bars**: Visual health bars above units/buildings.
- [ ] **Defense**: Add **Cannon** building.
    -   Logic to detect enemies within range.
    -   Logic to fire projectiles.

## Phase 4: Enemy & Raiding
- [ ] **Enemy Spawning**: Ability to spawn enemy units on the map.
- [ ] **AI Targeting**:
    -   Units automatically find the nearest target.
    -   Move to target -> Attack -> Destroy -> Find Next Target.
- [ ] **Raid Mode**: A way to load a "Enemy Base" layout to attack (instead of your own home village).
