import {MagicCardsManager} from './magic-cards-manager';
import {CardAnimateData} from './types/animate-data';
import {Point} from './types';
import {MagicCardParticlesComponent} from './magic-card-particles.component';

const tmpl = document.createElement('template');
tmpl.innerHTML = `
    <style>
    :host {
        display: inline-block;
    }
    :host .card-wrapper {
        perspective: 400px;
        transform-style: preserve-3d;
        perspective-origin: center center;
        display: inline-block;
        backface-visibility: hidden;
       
    }
    :host .magic-card {
        transform-style: preserve-3d;
        user-select: none;
        position: relative;
        overflow: hidden;
        will-change: transform;
        backface-visibility: hidden;
    }
    
    :host .magic-card-content {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 100%;
        width: 100%;
        z-index: 100;
    }
    </style>
    <div class="card-wrapper">
        <div class="magic-card" part="card-container">
            <div class="magic-card-content">
                <slot name="content"></slot>
            </div>
            <div class="magic-card-background">
                <slot name="background"></slot>
            </div>
        </div>
    </div>
`;

type CardCEInputs = 'disabled';

export class MagicCardComponent extends HTMLElement {
    cardElem!: HTMLDivElement;
    cardBackground!: HTMLDivElement;
    backgroundContent!: HTMLElement;
    canvas!: HTMLCanvasElement;
    private curAnimateState: CardAnimateData = {
        rotateX: 0,
        rotateY: 0,
        scale: 1
    };
    tgAnimateState: CardAnimateData = {
        ...this.curAnimateState
    };

    particles: MagicCardParticlesComponent | null = null;

    private _center!: Point;
    get center(): Point {
        return this._center;
    }

    private _rect!: DOMRect;
    get rect(): DOMRect {
        return this._rect;
    }

    static get observedAttributes() {
        return ['disabled', 'card-class'];
    }

    set cardClass(cardClass: string) {
        this.setAttribute('card-class', cardClass);
    }
    get cardClass() {
        return this.getAttribute('card-class') ?? '';
    }

    set radius(radius: number) {
        this.setAttribute('radius', `${radius ?? 0}`);
    }
    get radius(): number {
        const radius = this.getAttribute('radius');
        return radius ? parseFloat(radius) : 0;
    }

    set isActive(isActive: boolean) {
        if (isActive === this._isActive) {
            return;
        }
        this.dispatchEvent(new CustomEvent('active-change', {
            bubbles: true,
            cancelable: false,
            detail: isActive
        }));
        if (isActive) {
            this.setAttribute('active', '');
            this.particles?.start();
        } else {
            this.removeAttribute('active');
            this.particles?.stop();
        }
        this._isActive = isActive;
        this.style.zIndex = isActive ? '100' : '1';
    };
    get isActive(): boolean {
        return this._isActive;
    }
    _isActive = false;

    get disabled() {
        return this.hasAttribute('disabled');
    }

    set disabled(val) {
        if (val) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot!.appendChild(tmpl.content.cloneNode(true));

        this.cardElem = this.shadowRoot!.querySelector('.magic-card')!;
        this.cardBackground = this.shadowRoot!.querySelector('.magic-card-background')!;
    }

    update(): void {
        this.cardElem.style.borderRadius = `${this.radius ?? 0}px`;
        if (this.disabled) {
            this.cardElem.style.filter = `saturate(0)`;
            return;
        }
        this.updateRectAndCenter(this.getBoundingClientRect());
        this.particles = this.querySelector('x-magic-card-particles');
        if (this.particles) {
            this.particles.width = this._rect.width;
            this.particles.height = this._rect.height;
        }

        const cur = this.curAnimateState;
        const tg = this.tgAnimateState;
        cur.scale += (tg.scale - cur.scale) / MagicCardsManager.EASE_SCALE_FACTOR;
        cur.rotateX += (tg.rotateX - cur.rotateX) / MagicCardsManager.EASE_ROTATE_FACTOR;
        cur.rotateY += (tg.rotateY - cur.rotateY) / MagicCardsManager.EASE_ROTATE_FACTOR;
        this.applyEffects(cur);
    }

    private applyEffects(cur: CardAnimateData): void {
        this.cardElem.style.transform = `translateZ(
            ${(cur.scale - 1) * (MagicCardsManager.PERSPECTIVE / cur.scale)}px) rotateX(${cur.rotateX}deg) rotateY(${cur.rotateY}deg
        ) translateX(${-cur.rotateY}px) translateY(${-cur.rotateX}px)`;
        if (this.cardBackground) {
            this.cardBackground.style.transform = `
                translateX(${-(cur.rotateY * 0.7)}px) translateY(${(cur.rotateX * 0.7)}px) scale(1.2)
            `;
        }
        this.cardElem.style.boxShadow = `0 ${cur.scale * 10 - 10}px ${(cur.scale - 0.4) * 5}px rgba(0,0,0,${cur.scale * 0.2})`;
        if (this.isActive) {
            this.cardElem.style.filter = `saturate(100%) brightness(
                ${((cur.rotateX + MagicCardsManager.MAX_X_ROTATE) / MagicCardsManager.MAX_X_ROTATE) + 0.4 * 0.8}
            )`;
        } else {
            this.cardElem.style.filter = `saturate(90%)`;
        }
    }

    private updateRectAndCenter(rect: DOMRect): void {
        this._rect = rect;
        this._center = {
            x: this._rect.left + this._rect.width * 0.5,
            y: this._rect.top + this._rect.height * 0.5
        };
    }

    connectedCallback() {
        console.log('Connected');
        MagicCardsManager.getInstance().registerCard(this);
        this.updateRectAndCenter(this.cardElem.getBoundingClientRect());
        /*this.cardElem!.addEventListener('slotchange', e => {
            const slot: HTMLSlotElement = e.target as HTMLSlotElement;
            if (slot.name == 'item') {
                this.backgroundContent = slot.assignedElements().find((elem) => {
                    elem.
                });
                alert("Items: " + this.items);
            }
        });*/
    }

    private updateBackgroundSlotContent(): void {
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        console.log('attributeChangedCallback', {name, oldValue, newValue});
        if (name === 'card-class') {
            if (oldValue) {
                this.cardElem!.classList.remove(oldValue)
            }
            if (newValue) {
                this.cardElem!.classList.add(this.cardClass);
            }
        }
    }

    disconnectedCallback() {
        MagicCardsManager.getInstance().unregisterCard(this);
    }
}

customElements.define('x-magic-card', MagicCardComponent);
