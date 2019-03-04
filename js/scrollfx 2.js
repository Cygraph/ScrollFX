/*
Plugin: scrollfx.jq.js
Needed scripts: jquery.js, 
    cy.native.js (Number.prototype.constrain, Array.prototype.last), 
    cy.utils.js ($.updateOwn)
Globals: none
Designer: © Michael Schwarz, CyDot
Version: 1.0.0
Updated: 2018-06-08

Small and fast scroll method, with essential tuning possibilities
------------------------------------------------------------------
• The scroll target can be an element a position number (to) or a relative distance (by).
• In case the target is an element, additionaly an offset can be set.
• The scroll timing can be defined through duration or speed.
• A handler function for the scroll end event can be set.
• Default values can be defined.
• Calculates the the scroll target with the current maximum scroll distance.

Log:

1.0.0:  

$.scrollfx( to, duration, options );

$.scrollfx.def( key_obj, value );

$.scrollfx.set( triggerEL, key_obj, value );

*/

;( function ( $ ) {
    
    var $win = $( window );
    
    // @param to: String (selector) or Object ( options )
    // @param duration: Number (ms) or Object ( options )
    // @param options: Object ( options )
    
    function scrollfx ( to, duration, options ) {
        var $this, opts, settings;
        
        if ( this.nodeType === 1 ) {
            $this = $( this );
            settings = $this.data( "scrollfx" );
            
            if ( ! settings && typeof to === "object" && to.data ) {
                settings = setup( to.data );
                register( $this, settings );
            }
        }
        else if ( typeof to === "object" && to.name === defaults.name ) {
            settings = to;
        }
        else {
            settings = setup( argsToOpts( to, duration, options ));
            
            if ( settings.bind ) {
                $this = $( settings.bind );
                
                if ( $this.length ) {
                    $this.prop( "onclick", null );
                    register( $this, settings );
                    $this.on( settings.event, scrollfx );
                }
                else settings.bind = null;
            }
        }
        return settings.update().run();
    }
    
    scrollfx.def = function ( arg ) {
        var l = arguments.length;
        
        if ( ! l ) return defaults;
        
        var t = $.type( arg );
        
        if ( t === "string" ) {
            if ( l === 1 ) return defaults[ arg ];
            else if ( defaults.hasOwnProperty( arg )) {
                defaults[ arg ] = arguments[ 1 ];
            }
        }
        else if ( t === "object" ) {
            $.updateOwn( defaults, arg );
        }
    };
    
    scrollfx.set = function ( triggerEL, key_obj, value ) {
        var $t = $( triggerEL );
        if ( ! $t.length || $t[ 0 ].nodeName !== 1 ) return;
        
        var s = $t.data( "scrollfx" );
        return s ? s.set( key_obj, value ) : s;
    };
    
    var defaults = {
        to: null,
        by: null,
        offset: 0,
        
        duration: 300,    // duration: ms
        speed: null,      // speed: px/ms
        easing: "swing",
        
        min: 4,
        autoinit: true,
        start: null,
        end: null,
        
        scroll: "body",
        trigger: null,
        event: "click"
    };
    
    var definitions = {
        name: {
            value: "vsrcoll"
        },
        
        to: {
            enumerable: true,
            get: function () {
                return ( this._$b
                    ? this._$b.offset().top + this.offset
                    : typeof this._b === "number"
                        ? this._b
                        : this._d
                            ? this._$scroll.scrollTop() + this._d
                            : this._$scroll.scrollTop()
                ).constrain( 0, this.max );
            },
            set: function ( val ) {
                if ( ! isNaN( val )) {
                    this._$b = null;
                    this._b = Number( val );
                }
                else if ( $( val ).length ) {
                    this._$b = $( val );
                    this._b = null;
                }
                this._d = null;
            }
        },
        
        by: {
            enumerable: true,
            get: function () {
                return ( this._d
                    ? this._d
                    : this.to - this._$scroll.scrollTop()
                );
            },
            set: function ( val ) {
                if ( ! isNaN( val )) {
                    this._d = Number( val );
                }
                this._b = this._$b = null;
            }
        },
        
        duration: {
            enumerable: true,
            get: function () {
                return ( typeof this._t === "number"
                    ? this._t
                    : this.by / this._v
                );
            },
            set: function ( val ) {
                if ( ! isNaN( val )) {
                    this._t = Number( val );
                }
                this._v = null;
            }
        },
        
        speed: {
            enumerable: true,
            get: function () {
                return ( typeof this._v === "number"
                    ? this._v
                    : this.by / this._t
                );
            },
            set: function ( val ) {
                if ( ! isNaN( val )) {
                    this._v = Number( val );
                }
                this._t = null;
            }
        },
        
        max: {
            get: function () {
                var el = this._$scroll[ 0 ];
                return ( el.scrollHeight - el.clientHeight );
            }
        },
        
        scroll: {
            enumerable: true,
            get: function () {
                return this._$scroll;
            },
            set: function ( selector ) {
                var $el = $( selector );
                
                if ( $el.length && $el[ 0 ].nodeType === 1 ) {
                    this._$scroll = $el;
                    
                }
            }
        },
        
        trigger: {
            enumerable: true,
            get: function () {
                return this._$trigger;
            },
            set: function ( selector ) {
                if ( ! this._$trigger ) {
                    var $el = $( selector );
                    if ( $el.length ) {
                        register( $el, this );
                    }
                }
            }
        }
    };
    
    function initDefs () {
        var d = defaults;
        Object.defineProperties( d, defs );
        
        d.by = "500";
        console.log( "defaults", d, d.to, d.by );
        
        var copy = Object.create( d );
        copy.by = "222";
        
        console.log( "copy", copy, copy.to, copy.by );
        
    }
    
    function setup ( opts ) {
        var settings = $.extend({}, defaults, defineType( opts ));
        
        settings.update = updateMethods[ opts._type ];
        return settings.calcScrollField( settings.elem );
    }
    
    var updateMethods = {
        to: function () {
            if ( this.$to ) {
                this.to = this.$to.offset().top + this.offset;
            }
            this.calcMax();
            return this;
        },
        
        by: function () {
            this.to = this.viewport.scrollTop() + this.by;
            this.calcMax();
            return this;
        },
        
        to_v: function () {
            updateMethods.to.call( this );
            this.duration = Math.abs( this._by / this.speed );
            return this;
        },
        
        by_v: function () {
            updateMethods.by.call( this );
            this.duration = Math.abs( this._by / this.speed );
            return this;
        },
        
        cancel: function () {
            this._by = 0;
            return this;
        }
    };
    
    defaults.scrollfx = function () {
        return scrollfx( this );
    };
    
    defaults.set = function ( key_obj, value ) {
        
    };
    
    defaults.run = function () {
        if ( this._type !== "cancel" ) {
            this.elem.stop();

            if ( Math.abs( this._by ) > this.min ) {
                handleStart.call( this );
                
                this.elem.animate({ 
                    scrollTop: this._to
                }, this.duration, this.easing, handleEnd.bind( this ));
            }
            else {
                handleEnd.call( this );
            }
        }
        return this;
    };
    
    defaults.calcMax = function () {
        this._max = this.elem[ 0 ].scrollHeight - this.elem[ 0 ].clientHeight;
        
        this._from = this.elem.scrollTop();
        this._to = ( this.to ).constrain( 0, this._max );
        this._by = this._to - this._from;
        this._clipped = this._to - this.to;
        
        return this;
    };
    
    defaults.calcScrollField = function ( elem ) {
        if ( elem ) this.elem = $( elem ).first();
        
        
        var tag = this.elem[ 0 ].tagName.toLowerCase();
        if ( tag === "body" ) this.viewport = $win;
        else if ( ! this.viewport ) this.viewport = this.elem;
        
        return this;
    };
    
    function handleStart () {
        if ( typeof this.start === "function" ) {
            this.start.call( this.bind, this );
        }
    }
    
    function handleEnd () {
        if ( typeof this.end === "function" ) {
            this.end.call( this.bind, this );
        }
    }
    
    function argsToOpts ( to, duration, options ) {
        var opts;
        
        if ( $.isPlainObject( to )) opts = to;
        else {
            opts = {};
            opts.to = to;
            var type = typeof duration;
            
            if ( type === "object" ) $.extend( opts, duration );
            else {
                if ( type === "number" ) opts.duration = duration;
                if ( options ) $.extend( opts, options );
            }
        }
        return opts;
    }
    
    function initByDataAttr () {
        $( "[data-scrollfx]" ).each( function () {
            var $el = $( this ),
            opts = $el.data( "scrollfx" );
            
            if ( opts.name !== defaults.name ) {
                if ( typeof opts.end === "string" ) {
                    opts.end = eval( opts.end );
                }
                register( $el, setup( opts ));
                $el.on( "click", scrollfx );
            }
        });
    }
    
    function register ( $el, settings ) {
        settings.bind = $el;
        $el.data( "scrollfx", settings );
        
        if ( ! $el.hasClass( "scrollfx" )) {
            $el.addClass( "scrollfx" );
        }
    }
    
    $( document ).ready( function () {
        initDefs();
        if ( defaults.autoinit ) initByDataAttr();
    });
    
    $.scrollfx = scrollfx;
    
}( jQuery ));

/*

Usage in html:
______________

Parameter arguments:
<div class="myEl" onclick="$.scrollfx('.targetEl', 270)"></div>

Options object as argument:
<div class="myEl" onclick="$.scrollfx({to:'.targetEl', duration:270})"></div>

Combined:
<div class="myEl" onclick="$.scrollfx('.targetEl', {speed:1,offset:100,end:myHandlerFn})"></div>

Possible Arguments:
$.scrollfx( to, duration, options );
$.scrollfx( to, duration );
$.scrollfx( to, options );
$.scrollfx( to );
$.scrollfx( options );

By data attribute (JSON style object):
______________________________________

Single quotes around json style object! Double quotes for each key and also functions !
(Initiated on doc ready, only if scrollfx._defaults.autoinit is true)

<div class="myEl" data-scrollfx='{"to":".targetEl", "speed": 3, "end": "myHandlerFn"}'></div>


Binding scrollfx to an element's "click" event per script:
__________________________________________________________

$( ".myScrollEl" ).scrollfx( ".myTargetEl" );
or $.scrollfx({ to: ".myTargetEl", elem: ".myScrollEl" });
default is $( "body" ).scrollfx( args );

$( ".myTriggerEl" ).click({to: ".myTargetEl"}, $.scrollfx );
or $.scrollfx({ to: ".myTargetEl", bind: ".myTriggerEl", event: "hover" });

Direct call
___________

$.scrollfx( ".myTargetEl", 270 );


Options:
________

to: Number (px) or Element/String (selector). Default is "null"

duration: Number (ms). Default is 300. $.scrollfx('myEl',270) same as $.scrollfx({to:'myEl',duration:270})

by: Number (px). Recalculates "to" if set. Default is "null". $.scrollfx({by:300})

offset: Number (px). Only used relative to given target element. Default is 0. $.scrollfx('myEl',{offset:300})

speed: Number (px/ms). Recalculates duration if set. Default is "null". $.scrollfx('myEl',{speed:1})

easing: String. JQuery easing name. Default is "swing"

end: Function. Handler function. Triggered on scroll end. Transmits an event object as the first argument. Default is "null"

bind:

event: 

elem:


Event (Object):
_______________

end event keys: type, from, to, duration, by, speed, easing
(end event type: "scrollfxend")


Defaults for all scrollings can be set:
_______________________________________

$.scrollfx.defaults( options );

*/
