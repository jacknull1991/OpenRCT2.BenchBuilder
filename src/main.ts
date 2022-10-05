import { Button, Settings } from "./utils";
import { buildBenches, buildQueueTVs, buildFences, greeting } from "./actions";

const main = (): void => {
  console.log(`Hello stranger! Your plug-in has started!`);

  // console.log(
  //   `In your park, there are currently ${map.getAllEntities('guest').length + map.getAllEntities('staff').length} peeps`
  // );
  // console.log(`${map.getAllEntities('staff').length} of them is your staff.`);

  // console.log('Your staff consists of:');
  // console.log(`- ${getHandymen().length} handymen`);
  // console.log(`- ${getMechanics().length} mechanics`);
  // console.log(`- ${getSecurity().length} security`);
  // console.log(`- ${getEntertainers().length} entertainers`);

  const name = "BenchBuilder";

  const additions = context.getAllObjects("footpath_addition");
  const settings = new Settings(additions);

  ui.registerMenuItem(name, () => {
    // open a window
    const window = ui.openWindow({
      classification: name,
      width: 200,
      height: 140,
      title: name,
      id: 1,
      widgets: [
        // button1
        Button("Build Benches & Bins", 20, 20, 160, 20, ()=>{
          try {
            buildBenches(settings);
          } catch (error) {
            ui.showError("Error Building Benches & Bins", (error as Error).message);
          } finally {
            window.close();
          }
        }),
        // button2
        Button("Build Queue Line TVs", 20, 60, 160, 20, ()=>{
          try {
            buildQueueTVs();
          } catch (error) {
            ui.showError("Error Building TVs", (error as Error).message);
          } finally {
            window.close();
          }
        }),
        // button3
        Button("Build Fences", 20, 100, 160, 20, ()=>{
          try {
            buildFences();
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
