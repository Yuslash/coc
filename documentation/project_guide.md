# Clash Clone - Project Guide

This document explains the structure of the project, what each file does, and how the game works. It is written in simple English to help you understand and modify the code later.

## 📂 Project Structure

The main code is inside the `src` folder. Here is what each folder contains:

- **`src/`**: The root folder for all source code.
    - **`components/`**: Contains the visual building blocks (React Components) of the game.
    - **`hooks/`**: Contains the "logic" or "brain" of the game (Custom Hooks).
    - **`db/`**: Contains JSON files for building stats and save data.
    - **`styles/`**: Contains CSS files for styling the game.
    - **`App.tsx`**: The main container for the application.
    - **`main.tsx`**: The entry point that starts React.

---

## 🧩 Components (Visuals)

Located in `src/components/`:

### 1. `World.tsx`
**The Game Engine.** This is the most important file.
- It renders the entire game world.
- It draws the **Grid** (using `Tile`).
- It draws the **Buildings** (using `Building`).
- It handles **User Interactions**:
    - Clicking tiles to place buildings.
    - Selecting buildings.
    - Moving buildings.
    - Pan and Zoom (dragging the map).
- It connects the "Visuals" (Components) with the "Logic" (Hooks).

### 2. `Tile.tsx`
**A Single Grid Square.**
- Renders one diamond-shaped isometric tile.
- Handles hover effects (lighting up when you point at it).
- Knows its coordinates `(x, y)`.

### 3. `Building.tsx`
**The Visual Building.**
- Renders a building (like Town Hall or Barracks).
- Uses **Isometric Math** to draw a 3D-looking box on the exact right spot.
- Handles different colors and sizes based on the building type.
- Ensures buildings are drawn *above* the grid so they don't look like they are sinking.

### 4. `BuildingMenu.tsx`
**The "Shop" Bar.**
- The menu at the bottom of the screen.
- Shows available buildings to buy.
- Allows you to select a building to place.

### 5. `BuildingActionMenu.tsx`
**The Selection Menu.**
- The popup menu that appears when you click a building.
- Contains buttons like "MOVE", "INFO", "TRAIN".
- Handles the logic for initiating a move or closing the menu.

### 6. `InfoModal.tsx`
**The Details Popup.**
-   Displays stats and info about a building (e.g., Level, HP).
-   Shows a visual preview of the building.
-   Appears when you click "INFO" in the Action Menu.

### 7. `TrainingModal.tsx`
**The Training Center.**
-   Appears when you click "TRAIN" on a Barracks.
-   Allows you to select troops to train.
-   Shows the training queue and progress.
-   Manages unit capacity (Army Camp space).

### 8. `WalkingUnit` (in `World.tsx`)
**The Animated Troop.**
-   A small colored circle representing a unit.
-   Moves from Barracks to Army Camp when training finishes.
-   Uses linear interpolation for smooth movement.

---

## 🧠 Hooks (Logic)

Located in `src/hooks/`:

### 1. `useBuildingSystem.ts`
**The Building Manager.**
- **`buildings`**: Stores the list of all placed buildings.
- **`placeBuilding`**: Logic to add a new building. Checks if the spot is free (collision detection) and if you have reached the limit (maxCount).
- **`checkCollision`**: Checks if a building overlaps with another or goes off the map.
- **`moveBuilding`**: Logic to update a building's position.
-   **`BUILDINGS` (Config)**: Loads building stats from `src/db/building_types.json`. **Edit that file to change stats!**

### 2. `usePanZoom.ts`
**The Camera Controller.**
- Handles the math for dragging the map (Panning).
- Handles the math for zooming in/out (Scaling).
- Returns the `transform` (x, y, scale) that `World.tsx` uses to move the view.

### 3. `useUnitSystem.ts`
**The Army Manager.**
-   **`units`**: Stores all stationed troops (Barbarians, Archers).
-   **`walkingUnits`**: Stores troops currently animating (walking).
-   **`trainingQueue`**: Manages units currently being trained.
-   **`addToQueue`**: Adds a unit to the training queue if capacity allows.
-   **Training Loop**: A background timer that processes the queue.
-   **Animation Loop**: Updates the position of walking units.

---

## 🎨 Styles

Located in `src/styles/`:

### 1. `Isometric.css`
**The Look and Feel.**
- Defines the 3D isometric look.
- Styles the UI overlays (menus, buttons, text).
- Handles "z-index" rules to ensure popups appear on top of the game.

---

## 🛠 How To...

### ...Add a New Building?
1.  Open `src/db/building_types.json`.
2.  Add a new entry, for example:
    ```json
    "GoldMine": { "width": 1, "height": 1, "color": "#f1c40f", "maxCount": 3 }
    ```
3.  Open `src/hooks/useBuildingSystem.ts` and update `BuildingType` to include `'GoldMine'` (if not automatically inferred, though currently it is `keyof typeof BUILDINGS` so it might just work if typed correctly, but safe to say checking the type definition).

### ...Change the Grid Size?
1. Open `src/components/World.tsx` (and `useBuildingSystem.ts`).
2. Change `const GRID_SIZE = 20;` to your desired size (e.g., 30).
3. Update specific rendering logic in `Building.tsx` or `Tile.tsx` if you change tile size. (Tile size is controlled in `Isometric.css` variables, but currently hardcoded in TSX for math).

### ...Add a New Action Button?
1. Open `src/components/BuildingActionMenu.tsx`.
2. Add a new `<button>` in the JSX.
3. Add a wrapper function for the logic (e.g., `onUpgrade`).
4. Update `World.tsx` to handle that action when the button is clicked.
