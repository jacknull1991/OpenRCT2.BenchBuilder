import { Settings } from "./utils";


const PRICE_BENCH = 50;
const PRICE_BIN = 30;
const PRICE_FENCE = 40;
const CASH_THRESHOLD = 1000;
const HAS_MONEY = !park.getFlag("noMoney");

type Path = {
    path: FootpathElement,
    x: number,
    y: number
};

type Paths = {
    flat: Path[],
    sloped: Path[]
};


// build benches functions
const canBuildOnSurface = (surface: SurfaceElement): Boolean => {
    if (!surface) return false;

    // ownership && construction right
    if (surface.hasOwnership || surface.hasConstructionRights) return true;

    return false;
}

const addAddition = (path: FootpathElement, addition: number, cost: number) => {
    if (path.addition !== addition || path.isAdditionBroken) {
        path.addition = addition;
        path.isAdditionBroken = false;
        path.isAdditionGhost = false;
        park.cash -= cost;
    }
}

/**
 * Build benches and bins on footpaths
 * @param settings 
 */
export const buildBenches = (settings: Settings) => {
    const paths: Paths = { flat: [], sloped: [] };

    if (HAS_MONEY && park.cash < CASH_THRESHOLD) {
        throw new Error("Make more money! (>$1000)");
    }

    // iterate all tiles on map
    for (let x = 0; x < map.size.x; x++) {
        for (let y = 0; y < map.size.y; y++) {
            const { elements } = map.getTile(x, y);
            // surface element has ownership tag of this tile
            const surface = elements.filter(e => {
                return e.type === "surface"
            })[0] as SurfaceElement;
            // footpath elements contains all footpaths on this tile
            const footpaths = elements.filter(e => {
                return e.type === "footpath"
            }) as FootpathElement[];

            if (canBuildOnSurface(surface)) {
                
                footpaths.forEach((path: FootpathElement) => {
                    // can build if footpath is not a queue/has no existing addition
                    if (!path.isQueue && path.addition === null) {
                        if (path.slopeDirection === null) {
                            paths.flat.push({ path, x, y});
                        } else {
                            paths.sloped.push({ path, x, y });
                        }
                    }
                });
            }
        }
    }

    // build benches&bins on flat paths
    paths.flat.forEach(({ path, x, y }) => {
        const { bench, bin } = settings;
        
        // bench:bin ratio ~ 9:1
        if (x%3 === y%3) {
            addAddition(path, bin, HAS_MONEY?PRICE_BIN:0);
        } else {
            addAddition(path, bench, HAS_MONEY?PRICE_BENCH:0);
        }
    });

    // build bins on sloped paths
    paths.sloped.forEach(({ path }) => {
        const { bin } = settings;
        addAddition(path, bin, HAS_MONEY?PRICE_BIN:0); 
    });
}

/**
 * Build Queue Line TV on queue paths
 */
export const buildQueueTVs = () => {

}

/**
 * Build fences around footpaths on ground level
 */
export const buildFences = () => {

}

/**
 * Park message greeting function 
 */ 
export const greeting = () => {
    park.postMessage("Greetings from Player");
}


