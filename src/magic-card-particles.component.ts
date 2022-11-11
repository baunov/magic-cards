interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    alpha: number;
    phase: number;
}

function randomArrayItem<T = any>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomNumFrom(min: number, max: number): number {
    return Math.random()*(max - min) + min;
}

function randomSidePos(length: number){
    return Math.ceil(Math.random() * length);
}

type Pos = 'top' | 'right' | 'bottom' | 'left';

function getRandomSpeed(pos: 'top' | 'right' | 'bottom' | 'left'): [number, number] {
    let min = -0.2;
    let max = 0.2;
    switch(pos){
        case 'top':
            return [randomNumFrom(min, max), randomNumFrom(0.1, max)];
        case 'right':
            return [randomNumFrom(min, -0.1), randomNumFrom(min, max)];
        case 'bottom':
            return [randomNumFrom(min, max), randomNumFrom(min, -0.1)];
        case 'left':
            return [randomNumFrom(0.1, max), randomNumFrom(min, max)];
    }
}

const tmpl = document.createElement('template');
tmpl.innerHTML = `
    <style>
    :host {
        position: absolute;
        z-index: 100;
    }
    </style>
    <canvas></canvas>
`;

export class MagicCardParticlesComponent extends HTMLElement {
    static get observedAttributes() {
        return ['width', 'height', 'count', 'playing'];
    }

    private ball_color = {
        r: 227,
        g: 255,
        b: 220
    };
    private R = 1;
    private alpha_f = 0.01;
    private balls: Ball[] = [];

    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;

    private _animationFrame?: number;
    private _isPlaying = false;

    set playing(value: boolean) {
        if (value) {
            this.setAttribute('playing', '');
        } else {
            this.removeAttribute('playing');
        }
    }
    get playing() {
        return this.hasAttribute('playing');
    }

    set count(value: number) {
        this.setAttribute('count', `${value ?? 0}`);
    }
    get count(): number {
        const value = this.getAttribute('count');
        return value ? parseFloat(value) : 0;
    }

    set width(value: number) {
        this.setAttribute('width', `${value ?? 0}`);
    }
    get width(): number {
        const value = this.getAttribute('width');
        return value ? parseFloat(value) : 0;
    }
    set height(value: number) {
        this.setAttribute('height', `${value ?? 0}`);
    }
    get height(): number {
        const value = this.getAttribute('height');
        return value ? parseFloat(value) : 0;
    }

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot!.appendChild(tmpl.content.cloneNode(true));
        this.canvas = this.shadowRoot!.querySelector('canvas')!;
        this.ctx = this.canvas.getContext('2d')!;
    }

    start(): void {
        if (this._isPlaying) {
            return;
        }
        this.balls = [];
        this.initBalls(this.count);
        this._animationFrame = requestAnimationFrame(() => this.render());
        this._isPlaying = true;
    }

    stop(): void {
        if (!this._isPlaying) {
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this._animationFrame && cancelAnimationFrame(this._animationFrame);
        this.balls = [];
        this._isPlaying = false;
    }

    private renderBalls() {
        this.balls.forEach((b) => {
            if(!b.hasOwnProperty('type')){
                this.ctx.fillStyle = 'rgba('+this.ball_color.r+','+this.ball_color.g+','+this.ball_color.b+','+b.alpha+')';
                this.ctx.beginPath();
                this.ctx.arc(b.x, b.y, b.r, 0, Math.PI*2, true);
                this.ctx.closePath();
                this.ctx.fill();
            }
        });
    }

    private initBalls(num: number){
        for(let i = 0; i < num; i++){
            this.balls.push({
                x: randomSidePos(this.canvas.width),
                y: randomSidePos(this.canvas.height),
                vx: getRandomSpeed('top')[0],
                vy: getRandomSpeed('top')[1],
                r: randomNumFrom(1,2.5),
                alpha: 0.3,
                phase: randomNumFrom(0, 10)
            });
        }
    }

    private updateBalls(){
        const new_balls: Ball[] = [];
        this.balls.forEach((b) => {
            b.x += b.vx;
            b.y += b.vy;

            if(b.x > -(50) && b.x < (this.canvas.width+50) && b.y > -(50) && b.y < (this.canvas.height+50)){
                new_balls.push(b);
            }

            // alpha change
            b.phase += this.alpha_f;
            b.alpha = Math.abs(Math.cos(b.phase)) * 0.3;
        });

        this.balls = [...new_balls];
    }

    private getRandomBall(): Ball {
        const pos: Pos = randomArrayItem(['top', 'right', 'bottom', 'left']);
        switch(pos){
            case 'top':
                return {
                    x: randomSidePos(this.canvas.width),
                    y: -this.R,
                    vx: getRandomSpeed('top')[0],
                    vy: getRandomSpeed('top')[1],
                    r: randomNumFrom(1,2.5),
                    alpha: 1,
                    phase: randomNumFrom(0, 10)
                }
            case 'right':
                return {
                    x: this.canvas.width + this.R,
                    y: randomSidePos(this.canvas.height),
                    vx: getRandomSpeed('right')[0],
                    vy: getRandomSpeed('right')[1],
                    r: randomNumFrom(1,2.5),
                    alpha: 1,
                    phase: randomNumFrom(0, 10)
                }
            case 'bottom':
                return {
                    x: randomSidePos(this.canvas.width),
                    y: this.canvas.height + this.R,
                    vx: getRandomSpeed('bottom')[0],
                    vy: getRandomSpeed('bottom')[1],
                    r: randomNumFrom(1,2.5),
                    alpha: 1,
                    phase: randomNumFrom(0, 10)
                }
            case 'left':
                return {
                    x: -this.R,
                    y: randomSidePos(this.canvas.height),
                    vx: getRandomSpeed('left')[0],
                    vy: getRandomSpeed('left')[1],
                    r: randomNumFrom(1,2.5),
                    alpha: 1,
                    phase: randomNumFrom(0, 10)
                }
        }
    }

    private render(){
        if (!this.canvas) {
            this._animationFrame = requestAnimationFrame(() => this.render());
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.renderBalls();
        this.updateBalls();
        this.addBallIfy();
        this._animationFrame = requestAnimationFrame(() => this.render());
    }

    connectedCallback() {
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        if (this.canvas && name === 'width') {
            this.canvas.width = this.width;
        }
        if (this.canvas && name === 'height') {
            this.canvas.height = this.height;
        }
        if (name === 'playing') {
            if (this.playing) {
                this.start();
            } else {
                this.stop();
            }
        }
    }


    private addBallIfy(){
        if(this.balls.length < this.count){
            this.balls.push(this.getRandomBall());
        }
    }
}

customElements.define('x-magic-card-particles', MagicCardParticlesComponent);
