import {Point} from '../types';

export function getRelativeDistance(pt1: Point, pt2: Point): number {
    const xDist = pt2.x - pt1.x;
    const yDist = pt2.y - pt1.y;
    return xDist * xDist + yDist * yDist;
}
