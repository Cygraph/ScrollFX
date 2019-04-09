# ScrollFX
Version 0.9.5

#### ScrollFX is a jQuery based precise and configurable scroller. It allows JS and HTML notation

ScrollFX scrolls with tunable easing. It calculates the max scroll and has no scroll overhang. The scroll time can be defined by duration or speed. Any scrollable element can be scrolled. Default is window respectively html or body. A callback can be assigned.

**Easy use**
```
$.scrollfx( ".targetEl" );

$.scrollfx( ".targetEl", callback );

$.scrollfx( ".targetEl", 240, callback );

$.scrollfx({ to:"#TargetEl", speed:4, scrolled:callback, offset:40 });

$.scrollfx({ by:400, speed:4, scrolled:callback });


```

**Scroll element** is by default "body" or "html". Most browsers accept "body" as scroll port. Firefox only accepts "html". ScrollFX takes care of that. You can choose any other element as scroll port.
```
$( "#scrollEl" ).scrollfx( ".targetEl" );

// same as

$.scrollfx({ viewport:"#scrollEl", to:".targetEl" });


// this results all in the same (default):

$.scrollfx( ".targetEl" );

$( window ).scrollfx( ".targetEl" );

$( "html" ).scrollfx( ".targetEl" );

$( "body" ).scrollfx( ".targetEl" );

```

**HTML notation** Default trigger event is "click"
```
<button data-scrollfx="to:.targetEl,speed:4,offset:40">Target</button>

<div data-scrollfx="event:mouseover,to:.targetEl,scrolled:callback">Target</div>

```

**JS binding** the trigger and scrollfx via javascript in jQuery style. Arguments: options and as last argument the $.scrollfx function as callback.
```
$( ".button" ).click({to:".targetEl", speed:5}, $.scrollfx );

```
**JS registration** Finds elements with data-scrollfx attribute, attaches the event, 
stores the resulting object in the data-scrollfx attribute and adds the class name "scrollfx".
```
$.scrollfx.register();

// or

$( document ).ready( $.scrollfx.register );


```
**ScrollFX options**

- **viewport**: element (selector)
- **to**: number or element
- **by**: number or element
- **offset**: number
- **duration**: number (milliseconds)
- **speed**: number (px/millisecond)
- **useSpeed**: boolean
- **easing**: string
- **event**: string
- **scrolled**: function (callback)

**ScrollFX methods**

- **$.scrollfx.defaults( args... )**
- **$.scrollfx.register()**
- **$.scrollfx.data( triggerEl, args.. )**

**Easing** jQuerys default easing is: "swing". Further it provjdes "linear". If you want more easings, just notate the **"jq-easings.js"** from the "libs" folder in your html header via script tag. **"jq-easings.js"** is an extraction of 73 lines of code from the original jQ-UI-Library. So it's extremely lightweight. It offers each of the following easings in the three variations "In", "Out" and "InOut". Basic easings: Quad, Cubic, Quart, Quint, Expo, Sine, Circ, Elastic, Back and Bounce. All in all 30 additional easings :)
```
$.scrollfx({ to:"#TargetEl", speed:4, easing:"easeInOutQuad", scrolled:callback });


```

