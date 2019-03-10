/*
Plugin: vscroll.js
Needed scripts: jquery-3.2.1.js
Globals: none
Designer: © Michael Schwarz, CyDot
Version: 0.5.4
Updated: 2019-02-21

Log:

0.5.1:  Duration / speed selection corrected
0.5.2:  "onscroll" event, "bind " for handler function
0.5.3:  removed "onscroll" event. Added $.vscroll.onscroll callback
*/

( function ( $ ){
    
    var $win = $( window ),
    $body;
    
    $.fn.vscroll = function ( options ) {
        var $el = $( this );
        
        setup( $el, options );
        return $el;
    };
    
    $.vscroll = function ( options ) {
        var opts = $.extend( {}, $.vscroll.defaults, options );
        
        if ( options.speed ) opts.duration = null;
        else if ( options.duration ) opts.speed = null;
        vscroll( opts );
    };
    
    $.vscroll.defaults = {
        event: "click",
        easing: "swing",
        speed: 3,          // speed: px / ms
        duration: null,    // duration: ms
        offset: 0
    };
    // Default is the use of "speed".
    // The last setting counts. If it's "duration", duration will be used
    // If it's "speed", speed will be used to calculate the time
    
    // -----------------------------------------------
    
    $.vscroll.onscroll = $.Callbacks( "unique" );
    
    // Handler function, bound to the trigger element
    function vscrollHandler () {
        vscroll( $( this ).data( "vscroll" ));
    }
    
    var fired = 1;
    
    function vscroll ( options ) {
        var o = options,
        $to = $( o.to ),
        s = $win.scrollTop(),
        d = $to.offset().top - o.offset,
        t = o.speed ? Math.abs( d - s ) / o.speed : o.duration;
        
        fired = 0;
        
        $body.stop().animate({ scrollTop: d }, t, o.easing, function ( e ) {
            if ( ! fired ) {
                fired = 1;
                $.vscroll.onscroll.fire( $to, o.offset );
            };
        });
    }
    
    function setup ( selector, options ) {
        selector = selector || ".vscroll";
        $body = $( "html,  body" );
        
        var optIsObj = $.isPlainObject( options );
        
        $( selector ).each( function () {
            var $this = $( this ),
            data = $this.data( "vscroll" ),
            on = true;
            
            if ( typeof data === "string" ) {
                data = getInlineOptions( data );
                
                if ( data.offset ) data.offset = Number( data.offset );
                if ( data.duration ) data.duration = Number( data.duration );
                if ( data.speed ) data.speed = Number( data.speed );
            }
            else if ( ! $.isPlainObject( data )) data = {};
            
            if ( options === "off" ) on = false;
            
            if ( ! optIsObj ) options = {};
            
            var settings = $.extend({}, $.vscroll.defaults, data, options );
            
            // If the scroll element has no target stop and give out a message
            if ( ! settings.to && console ) {
                console.warn( "VScroll: missing target ", $this );
            }
            else {
                // Checking the hierarchy for the timing function.
                // First options, then data. First speed then duration
                if ( options.speed ) {
                    settings.duration = null;
                }
                else if ( options.duration ) {
                    settings.speed = null;
                }
                else if ( data.speed ) {
                    settings.duration = null;
                }
                else if ( data.duration ) {
                    settings.speed = null;
                };

                // Initialize
                $this.data( "vscroll", settings );

                if ( ! $this.hasClass( "vscroll" )) {
                    $this.addClass( "vscroll" );
                };

                // Activate / deactivate
                if ( on ) {
                    // Bind the event to the trigger element
                    $this.on( settings.event, vscrollHandler );

                    $this.removeClass( "vscroll-off" );
                }
                else {
                    // Unbind the event from the trigger element
                    $this.off( settings.event, vscrollHandler );

                    if ( ! $this.hasClass( "vscroll-off" )) {
                        $this.addClass( "vscroll-off" );
                    };
                };
            };
        }); 
    };
    
    $.vscroll.setup = setup;
    
    // Inline data example: data-parallax="factor:-0.2, align:0.5"
    
    function getInlineOptions ( data ) {
        if ( $.isPlainObject( data )) return data;
        
        var options = {};
        
        if ( typeof data === "string" && data.length > 2 ) {
            
            // Property separator is a comma
            data = data.split( "," );
            
            for ( var i = 0; i < data.length; i++ ) {
                var pair = $.trim( data[ i ]);
                if ( pair.length > 2 ) {
                    
                    // Key - value separator is":"
                    pair = pair.split( ":" );
                    
                    if ( pair.length > 1 && pair[ 0 ] && pair[ 1 ]) {
                        options[ pair[ 0 ]] = pair[ 1 ];
                    };
                };
            };
        };
        return options;
    };
    
    $( document ).ready( function () {
        setup( ".vscroll" );
    });
    
}( jQuery ));

/*
Usage: 

<div class="el1 vscroll" data-vscroll="to:.section1, speed:3, etc.">Section 1</div>

After initiation the element gets the class "vscroll". The "data-vscroll" attribute
string value will be replaced by the current setup object.

You can transform elements also via javascript:

HTML: <div class="el2">Section 2</div>

JS: $( ".el2" ).vscroll({ to:.section2 });

----------------------------------------------------------------------------

Options:

to: the scroll destination ( element, jqObject or selector ). obligatory

event: "click",
easing: "swing",

speed: 3,          // speed: px / ms
duration: null,    // duration: ms
        
offset: 0,

onVScrollStart: Event handler function. Scope is the destination element
onVScrollEnd: Event handler function. Scope is the destination element

----------------------------------------------------------------------------

Javascript:

Bound to trigger elements:

$( selector ).vscroll( options ); Options: Object, "on" or "off"

Examples:

$( ".el2" ).vscroll({ to:.section2, speed:3 }); This one is now a scrollelement

$( ".el1" ).vscroll( "off" ); This one off. Unbinds all scroll events from element

$( ".vscroll" ).vscroll( "on" ); All on!

$().vscroll( "on" ); All on too

$( ".el2" ).vscroll({ event:mouseover }); New trigger event for this one

$( ".el1, .el2" ).vscroll({ onVScrollStart: myFunc1, onVScrollEnd: myFunc2 }); Event handler for both

$( ".el1" ).vscroll({ to:.section3 }); Change the destination

$.vscroll.defaults.speed = 2.5; Set default values


Scroll without a trigger element:

$.vscroll({ to:section2, speed:3 });

*/
