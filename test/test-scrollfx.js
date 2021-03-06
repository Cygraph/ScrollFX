/*
test-breakspaces.js
Designer: © Michael Schwarz, CyDot
Updated: 2019-03-10
*/


( function ( $ ) {
    
    $.test = function ( e ) {
        console.log( "test", e );
    }
    $.test2 = function ( e ) {
        console.log( "test 2", e );
    }
    
    var opts = {
        to: ".box-inner-8",
        offset: 0,
        speed: 6,
        scrolled: scrolled,
        viewport: ".box-2"
    };
    
    function onDoc () {
        $.scrollfx.defaults( "useSpeed", true );
        $.scrollfx.register();
        
        $.scrollfx( opts );
        $( ".button-2" ).click( opts, $.scrollfx );
        
        $.scrollfx.data( ".button-1", { scrolled: $.test2, speed: 5 });
        
        
    }
    
    function scrolled ( sfx ) {
        console.log( "scrolled", sfx );
        
        opts.speed = 4.44;
        //$( ".button-2" ).off( "click", $.scrollfx );
    }
    
    // -----------------------------------------------
    
    $( document ).ready( onDoc );
    
})( jQuery );
