import { Settings, queryExecuteAction } from "./utils";


const PRICE_BENCH = 50;
const PRICE_BIN = 30;
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

// const isPathOnSurface = (pathSlope: number | null, surfaceSlope: number): Boolean => {
//   if (pathSlope === null && surfaceSlope === 0) return true;
//   if (pathSlope === 0 && surfaceSlope === 0b1100) return true;
//   if (pathSlope === 1 && surfaceSlope === 0b1001) return true;
//   if (pathSlope === 2 && surfaceSlope === 0b0011) return true;
//   if (pathSlope === 3 && surfaceSlope === 0b0110) return true;
//   return false;
// }

// const getWallSlope = (wallDirection: Direction, slope: number): Direction => {
//   // if (wallDirection === 0) {
//   //   if ((slope&8) === (slope&4)) return 0;
//   //   else if ((slope&8) > (slope&4)) return 1;
//   //   else  return 2;
//   // } else if (wallDirection === 1) {
//   //   if ((slope&4) === (slope&2)) return 0;
//   //   else if ((slope&4) < (slope&2)) return 1;
//   //   else return 2;
//   // } else if (wallDirection === 2) {
//   //   if (((slope>>1)&1) === (slope&1)) return 0;
//   //   else if (((slope>>1)&1) > (slope&1)) return 1;
//   //   else return 2;
//   // } else if (wallDirection === 3) {
//   //   if ((slope&1) === (slope&8)) return 0;
//   //   else if ((slope&1) < (slope&8)) return 1;
//   //   else return 2;
//   // }
//   return 0;
// }

const addAddition = (path: FootpathElement, addition: number, cost: number) => {
  if (park.cash < cost) throw new Error("Not enough cash");
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
              paths.flat.push({ path, x, y });
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

    //bench:bin ratio ~ 9:1
    if (x % 3 === y % 3) {
      addAddition(path, bin, HAS_MONEY ? PRICE_BIN : 0);
    } else {
      addAddition(path, bench, HAS_MONEY ? PRICE_BENCH : 0);
    }
  });

  // build bins on sloped paths
  paths.sloped.forEach(({ path }) => {
    const { bin } = settings;
    addAddition(path, bin, HAS_MONEY ? PRICE_BIN : 0);
  });

  return paths;
}

/**
 * Repair all broken additions
 */
export const repairAdditions = (settings: Settings) => {
  const paths: FootpathElement[] = [];
  for (let x = 0; x < map.size.x; x++) {
    for (let y = 0; y < map.size.y; y++) {
      const { elements } = map.getTile(x, y);
      const footpaths = elements.filter(e => {
        return e.type === "footpath"
      }) as FootpathElement[];

      footpaths.forEach((path: FootpathElement) => {
        if (path.addition !== null && path.isAdditionBroken) {
          paths.push(path);
        }
      });
    }
  }

  paths.forEach((path) => {
    path.isAdditionBroken = false;
    path.isAdditionGhost = false;
    if (settings.prices[path.addition!]) {
      park.cash -= settings.prices[path.addition!];
    }
  });

}


type wallplaceActionArg = {
  flag: number,
  x: number,  // worldCoordX
  y: number,  // worldCoordY
  z: number,  // surface baseZ
  object: number, // object index
  edge: number, // wall edge: 0,1,2,3=>L,T,R,B
  primaryColour: number,
  secondaryColour: number,
  tertiaryColour: number
}
/**
 * Build fences around footpaths on ground level
 */
export const buildFences = (settings: Settings) => {
  const actionArgObjs: wallplaceActionArg[] = [];
  for (let x = 0; x < map.size.x; x++) {
    for (let y = 0; y < map.size.y; y++) {
      let currentTile: Tile = map.getTile(x, y);
      const elements = currentTile.elements;

      // surface element
      const surface = elements.filter(e => {
        return e.type === "surface"
      })[0] as SurfaceElement;

      // footpath elements
      const footpaths = elements.filter(e => {
        return e.type === "footpath"
      }) as FootpathElement[];

      // check if any wall exists
      // 0,1,2,3 => L,T,R,B
      const walls = (elements.filter(e => {
        return e.type === 'wall' && e.baseHeight === surface.baseHeight
      }) as WallElement[]).map(e => e.direction); 
      const z = surface.baseZ;
      //--------------------------------
      // walls.forEach(w=>console.log(w));
      //--------------------------------
      if (surface !== null && surface.hasOwnership) {
        footpaths.forEach((path: FootpathElement) => {
          if (path.baseHeight === surface.baseHeight && path.slopeDirection === null && surface.slope === 0) {

            if (walls.indexOf(0) === -1 && (path.edges & 1) === 0) {
              actionArgObjs.push({
                flag:0, x:x*32, y:y*32, z, object:settings.wall, 
                edge:0, primaryColour: 0, secondaryColour: 0, tertiaryColour: 0});
            }
            if (walls.indexOf(1) === -1 && (path.edges & 8) === 0) {
              actionArgObjs.push({
                flag:0, x:x*32, y:y*32, z, object:settings.wall, 
                edge:1, primaryColour: 0, secondaryColour: 0, tertiaryColour: 0});
            }
            if (walls.indexOf(2) === -1 && (path.edges & 4) === 0) {
              actionArgObjs.push({
                flag:0, x:x*32, y:y*32, z, object:settings.wall, 
                edge:2, primaryColour: 0, secondaryColour: 0, tertiaryColour: 0});
            }
            if (walls.indexOf(3) === -1 && (path.edges & 2) === 0) {
              actionArgObjs.push({
                flag:0, x:x*32, y:y*32, z, object:settings.wall, 
                edge:3, primaryColour: 0, secondaryColour: 0, tertiaryColour: 0});
            }
          }
        });
      }
    }
  }

  actionArgObjs.forEach(arg => {
    queryExecuteAction("wallplace", arg, ()=>{});
  });
}



