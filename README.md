# ScrollFX
Version 1.0.1

#### ScrollFX is a jQuery based precise and configurable scroller. It allows JS and HTML notation

ScrollFX scrolls with tunable easing. It calculates the max scroll and has no scroll overhang. The scroll time can be defined by duration or speed. Any scrollable element can be scrolled. Default is window respectively html or body. A callback can be assigned.

**Easy use**
```
$.scrollfx( ".targetEl" );

$.scrollfx( ".targetEl", callback );

$.scrollfx( ".targetEl", 240, callback );

$.scrollfx({ to:"#TargetEl", speed:4, callback:callback, offset:40 });

$.scrollfx({ by:400, speed:4, callback:callback });


```

**Scroll element** is by default "body" or "html". But you can choose any other element.
```
$( "#scrollEl" ).scrollfx( ".targetEl" );


// this results all in the same (default):

$.scrollfx( ".targetEl" );

$( window ).scrollfx( ".targetEl" );

$( "html" ).scrollfx( ".targetEl" );

$( "body" ).scrollfx( ".targetEl" );

```

**HTML notation** Default trigger event is "click"
```
<button data-scrollfx="to:.targetEl,speed:4,offset:40">Target</button>

<div data-scrollfx="event:mouseover,to:.targetEl,callback:myhandler">Target</div>


```
**JS registration** Finds elements with data-scrollfx attribute, attaches the event, 
stores the resulting object in the data-scrollfx attribute and adds the class name "scrollfx".
```
$.scrollfx.register();

// better

$( document ).ready( $.scrollfx.register );


```