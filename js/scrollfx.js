/*
Plugin: scrollfx.js
Needed scripts: jquery.js
Globals: none
Designer: © Michael Schwarz, CyDot
Version: 1.0.0
Updated: 2019-04-04
*/


;( function ( $ ) {
    
    var version = "1.0.0",
    $win = $( window ),
    winPorts = [ "html", "window", "body", window ];
    
    // @params: 
    // Either options object:
    // Or 1 - 3 arguments:
    // ( to, duration, callback )
    // ( to, duration )
    // ( to, callback )
    // ( to )
    
    function scrollfx ( arg0_ ) {
        sfx = setup.apply( null, arguments );
        return scroll( sfx );
    }
    
    function def_viewport_scrollfx ( opts ) {
        ( opts || {}).viewport = $( $( this )[ 0 ]);
        scrollfx( opts );
        
        return $( this );
    }
    
    $.scrollfx = scrollfx;
    $.fn.scrollfx = def_viewport_scrollfx;
    
    var defaults = {
        to: null,
        by: 0,
        offset: 0,
        
        duration: 240,    // duration: ms
        speed: 4,         // speed: px/ms
        useSpeed: false,
        easing: "swing",
        
        viewport: "body, html",
        onscroll: $.noop
    };
    
    scrollfx.version = version;
    
    // @params: 
    // Options object 
    // Or key as first and value as second argument
    // No arguments will return a copy of the defaults object
    
    scrollfx.defaults = function ( arg0_ ) {
        if ( ! arguments.length ) {
            return $.extend({}, defaults );
        }
        if ( $.isPlainObject( arg0_ )) {
            $.extend( defaults, arg0_ );
        }
        else if ( arguments.length > 1 && typeof arg0_ === "string" ) {
            defaults[ arg0_ ] = arguments[ 1 ];
        }
    };
    
    scrollfx.register = function () {
        var $elems = $( "[data-scrollfx]" );
        $elems.each( register );
        
        return $elems;
    };
    
    // @params: 
    // trigger: selector or element with a data-scrollfx attribute
    // arg0_: options object or key as 2nd and value as 3rd arg
    
    scrollfx.data = function ( trigger, arg0_ ) {
        var $el = $( trigger ), key,
        opts = $el.data( "scrollfx" );
        
        if ( ! opts ) {
            return;
        }
        opts = dataToObj( opts );
        
        if ( ! opts ) return;
        
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
                sfx.onscroll( sfx );
                scrolling = false;
            };
            triggered ++;
        });
        
        scrolling = sfx.scrollport;
        return sfx;
    }
    
    function setup ( arg0_ ) {
        var opts = getOptions.apply( null, arguments ),
        ports = getPorts( opts.viewport );
        
        sfx = {};
        
        sfx.scrollport = ports.scroll;
        sfx.viewport = ports.view;
        sfx.from = sfx.viewport.scrollTop();
        
        sfx.max = sfx.scrollport.outerHeight() - $win.height();
        
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
        
        sfx.onscroll = opts.onscroll || defaults.onscroll;
        sfx.easing = opts.easing || defaults.easing;
        sfx.trigger = opts.trigger || "";
        sfx.event = opts.event || "";
        
        return sfx;
    }
    
    function register ( i ) {
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
    
    function getTo ( sfx, to ) {
        if ( $.isNumeric( to )) {
            return to;
        }
        else if ( isElement( to )) {
            var $trg = sfx.scrollport.find( to );

            if ( $trg.length ) {
                return $trg.offset().top - sfx.scrollport.offset().top;
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
                    opts.onscroll = args[ 2 ];
                }
            }
            else if ( $.isFunction( args[ 1 ])) {
                opts.onscroll = args[ 1 ];
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
