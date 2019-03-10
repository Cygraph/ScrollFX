/*
test-breakspaces.js
Designer: © Michael Schwarz, CyDot
Updated: 2019-03-10
*/


( function ( $ ) {
    
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
        
        
    }
    
    function scrolled ( sfx ) {
        console.log( "scrolled", sfx );
        
        opts.speed = 4.44;
        //$( ".button-2" ).off( "click", $.scrollfx );
    }
    
    // -----------------------------------------------
    
    $( document ).ready( onDoc );
    
})( jQuery );
