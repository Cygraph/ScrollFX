/*
Plugin: vscroll.jq.js
Needed libs: jquery.js
Globals: none
Designer: © Michael Schwarz, CyDot
Version: 1.0.2
Updated: 2018-07-07

Scroll method, with some tuning possibilities
------------------------------------------------------------------
• The scroll target can be an element, a selector, a position number or a relative distance.
• The target can be more elements (like a jQuery collection) to step through.
• In case the target is an element, additionaly an offset can be set.
• The scroll timing can be defined through duration or speed.
• A handler function for the scroll start and end event can be set.
• Default values can be set.
• Calculates the the scroll target with the current maximum scroll distance for correct timing and easing.
• Returns a setup object with own methods for further manipulations. Basicaly stored in the triggers data attribute.

Log:

1.0.0: 

///////////////////////////////////////////////////////////////////////

The vscroll method returns a vscroll setup object (stored in the trigger elements data attribute)
-------------------------------------------------------------------------------------------------

var vs = $.vscroll( to[, duration[, options]]);

• If no trigger element is set, the scroll is executed immediately.

$.vscroll( ".elem1" );

• The scroll event can be bound to the trigger element by script or inline notation.

var vs = $.vscroll({ to: ".elem1", trigger: ".button1" });


Or html notation:
-----------------

<div class=".button1" onclick="$.vscroll('.elem1', 270, {end:myHandlerFn})"></div>

• Or with data attribute (JSON style. Use single quotes ouside!):

<div class=".button1" data-vscroll='{"to":".elem1", "speed": 1, "end": "myHandlerFn"}'></div>

• Both will be initialized on doc ready event.


The scroll element is by default the "body" element and can be set in two ways
------------------------------------------------------------------------------

$.vscroll(); 

same as: $( "body" ).vscroll(); 

or: $.vscroll({ scroll: "body" });

or: $.vscroll().scroll = "body";


There can be one or more (element selection) scroll targets
-----------------------------------------------------------

$.vscroll( "p", { trigger: "#button1" });

• targets one paragraph after another.
• Selected are only elements inside the scroll element.
• This behaviour can be turned of by setting the "seq" property to false

$.vscroll( "p", { trigger: "#button1", seq: false });

• Now only the first paragraph is targeted


Setup methods:
--------------

var vs = $.vscroll( "#targetEl" );

vs.set( options );
vs.run();
vs.remove();

• Since all methods return an instance of the vscroll object, they are chainable

vs.set( opts ).run().remove();


Setup properties in direct notation:
------------------------------------

vs.to = element / string / nr . def = null
vs.offset = number . def = 0
vs.by = number . def = null
vs.seq = boolean . def = true

vs.duration = number . def = 300
vs.speed = number . def = 0

vs.start = function . def = null
vs.end = function . def = null

vs.scroll = element / string / null . def = 'body'
vs.trigger = element / string / null . def = null
vs.active = bool . def = false

• Example: 

vs.speed += 0.1
vs.to += 200


Set defaults:
-------------

$.vscroll.def({ duration: 400 });

• Or:
$.vscroll.def( "duration", 400 );


Get default properties:
-----------------------

var t = $.vscroll.def( "duration" );


Event ( vsObject ):
-----------------------------

vs.end = function ( vsetup ) {
    var triggerEl = this;
    
    // Same as
    // var triggerEl = vsetup.trigger;
    
    var scrollEl = vsetup.scroll;
    
    var pos = vsetup.to;
    
    // Same as
    // var pos = $( scrollEl ).scrollTop();
    
    // Set next scroll target
    vsetup.to = ".nextEl";
    
    // Deactivate another button
    $.vscroll.set( ".button2", "active", false );
    
    // Code...
}

///////////////////////////////////////////////////////////////////////*/

;( function ( $ ) {
    
    var $win = $( window );
    
    // @param to:  Element, String (selector) or Object ( options )
    // @param duration: Number (ms) or Object ( options )
    // @param options: Object ( options )
    
    function vscroll ( to, duration, options ) {
        var $this, opts, vs, run = true;
        
        // Is vscroll called by trigger event
        
        if ( this.nodeType === 1 ) {
            $this = $( this );
            vs = $this.data( "vscroll" );
            
            // Is vs already stored in data attribute
            // Else has it a message in the event object data property
            
            if ( ! vs && typeof to === "object" && to.data ) {
                to.preventDefault();
                
                // The trigger prop shows to it's trigger element
                
                to.data.trigger = this;
                vs = vscroll.create( to.data );
            }
        }
        
        // Is the first argument a vscroll vs object
        
        else if ( typeof to === "object" && to.name === definitions.name.value ) {
            vs = to;
        }
        
        // Create a new setup object
        
        else {
            vs = vscroll.create( argsToOpts( to, duration, options ));
            run = false;
        }
        
        if ( run ) vs.run();
        
        return vs;
    }
    
    // Setter/Getter for defaults
    vscroll.def = function ( arg ) {
        if ( typeof arg === "string" ) {
            
            if ( arguments.length === 1 ) {
                return defaults[ arg ];
            }
            else if ( arguments.length === 2 && defaults.hasOwnProperty( arg )) {
                defaults[ arg ] = arguments[ 1 ];
            }
        }
        else if ( $.isPlainObject( arg )) {
            $.updateOwn( defaults, arg );
        }
    };
    
    vscroll.create = function ( options ) {
        var vs = Object.create( VScroll, definitions );
        vs.scroll = defaults.scroll;
        
        return $.updateOwn( vs, defaults, options );
    };
    
    vscroll.set = function ( triggerEl, key_obj, value ) {
        var vs = vscroll.get( triggerEl );
        
        if ( vs ) {
            var args = [].slice.call( arguments, 1 );
            vs.set.apply( vs, args );
        }
        return vs;
    };
    
    vscroll.get = function ( triggerEl, key ) {
        var len = arguments.length, $t = $( triggerEl );
        
        if ( $t.length && $t[ 0 ].nodeName === 1 ) {
            var vs = $t.data( "vscroll" );
            if ( vs ) return ( len > 1 ? vs[ key ] : vs );
        }
        return undefined;
    };
    
    var defaults = {
        to: null,
        by: null,
        offset: 0,
        
        duration: 300,    // duration: ms
        speed: null,      // speed: px/ms
        easing: "swing",
        
        threshold: 10,
        autoinit: true,
        seq: true,
        start: null,
        end: null,
        
        scroll: "body",
        trigger: null,
        triggerCSSClass: "vscroll-trigger",
        event: "click"
    };
    
    // Stores and does the scroll calculations 
    var definitions = {
        name: {
            value: "vsrcoll"
        },
        
        event: {
            enumerable: true,
            configurable: true,
            get: function () {
                return this._evt || defaults.event;
            },
            set: function ( strg ) {
                if ( typeof strg === "string" ) {
                    this._evt = strg.trim();
                }
            }
        },
        
        position: {
            enumerable: true,
            configurable: true,
            get: function () {
                return this._$scroll.scrollTop();
            }
        },
        
        from: {
            enumerable: true,
            configurable: true,
            get: function () {
                return ( typeof this._a === "number" ? this._a : this.position );
            }
        },
        
        to: {
            enumerable: true,
            configurable: true,
            get: function () {
                return ( this._$b
                    ? $( this.target ).offset().top + this.offset
                    : typeof this._b === "number"
                        ? this._b
                        : this._d
                            ? this.from + this._d
                            : this.from
                ).constrain( 0, this.max );
            },
            set: function ( val ) {
                if ( val === "max" ) val = Infinity;
                
                if ( ! isNaN( val ) && val !== null ) {
                    this._$b = null;
                    this._b = Number( val );
                }
                else {
                    var $q = this._$scroll.find( val );
                    
                    if ( $q.length ) {
                        this._$b = $q;
                        this._seqI = 0;
                        this._b = null;
                    }
                }
                this._d = null;
            }
        },
        
        target: {
            enumerable: true,
            configurable: true,
            get: function () {
                return ( this._$b ? this._$b[ this._seqI ] : null );
            }
        },
        
        seqIndex: {
            enumerable: true,
            configurable: true,
            get: function () {
                return this._seqI;
            },
            set: function ( val ) {
                if ( ! this._$b || ! this.seq ) {
                    this._seqI = 0;
                }
                else if ( ! isNaN( val ) && val !== null ) {
                    this._seqI = Number( val ) % this._$b.length;
                }
            }
        },
        
        seq: {
            enumerable: true,
            configurable: true,
            get: function () {
                return !! this._seq;
            },
            set: function ( val ) {
                this._seq = !! val;
            }
        },
        
        by: {
            enumerable: true,
            configurable: true,
            get: function () {
                return ( this._d
                    ? this._d
                    : this.to - this.from
                );
            },
            set: function ( val ) {
                if ( ! isNaN( val ) && val !== null ) {
                    this._d = Number( val );
                }
                this._b = this._$b = null;
            }
        },
        
        offset: {
            enumerable: true,
            configurable: true,
            get: function () {
                return this._o || 0;
            },
            set: function ( val ) {
                if ( ! isNaN( val ) && val !== null ) {
                    this._o = Number( val );
                }
            }
        },
        
        duration: {
            enumerable: true,
            configurable: true,
            get: function () {
                return this._t;
            },
            set: function ( val ) {
                if ( ! isNaN( val ) && val !== null ) {
                    this._t = Math.round( Math.abs( Number( val )));
                    this._v = Math.abs( this.by / this._t );
                    this._timing = "duration";
                }
            }
        },
        
        speed: {
            enumerable: true,
            configurable: true,
            get: function () {
                return this._v || 0;
            },
            set: function ( val ) {
                if ( ! isNaN( val ) && val !== null ) {
                    this._v = Math.abs( Number( val ));
                    this._t = Math.round( Math.abs( this.by / this._v ));
                    this._timing = "speed";
                }
            }
        },
        
        threshold: {
            enumerable: true,
            configurable: true,
            get: function () {
                return this._th;
            },
            set: function ( val ) {
                if ( ! isNaN( val ) && val !== null ) {
                    this._th = Math.abs( Number( val ));
                }
            }
        },
        
        max: {
            enumerable: true,
            configurable: true,
            get: function () {
                return this._$scroll[ 0 ].scrollHeight - this._$view.height();
            }
        },
        
        scroll: {
            enumerable: true,
            configurable: true,
            get: function () {
                return this._$scroll[ 0 ];
            },
            set: function ( selector ) {
                var $el = $( selector );
                
                if ( $el.length && $el[ 0 ].nodeType === 1 ) {
                    var n = $el[ 0 ].nodeName.toLowerCase();
                    this._$scroll = $el;
                    this._$view = ( n === "body" ) ? $win : this._$scroll;
                }
            }
        },
        
        trigger: {
            enumerable: true,
            configurable: true,
            get: function () {
                return this._$trigger[ 0 ];
            },
            set: function ( selector ) {
                if ( ! this._$trigger ) {
                    var $el = $( selector );
                    
                    if ( $el.length ) {
                        this._$trigger = $el;
                        
                        $el.prop( "on" + this.event, null );
                        $el.data( "vscroll", this );
        
                        if ( ! $el.hasClass( this.triggerCSSClass )) {
                            $el.addClass( this.triggerCSSClass );
                        }
                        this.active = true;
                    }
                }
                else if ( selector === null ) {
                    this.active = false;
                    this._$trigger.removeAttr( "data-vscroll" );
                    this._$trigger.removeClass( this.triggerCSSClass );
                    this._destroy();
                }
            }
        },
        
        triggerCSSClass: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: defaults.triggerCSSClass
        },
        
        active: {
            enumerable: true,
            configurable: true,
            get: function () {
                return this._active;
            },
            set: function ( bool ) {
                bool = !! bool;
                if ( bool && ! this._active ) {
                    this._$trigger.on( this.event, vscroll );
                }
                else if ( ! bool && this._active ) {
                    this._$trigger.off( this.event, vscroll );
                }
                this._active = bool;
            }
        },
        
        start: {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        },
        
        end: {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        }
    };
    
    var VScroll = {};
    
    VScroll.set = function ( key_obj, value ) {
        if ( arguments.length === 1 ) {
            $.updateOwn( this, key_obj );
        }
        else if ( arguments.length === 2 && this.hasOwnProperty( key_obj )) {
            this[ key_obj ] = value;
        }
        return this;
    };
    
    VScroll.update = function () {
        this._a = this.position;
        this[ this._timing ] = this[ this._timing ];
        return this;
    };
    
    VScroll.next = function () {
        this.seqIndex ++;
    };
    
    VScroll.run = function () {
        this._$scroll.stop();
        this.update();
        
        if ( Math.abs( this.by ) >= this.threshold ) {
            this._handleStart();
            this.moved = true;

            this._$scroll.animate({ 
                scrollTop: this.to
            }, this.duration, this.easing, this._handleEnd.bind( this ));
        }
        else {
            this.moved = false;
            this._handleEnd();
        }
        return this;
    };
    
    VScroll.destroy = function () {
        this.trigger = null;
        return this._destroy();
    };
    
    VScroll._destroy = function () {
        for ( var key in this ) {
            if ( this.hasOwnProperty( key )) {
                delete this[ key ];
            }
        };
        return this;
    };
    
    VScroll._handleStart = function () {
        if ( typeof this.start === "function" ) {
            this.start.call( this.trigger, this );
        }
        return this;
    };
    
    VScroll._handleEnd = function () {
        if ( typeof this.end === "function" ) {
            this.end.call( this.trigger, this );
        }
        if ( ! this.trigger ) this.destroy();
        else if ( this.seq ) this.next();
        
        return this;
    };
    
    function initByDataAttr () {
        $( "[data-vscroll]" ).each( function () {
            var opts = $( this ).data( "vscroll" );
            
            if ( opts.name !== definitions.name.value ) {
                if ( typeof opts.end === "string" ) {
                    opts.end = eval( opts.end );
                }
                opts.trigger = this;
                vscroll( opts );
            }
        });
    }
    
    var autoIdNr = 0,
    autoIdPrefix = "VS-Generated-Id-";
    
    function initByEventAttr () {
        $( "[onclick]" ).each( function () {
            var $el = $( this ),
            attr = $el.attr( "onclick" );
            
            if ( attr.indexOf( "vscroll" ) > -1 && attr.indexOf( "trigger" ) < 0 ) {
                this.id = this.id || autoIdPrefix + ( ++ autoIdNr );
                
                var i  = attr.indexOf( "{" ) + 1,
                insert = "trigger:'#" + this.id + "'";
                
                if ( i > 0 ) insert += ",";
                else {
                    i  = attr.lastIndexOf( ")" );
                    insert = ",{" + insert + "}";
                }
                var newAttr = attr.slice( 0, i ) + insert + attr.slice( i );
                $el.attr( "onclick", newAttr ).trigger( "click" );
            }
        });
    }
    
    function argsToOpts ( to, duration, options ) {
        var opts;
        
        if ( $.isPlainObject( to )) opts = to;
        else {
            opts = { to: to };
            
            if ( $.isPlainObject( duration )) $.extend( opts, duration );
            else {
                if ( $.isNumeric( duration )) opts.duration = duration;
                if ( options ) $.extend( opts, options );
            }
        }
        return opts;
    }
    
    $.updateOwn = function ( targetObj, obj1, _objN ) {
        var objs = Array.prototype.slice.call( arguments ), srcObj;
        objs.shift();
        
        for ( var i = 0; i < objs.length; i ++ ) {
            srcObj = objs[ i ];
            
            if ( $.isPlainObject( srcObj )) {
                for ( var p in srcObj ) {
                    if ( targetObj.hasOwnProperty( p )) {
                        targetObj[ p ] = srcObj[ p ];
                    }
                };
            }
        };
        return targetObj;
    };
    
    if ( ! Number.prototype.constrain ) {
        Number.prototype.constrain = function( min, max ) {
            var num = Number( this );
            if ( num < min ) num = min;
            else if ( num > max ) num = max;
            return num;
        }
	}
    
    $( document ).ready( function () {
        if ( defaults.autoinit ) {
            initByEventAttr();
            initByDataAttr();
        }
    });
    
    // JQuery object defines the scroll field
    
    $.fn.vscroll = function ( _args ) {
        var opts = argsToOpts.apply( null, arguments );
        opts.scroll = $( this )[ 0 ];
        vscroll( opts );
        
        return $( this );
    };
    
    $.vscroll = vscroll;
    
}( jQuery ));


