/*
test-breakspaces.js
Designer: © Michael Schwarz, CyDot
Updated: 2019-01-09
*/


( function ( $ ) {
    
    var opts = {
        to: ".box-6",
        offset: 20,
        speed: 6,
        onscroll: onscroll
    }
    
    
    function onDoc () {
        $.scrollfx.defaults( "useSpeed", true );
        $.scrollfx.register();
        
        
        
        
        //$.scrollfx( opts );
        $( ".button-2" ).click( opts, $.scrollfx );
        
        $.scrollfx.data( ".button-1", "onscroll", onscroll );
        var data1 = $.scrollfx.data( ".button-1" );
        console.log( "ondoc", data1 );
    }
    
    function onscroll ( sfx ) {
        console.log( "onscroll", sfx );
        opts.speed = 4.44;
        //$( ".button-2" ).off( "click", $.scrollfx );
    }
    
    // -----------------------------------------------
    
    $( document ).ready( onDoc );
    
})( jQuery );
