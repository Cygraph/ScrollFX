/*
Plugin: scrollfx.jq.js
Needed scripts: jquery.js, 
    cy.native.js (Number.prototype.constrain, Array.prototype.last), 
    cy.utils.js ($.updateOwn)
Globals: none
Designer: © Michael Schwarz, CyDot
Version: 1.0.0
Updated: 2018-06-08
*/


;( function ( $ ) {
    
    var winPorts = [ "html", "window", "body", window ];
    
    function scrollfx ( opts ) {
        var sfx = setup( opts );
        
        console.log( "sfx", sfx );
        
        return sfx.scroll();
    }
    
    function jqviewport_scrollfx ( opts ) {
        ( opts || {}).viewport = $( $( this )[ 0 ]);
        scrollfx( opts );
    }
    
    var defaults = {
        to: null,
        by: 0,
        offset: 0,
        
        duration: 240,    // duration: ms
        speed: 4,         // speed: px/ms
        useSpeed: false,
        easing: "swing",
        
        viewport: "body, html"
    },
    
    definitions = {
        
        to: {
            enumerable: true,
            set: function ( to ) {
                if ( $.isNumeric( to )) {
                    this._to = to;
                }
                else if ( isElement( to )) {
                    var $trg = this._scrollport.find( to );
                    
                    if ( $trg.length ) {
                        this._to = $trg.offset().top - this._scrollport.offset().top;
                        this._$target = $trg;
                    }
                };
                this._by = this._to - this._viewport.scrollTop();
            },
            get: function () {
                return this._to;
            }
        },
        
        by: {
            enumerable: true,
            set: function ( by ) {
                if ( $.isNumeric( by )) {
                    this._by = by;
                }
                else if ( isElement( by )) {
                    this._by = $( by ).outerHeight();
                }
                this._to = this._viewport.scrollTop() + this._by;
            },
            get: function () {
                return this._by;
            }
        },
        
        offset: {
            enumerable: true,
            set: function ( px ) {
                this._offset = parseInt( px );
            },
            get: function () {
                return this._offset;
            }
        },
        
        duration: {
            enumerable: true,
            set: function ( ms ) {
                this._duration = ms;
                this.useSpeed = false;
            },
            get: function () {
                return this._duration;
            }
        },
        
        speed: {
            enumerable: true,
            set: function ( pxPerMS ) {
                if ( ! pxPerMS ) return;
                
                this._speed = pxPerMS;
                this._duration = ( this._by + this._offset ) / this._speed;
                this.useSpeed = true;
            },
            get: function () {
                return this._speed;
            }
        },
        
        useSpeed: {
            enumerable: true,
            writeable: true,
            value: false
        },
        
        easing: {
            enumerable: true,
            set: function ( name ) {
                this._easing = name;
            },
            get: function () {
                return this._easing;
            }
        },
        
        viewport: {
            enumerable: true,
            set: function ( selector ) {
                var port = getPort( selector );
                this._viewport = port.view;
                this._scrollport = port.scroll;
            },
            get: function () {
                return this._viewport;
            }
        },
        
        scrollport: {
            enumerable: true,
            get: function () {
                return this._scrollport;
            }
        },
        
        _updated: {
            writeable: true,
            value: false
        },
        
        _cbNr: {
            writeable: true,
            value: 0
        }
    },
    
    methods = {
        scroll: function () {
            if ( ! this._updated ) {
                this.refresh();
            }
            this._cbNr = 0;
            
            this._scrollport.animate({
                scrollTop: this._to
            }, this._duration, this._easing, this.onend );
            
            return this;
        },
        
        start: function ( callback ) {
            
        },
        
        onend: function ( e ) {
            if ( ! this._cbNr ) {
                this._cbNr ++;
                // send event
            }
            else this._cbNr = 0;
        },
        
        refresh: function () {
            if ( this._$target ) {
                this.to = this._$target;
                
                if ( this.useSpeed ) {
                    this.speed = this.speed;
                }
            }
        },
        
        set: function ( args_ ) {
            var a = arguments;
            
            if ( $.isPlainObject( args_)) {
                $.extend( this, args_);
            }
            else if ( a.length > 1 
                && typeof args_ === "string"
                && this.hasOwnProperty( args_)
            ){
                this[ args_] = a[ 1 ];
            }
        }
    };
    
    $.scrollfx = scrollfx;
    $.fn.scrollfx = jqviewport_scrollfx;
    
    function setup ( opts ) {
        opts = $.isNumeric( opts ) || isElement( opts ) 
            ? { to: opts }
            : opts;
        
        var sfx = Object.defineProperties( {}, definitions );
        $.extend( sfx, methods, defaults );
        
        if ( opts.speed ) {
            if ( Object.hasOwnProperty( opts.to )) {
                sfx.to = opts.to;
            }
            else if ( Object.hasOwnProperty( opts.by )) {
                sfx.by = opts.by;
            }
        };
        $.extend( sfx, opts );
        sfx._updated = true;
        return sfx;
    }
    
    function isElement ( arg ) {
        var el = $( arg )[0];
        return typeof el === "object" && el.tagName;
    }
    
    function getViewport ( vp ) {
        var $vp = $( vp );
        
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
    
}( jQuery ));
