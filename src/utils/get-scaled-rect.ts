import {Rect} from '../types';

export function getScaledRect(rect: Rect, multiplier: number = 1): Rect {
    const halfWidth = rect.width * multiplier * 0.5;
    const halfHeight = rect.height * multiplier * 0.5;
    const centerX = rect.left + rect.width * 0.5;
    const centerY = rect.top + rect.height * 0.5;
    return multiplier === 1 ? rect : {
        left: centerX - halfWidth,
        top: centerY - halfHeight,
        right: centerX + halfWidth,
        bottom: centerY + halfHeight,
        width: rect.width * multiplier,
        height: rect.height * multiplier
    };
}
