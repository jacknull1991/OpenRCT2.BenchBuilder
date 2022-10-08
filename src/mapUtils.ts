export class MapUtils {
  /**
   * Find insert index based on element height
   * @param tile 
   * @param height 
   * @returns 
   */
  static findElementPosition(tile: Tile, elementBaseHeight: number): number {
    let index = 0;
    while (index < tile.numElements && tile.getElement(index).baseHeight <= elementBaseHeight) {
      index++;
    }
    return index;
  }

  static insertTileElement(tile: Tile, height: number): BaseTileElement {
    const index = MapUtils.findElementPosition(tile, height);
    const element = tile.insertElement(index);
    // @ts-ignore
    // element._index = index;
    // element.baseHeight = height;
    return element;
  }

  static addWallElement(tile: Tile, object: number, baseHeight: number, 
                        height: number, direction: Direction, slope: Direction = 0) {
    //@ts-ignore
    const wall: WallElement = MapUtils.insertTileElement(tile, height);
    wall.type = "wall";
    wall.object = object;
    wall.baseHeight = baseHeight;
    wall.clearanceHeight = baseHeight + height;
    wall.direction = direction;
    wall.slope = slope;
    return wall;
  }



}
