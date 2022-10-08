import { Button, DropDown, Settings } from "./utils";
import { buildBenches, repairAdditions, buildFences } from "./actions";

const main = (): void => {
  const name = "Bench Builder";

  const additions = context.getAllObjects("footpath_addition");
  const walls = context.getAllObjects("wall");
  const settings = new Settings(additions, walls);

  ui.registerMenuItem(name, () => {
    // open a window
    const window = ui.openWindow({
      classification: name,
      width: 300,
      height: 180,
      title: name,
      id: 1,
      widgets: [
        // select Bench
        ...DropDown("Bench:", 20, 20, 260, 10,
          settings.selections.bench, settings.benches, (index: number) => {
            settings.bench = index;
          }),
        // select bin
        ...DropDown("Trash Bin:", 20, 40, 260, 10,
          settings.selections.bin, settings.bins, 
          (index: number) => {
            settings.bin = index;
          }),
        Button("Build benches & bins", 20, 60, 260, 20, 
          () => {
            try {
              buildBenches(settings);
            } catch (error) {
              ui.showError("Error Building Benches & Bins", (error as Error).message);
            } finally {
              window.close();
            }
          }),
        Button("Repair broken additions", 20, 90, 260, 20,
          () => {
            try {
              repairAdditions(settings);
            } catch (error) {
              ui.showError("Error repairing additions", (error as Error).message);
            } finally {
              window.close();
            }
          }),
        // select walls
        ...DropDown("Walls", 20, 120, 260, 10,
          settings.selections.wall, settings.walls, (index: number) => {
            settings.wall = index;
          }),
        Button("Build walls on footpaths", 20, 140, 260, 20, () => {
          try {
            buildFences(settings);
          } catch (error) {
            ui.showError("Error Building Fences", (error as Error).message);
          } finally {
            window.close();
          }
        }),
      ]
    });
  });
};

export default main;
