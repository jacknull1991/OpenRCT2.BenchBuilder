// export const isHandyman = (staff: Staff): boolean => staff.staffType === 'handyman';
// export const isMechanic = (staff: Staff): boolean => staff.staffType === 'mechanic';
// export const isSecurity = (staff: Staff): boolean => staff.staffType === 'security';
// export const isEntertainer = (staff: Staff): boolean => staff.staffType === 'entertainer';

// export const getHandymen = (): Staff[] => map.getAllEntities('staff').filter(isHandyman);
// export const getMechanics = (): Staff[] => map.getAllEntities('staff').filter(isMechanic);
// export const getSecurity = (): Staff[] => map.getAllEntities('staff').filter(isSecurity);
// export const getEntertainers = (): Staff[] => map.getAllEntities('staff').filter(isEntertainer);

type ClickEventHandler = () => void;

export const Button = (text: string, x: number, y: number, width: number, height: number, onClick: ClickEventHandler): ButtonWidget => {
    return {
        type: "button",
        text,
        x,
        y,
        width,
        height,
        onClick
    };
}

const BENCH_SELECTION = "BENCHBUILDER.BENCH";
const BIN_SELECTION = "BENCHBUILDER.BIN";

type Selections = {
    bench: number,
    bin: number
}

export class Settings {
    benches: LoadedObject[];
    bins: LoadedObject[];

    constructor(objs: LoadedObject[]) {
        this.benches = objs.filter(obj => obj.identifier.includes("bench"));
        this.bins = objs.filter(obj => obj.identifier.includes("litter"));
    }

    // get saved selections
    get selections(): Selections {
        const currentBench = context.sharedStorage.get(BENCH_SELECTION, 0);
        const currentBin = context.sharedStorage.get(BIN_SELECTION, 0);
        return { bench: currentBench, bin: currentBin };
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
}
