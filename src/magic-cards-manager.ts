import {getRelativeDistance, getScaledRect, isPointWithinRect} from './utils';
import {MagicCardComponent} from './magic-card.component';
import {Point} from './types';

interface AchievementCardsConfig {
    activeCardScale: number;
    maxRotateX: number;
    maxRotateY: number;
    perspective: number;
    scaleEasing: number;
    rotateEasing: number;
}

const defaultAchievementCardsConfig: AchievementCardsConfig = {
    activeCardScale: 1.8,
    maxRotateX: 20,
    maxRotateY: 20,
    perspective: 400,
    scaleEasing: 9,
    rotateEasing: 1,
};

export class MagicCardsManager {
    static instance: MagicCardsManager | undefined = undefined;

    private static _CONFIG: AchievementCardsConfig = defaultAchievementCardsConfig;

    static get ACTIVE_CARD_SCALE() {
     return this._CONFIG.activeCardScale;
    }
    static get MAX_X_ROTATE() {
        return this._CONFIG.maxRotateX;
    }
    static get MAX_Y_ROTATE() {
        return this._CONFIG.maxRotateY;
    }
    static get EASE_SCALE_FACTOR() {
        return this._CONFIG.scaleEasing;
    }
    static get EASE_ROTATE_FACTOR() {
        return this._CONFIG.rotateEasing;
    }
    static get PERSPECTIVE() {
        return this._CONFIG.perspective;
    }
    private _cards: MagicCardComponent[] = [];
    private _mousePt: Point = {x : 0, y: 0};
    private _currentActive: MagicCardComponent | undefined  = undefined;

    private animation: number | undefined;
    private unsubscribeAll: (() => void) | undefined = undefined;

    static configure(c: Partial<AchievementCardsConfig>) {
        this._CONFIG = {...defaultAchievementCardsConfig, ...c};
    }

    private constructor() {

    }

    resetCards() {
        this._cards.forEach((card, i) => {
            if (this._currentActive === card) {
                return;
            }
            card.tgAnimateState = {
                scale: 1,
                rotateX: 0,
                rotateY: 0,
            };
            card.isActive = false;
        });
    }

    initMoveListener() {
        this.animate();
        const callback = (event: MouseEvent) => {
            this.update(event);
        };
        addEventListener('mousemove', callback);
        this.unsubscribeAll = () => {
            removeEventListener('mousemove', callback);
            this.animation && cancelAnimationFrame(this.animation);
        };
    }

    update(event: MouseEvent) {
        this._mousePt = {x: event.clientX, y: event.clientY};
        this._currentActive = this.getCurrentActiveCard();
        this.resetCards();
        if (!this._currentActive) {
            return;
        }
        const cardBox = this._currentActive.rect;
        const cardCenter = this._currentActive.center;
        const activeBox = getScaledRect(cardBox, MagicCardsManager.ACTIVE_CARD_SCALE);
        if (isPointWithinRect(this._mousePt, activeBox)) {
            const xDist = cardCenter.x - this._mousePt.x;
            const yDist = cardCenter.y - this._mousePt.y;
            const rotateX = (yDist / (activeBox.height * 0.5)) * MagicCardsManager.MAX_X_ROTATE;
            const rotateY = -(xDist / (activeBox.width * 0.5)) * MagicCardsManager.MAX_Y_ROTATE;

            this._currentActive.tgAnimateState = {
                scale: MagicCardsManager.ACTIVE_CARD_SCALE,
                rotateX,
                rotateY,
            }
            this._currentActive.isActive = true;
        }
    }

    registerCard(card: MagicCardComponent) {
        this._cards = [...this._cards, card];
        if (this._cards.length === 1) {
            this.initMoveListener();
        }
    }

    unregisterCard(card: MagicCardComponent) {
        this._cards = this._cards.filter((c) => c !== card);
        if (!this._cards) {
            this.unsubscribeAll?.();
        }
    }

    findClosestCard() {
        let minDist = Infinity;
        let closestCard = this._cards[0];
        this._cards.forEach((card) => {
            const dist = getRelativeDistance(
                this._mousePt,
                card.center
            );
            if (dist < minDist) {
                minDist = dist;
                closestCard = card;
            }
        })
        return closestCard;
    }

    getCurrentActiveCard() {
        const mousePt = this._mousePt;
        const closestCard = this.findClosestCard();
        const cardBox = closestCard.rect;
        if (!this._currentActive) {
            if (isPointWithinRect(mousePt, cardBox)) {
                return closestCard;
            } else {
                return undefined;
            }
        } else {
            const activeCardBox = this._currentActive.rect;
            const curActiveRect = getScaledRect(
                activeCardBox,
                MagicCardsManager.ACTIVE_CARD_SCALE
            );
            if (isPointWithinRect(mousePt, curActiveRect)) {
                return this._currentActive;
            } else {
                if (isPointWithinRect(mousePt, cardBox)) {
                    return closestCard;
                } else {
                    return undefined;
                }
            }
        }
    }

    animate(): void {
        this._cards.forEach(card => {
            card.update();
        });
        this.animation = requestAnimationFrame(() => {
            this.animate();
        });
    }

    static getInstance(): MagicCardsManager {
        if (!MagicCardsManager.instance) {
            MagicCardsManager.instance = new MagicCardsManager();
        }
        return MagicCardsManager.instance;
    }
}

(window as any)['MagicCardsManager'] = MagicCardsManager;
