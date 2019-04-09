/*
Plugin: scrollfx.js
Dependencies: jquery.js
Globals: none
Designer: © Michael Schwarz, CyDot
Version: 0.9.5
Updated: 2019-04-09
*/


;( function ( $ ) {
    
    var version = "0.9.5",
    $win = $( window ),
    winPorts = [ "html", "window", "body", window ];
    
    // @params: 
    // Either options object (which allows more detailed params):
    // ({ to:".trg", speed:5, scrolled:onscroll, offset:24, etc... })
    // Or 1 - 3 arguments in predefined order:
    // ( to, duration, callback )
    // ( to, duration )
    // ( to, callback )
    // ( to )
    // ! If defaults "useSpeed" is set true, param duration is replaced by speed
    
    function scrollfx ( arg0_ ) {
        sfx = setup.apply( null, arguments );
        return scroll( sfx );
    }
    
    function jqviewport_scrollfx ( opts ) {
        opts = opts || {};
        opts.viewport = $( $( this )[ 0 ]);
        scrollfx( opts );
        
        return $( this );
    }
    
    $.scrollfx = scrollfx;
    $.fn.scrollfx = jqviewport_scrollfx;
    
    scrollfx.version = version;
    
    var defaults = {
        to: null,
        by: 0,
        offset: 0,
        
        duration: 240,    // duration: ms
        speed: 4,         // speed: px/ms
        useSpeed: false,
        
        // jQuerys default easing is: "swing"
        // Further it provjdes "linear"
        // If you want more easings, just notate the "jq-easings.js" in libs 
        // "jq-easings.js" is an extraction of 73 lines of code from 
        // the original jQ-UI-Library. So it's extremely lightweight.
        // It offers each of the following easings in three variations "In", "Out" and "InOut"
        // Quad, Cubic, Quart, Quint, Expo, Sine, Circ, Elastic, Back and Bounce
        // All in all 30 additional easings
        
        easing: "swing",
        
        viewport: "body, html",
        scrolled: $.noop
    };
    
    // @params:
    // Only one argument (string) returns the default property
    // Options object sets more params
    // Or key as first and value as second argument
    
    scrollfx.defaults = function ( arg0_ ) {
        if ( typeof arg0_ === "string" ) {
            if ( arguments.length === 1 ){
                return defaults[ arg0_ ];
            }
            else {
                defaults[ arg0_ ] = arguments [ 1 ];
            }    
        }
        else if ( $.isPlainObject( arg0_ )) {
            $.extend( defaults, arg0_ );
        }
    };
    
    // Registers all elements with data-scrollfx attribute
    // Replaces data string with data object
    // Adds class name "scrollfx"
    
    scrollfx.register = function () {
        var $elems = $( "[data-scrollfx]" );
        $elems.each( __register );
        
        return $elems;
    };
    
    // Sets or returns trigger elements scrollfx data
    // @params: 
    // trigger: selector of element with a data-scrollfx attribute
    // The trigger param alone returns its data object
    // arg0_: options object or key as 2nd and value as 3rd arg
    
    scrollfx.data = function ( trigger, arg0_ ) {
        var $el = $( trigger ), key,
        opts = $el.data( "scrollfx" );
        
        if ( ! opts ) {
            return;
        }
        opts = dataToObj( opts );
        
        if ( arguments.length === 1 ) {
            return opts;
        }
        if ( arguments.length > 1 && typeof arg0_ === "string" ) {
            key = arg0_;
            arg0_ = {};
            arg0_[ key ] = arguments[ 2 ];
        }
        if ( $.isPlainObject( arg0_ )) {
            $el.data( "scrollfx", $.extend( opts, arg0_));
        }
    };
    
    var triggered = 0,
    scrolling;
    
    function scroll ( sfx ) {
        triggered = 0;
        
        sfx.scrollport.stop().animate({
            scrollTop: sfx.to
        }, sfx.duration, sfx.easing, function () {
            if ( ! triggered ) {
                sfx.scrolled( sfx );
                scrolling = false;
            };
            triggered ++;
        });
        
        scrolling = sfx.scrollport;
        return sfx;
    }
    
    // Bound to the trigger element
    
    function __register ( i ) {
        var $el = $( this ),
        opts = $el.data( "scrollfx" );
        
        if ( typeof opts === "string" ) {
            opts = dataToObj( opts );
            
            opts.event = opts.event || "click";
            
            $el.data( "scrollfx", opts );
            $el.on( opts.event, opts, $.scrollfx );

            if ( ! $el.hasClass( "scrollfx" )) {
                $el.addClass( "scrollfx" );
            }
        }
    }
    
    function setup ( arg0_ ) {
        var opts = getOptions.apply( null, arguments ),
        ports = getPorts( opts.viewport );
        
        sfx = {};
        
        sfx.scrollport = ports.scroll;
        sfx.viewport = ports.view;
        sfx.from = sfx.viewport.scrollTop();
        
        sfx.max = sfx.scrollport[ 0 ].scrollHeight - sfx.viewport.outerHeight();
        
        sfx.to = opts.to !== undefined 
            ? getTo( sfx, opts.to )
            : sfx.from + getBy( opts.by );
        
        sfx.offset = $.isNumeric( opts.offset )
            ? Number( opts.offset )
            : defaults.offset;
        
        sfx.to += sfx.offset;
        if ( sfx.to > sfx.max ) sfx.to = sfx.max;
        sfx.by = sfx.to - sfx.from;
        
        sfx.duration = $.isNumeric( opts.duration )
            ? opts.duration
            : $.isNumeric( opts.speed )
                ? sfx.by 
                    ? Math.abs( sfx.by ) / opts.speed
                    : 0
                : defaults.duration;
        
        sfx.speed = sfx.by 
            ? Math.abs( sfx.by / sfx.duration ) 
            : 0;
        
        var cb = opts.scrolled;
        sfx.scrolled = defaults.scrolled;
        
        if ( typeof cb === "function" ) {
            sfx.scrolled = cb;
        }
        else if ( typeof cb === "string" && cb.length ) {
            var fn = evaluateData( cb );
            if ( fn ) sfx.scrolled = fn;
        };
        
        sfx.easing = opts.easing || defaults.easing;
        sfx.trigger = opts.trigger ? $( opts.trigger ) : "";
        sfx.triggerEvent = opts.event || "";
        sfx.event = "scrolled";
        
        return sfx;
    }
    
    function evaluateData ( data ) {
        try {
            throw eval( data );
        }
        catch ( e ) {
            if ( typeof e === "function" ) {
                return eval( data );
            }
            else if ( console ) {
                console.warn( "ScrollFX: callback is not a function", data );
            }
            return undefined;
        }
    }
    
    function getTo ( sfx, to ) {
        if ( $.isNumeric( to )) {
            return to;
        }
        else if ( isElement( to )) {
            var $trg = sfx.scrollport.find( to );
            
            if ( $trg.length ) {
                var sTop = sfx.viewport === $win 
                    ? 0 : sfx.scrollport.scrollTop();
                
                return $trg.offset().top - sfx.scrollport.offset().top + sTop;
            }
        };
        return sfx.from;
    }
    
    function getBy ( by ) {
        return $.isNumeric( by )
            ? Number( by )
            : isElement( by )
                ? $( by ).outerHeight()
                : 0;
    }
    
    function getOptions ( arg0_ ) {
        var args = arguments, sfx = {}, opts;
        
        if ( typeof arg0_ === "object" ) {
            if ( arg0_.data !== undefined ) {
                opts = $.isPlainObject( arg0_.data )
                    ? arg0_.data
                    : { to: arg0_.data }
                
                opts.trigger = arg0_.target;
                opts.event = arg0_.type;
            }
            else opts = arg0_;
        }
        else {
            opts = { to: arg0_ };
            
            if ( $.isNumeric( args[ 1 ])) {
                if ( defaults.useSpeed ) {
                    opts.speed = args[ 1 ];
                }
                else opts.duration = args[ 1 ];
                
                if ( $.isFunction( args[ 2 ])) {
                    opts.scrolled = args[ 2 ];
                }
            }
            else if ( $.isFunction( args[ 1 ])) {
                opts.scrolled = args[ 1 ];
            }
        };
        return opts;
    }
    
    function getPorts ( selector ) {
        var $vp = $( selector );
        
        if ( ! $vp.length || ! $vp[0].tagName ) {
            return { scroll: $( "body, html" ), view: $win };
        };
        
        var found;
        for ( var i = 0; i < winPorts.length; i ++ ) {
            found = $vp.filter( winPorts[ i ]);
            if ( found.length ) {
                return { scroll: $( "body, html" ), view: $win };
            }
        };
        return { scroll: $vp, view: $vp };
    }
    
    function isElement ( selector ) {
        var el = $( selector )[0];
        return typeof el === "object" && el.tagName;
    }
    
    function dataToObj ( data ) {
        if ( $.isPlainObject( data )) {
            return data;
        }
        else if ( typeof data === "string" ) {
            var pairs = data.split( "," ),
            obj = {}, key;

            for ( var i = 0; i < pairs.length; i ++ ) {
                pair = pairs[ i ].split( ":" );
                obj[ $.trim( pair[ 0 ])] = $.trim( pair[ 1 ]);
            };
            return obj;
        }
        else return {};
    }
    
}( jQuery ));
