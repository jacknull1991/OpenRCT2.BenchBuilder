
type ClickEventHandler = () => void;
type ChangeEventHandler<Value> = (value: Value) => void;
type DropDownValues = {
  name: string,
  legacyIdentifier: string
};

export const Button = (text: string, x: number, y: number, width: number, height: number,
  onClick: ClickEventHandler): ButtonWidget => {
  return {
    type: "button",
    text,
    x,
    y,
    width,
    height,
    onClick
  };
};

export const DropDown = (text: string, x: number, y: number, width: number, height: number,
  selectedIndex: number, values: DropDownValues[], onChange: ChangeEventHandler<number>
): [LabelWidget, DropdownWidget] => {

  const items = values.map(v => `${v.name} | ${v.legacyIdentifier}`);
  return [
    {
      type: "label",
      x,
      y,
      width: 60,
      height,
      text
    }, {
      type: "dropdown",
      x: x + 60,
      y,
      width: width - 60,
      height: height + 5,
      items,
      selectedIndex,
      onChange
    }
  ];
};

const BENCH_SELECTION = "BENCHBUILDER.BENCH";
const BIN_SELECTION = "BENCHBUILDER.BIN";
const WALL_SELECTION = "BENCHBUILDER.WALL";

type Selections = {
  bench: number,
  bin: number,
  wall: number
};

export class Settings {
  benches: LoadedObject[]; // list of available benches
  bins: LoadedObject[];    // list of available bins
  walls: LoadedObject[];   // list of available fence walls
  prices: {[index: number]: number}; // index:price dictionary

  constructor(adds: LoadedObject[], walls: LoadedObject[]) {
    this.benches = adds.filter(obj => obj.identifier.includes("bench"));
    this.bins = adds.filter(obj => obj.identifier.includes("litter"));
    // filter out items under scenary group 'Walls and Roofs'
    this.walls = walls.filter(obj => !obj.identifier.includes(".wall"));
    this.prices = [];
    this.benches.forEach(obj => this.prices[obj.index] = 50);
    this.bins.forEach(obj => this.prices[obj.index] = obj.index===2?30:40);
  }

  // get saved selections
  get selections(): Selections {
    const currentBench = context.sharedStorage.get(BENCH_SELECTION, 0);
    const currentBin = context.sharedStorage.get(BIN_SELECTION, 0);
    const currentWall = context.sharedStorage.get(WALL_SELECTION, 0);
    return { bench: currentBench, bin: currentBin, wall: currentWall };
  }

  // bench type
  get bench(): number {
    return this.benches[this.selections.bench].index;
  }

  set bench(index: number) {
    context.sharedStorage.set(BENCH_SELECTION, index);
  }

  // bin type
  get bin(): number {
    return this.bins[this.selections.bin].index;
  }

  set bin(index: number) {
    context.sharedStorage.set(BIN_SELECTION, index);
  }

  // wall type
  get wall(): number {
    return this.walls[this.selections.wall].index;
  }

  set wall(index: number) {
    context.sharedStorage.set(WALL_SELECTION, index);
  }

  get isBenchReady(): boolean {
    return this.bench !== null;
  }

  get isBinReady(): boolean {
    return this.bin !== null;
  }

  get isWallReady(): boolean {
    return this.wall !== null;
  }
};

export const queryExecuteAction = (type: ActionType, args: object, callback: (result: GameActionResult) => void): void => {
  context.queryAction(type, args, (queryResult) => {
    if (!queryResult.error) {
      context.executeAction(type, args, callback);
    }
  });
}
