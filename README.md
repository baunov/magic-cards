# magic-cards

Turn any webpage element into a 3D magic card.

https://user-images.githubusercontent.com/54023692/201338672-091e5c71-dd00-4569-bea5-14a41fb95fe5.mov

The package includes 2 custom web components that can be used in any web page independent of framework (also without any framework):

1. `<x-magic-card>`
2. `<x-magic-card-particles>`

## Basic usage

1. Wrap page elements you wish to turn into 3d card with `<x-magic-card></x-magic-card>`.
2. Assign background to card by setting `slot="background"` on the wrapped element.
3. Assign content to card by setting `slot="content"` on the wrapped element.
4. Optionally add `<x-magic-card-particles count="20"></x-magic-card-particles>` within a card if you'd like to add particles.

Example:
```
<x-magic-card radius="4">
    <div slot="content">
        <x-magic-card-particles count="20"></x-magic-card-particles>
    </div>
    <div slot="background" style="overflow: hidden; width: 120px; height: 140px; display: flex; justify-content: center">
        <img height="140" src="https://static0.gamerantimages.com/wordpress/wp-content/uploads/2022/04/the-witcher-3-dlc-ballad-heroes-geralt-gwent-hand.jpg">
    </div>
</x-magic-card>
```

## Configuration

Cards are configured globally. When `magic-cards` module is installed on the page, it sets the `MagicCardsManager` property on window.
To configure cards behavior, call `MagicCardsManager.configure(<configuration object>)` after script is loaded.

Example: 
```
MagicCardsManager.configure({
    activeCardScale: 1.8,
    maxRotateX: 20,
    maxRotateY: 20,
    perspective: number;
    scaleEasing: number;
    rotateEasing: number;
})
```

## Parameters:

### x-magic-card
1. `radius` - card border radius
2. `disabled` - sets card to be non-interactive and greyed-out

### x-magic-card
1. `count` - particles count

## Reacting on card activation and styling

When a card becomes active, it sets `active` attribute on itself. That way you can set styles for slotted elements using `x-magic-card[active]` css selector.
The card shadow DOM wrapper element can also be styled (e.g. add a border to the card) using css `x-magic-card::part(card-container)` selector.

Example:
```
x-magic-card[active] .card-title {
    color: red;
}

x-magic-card::part(card-container) {
    border: 1px solid rgba(255,255,255,0.3);
    background: black;
}
```

## Listening to activation changes in JS:

You can listen to a custom event `active-change` on each card or on the parent. `event.detail` is boolean stating whether the given card is active.
This event bubbles.

```
document.querySelector('.cards-container').addEventListener('active-change', (event) => {
    console.log(event.target, event.detail);
    if (event.detail) {
        console.log('Card active', event.target);
    } else {
        console.log('Card inactive', event.target);
    }
});
```

### P.S. Hope you'll like the effect

