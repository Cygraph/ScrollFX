# ScrollFX
Version 1.0.1

#### ScrollFX is a jQuery based precise and configurable scroller. It allows JS and HTML notation.



**Easy use**
```
$.scrollfx( ".targetEl" );

$.scrollfx( ".targetEl", callback );

$.scrollfx( ".targetEl", 240, callback );

$.scrollfx({ to:"#TargetEl", speed:4, callback:callback, offset:40 });

$.scrollfx({ by:400, speed:4, callback:callback });


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