import {Point} from '../types';
import {Rect} from '../types';

export function isPointWithinRect(pt: Point, rect: Rect): boolean {
    return pt.x > rect.left
        && pt.x < rect.right
        && pt.y > rect.top
        && pt.y < rect.bottom;
}
