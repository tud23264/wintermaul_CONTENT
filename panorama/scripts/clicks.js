"use strict";

// Handle Right Button events
function OnRightButtonPressed()
{
	$.Msg("OnRightButtonPressed")

	var iPlayerID = Players.GetLocalPlayer();
	var mainSelected = Players.GetLocalPlayerPortraitUnit();
	var cursor = GameUI.GetCursorPosition();
	var mouseEntities = GameUI.FindScreenEntities( cursor );
	mouseEntities = mouseEntities.filter( function(e) { return e.entityIndex != mainSelected; } )
	
	var pressedShift = GameUI.IsShiftDown();

	// Builder Right Click
	if ( IsBuilder( mainSelected ) )
	{
		// Cancel BH
		SendCancelCommand();

		// If it's mousing over entities
		if (mouseEntities.length > 0)
		{
			for ( var e of mouseEntities )
			{
				// Repair rightclick
				if ( IsCustomBuilding(e.entityIndex) && Entities.GetHealthPercent(e.entityIndex) < 100 && Entities.IsControllableByPlayer( e.entityIndex, iPlayerID ) ){
					$.Msg("Player "+iPlayerID+" Clicked on a building unit with health missing")
					GameEvents.SendCustomGameEventToServer( "repair_order", { pID: iPlayerID, mainSelected: mainSelected, targetIndex: e.entityIndex, queue: pressedShift })
					return true;
				}
				return false;
			}
		}
			
	}

	return false;
}

// Builders require the "builder" label in its unit definition
function IsBuilder( entIndex ) {
	return (Entities.GetUnitLabel( entIndex ) == "builder")
}

// Main mouse event callback
GameUI.SetMouseCallback( function( eventName, arg ) {
    var CONSUME_EVENT = true;
    var CONTINUE_PROCESSING_EVENT = false;

    if ( GameUI.GetClickBehaviors() !== CLICK_BEHAVIORS.DOTA_CLICK_BEHAVIOR_NONE )
        return CONTINUE_PROCESSING_EVENT;

    var mainSelected = Players.GetLocalPlayerPortraitUnit()

    if ( eventName === "pressed" && IsBuilder(mainSelected))
    {
        // Left-click with a builder while BH is active
        if ( arg === 0 && state == "active")
        {
            return SendBuildCommand();
        }

        // Right-click (Cancel & Repair)
        if ( arg === 1 )
        {
            return OnRightButtonPressed();
        }
    }
    else if ( eventName === "pressed" || eventName === "doublepressed")
    {
        // Left-click
        if ( arg === 0 )
        {
            //OnLeftButtonPressed();
            return CONTINUE_PROCESSING_EVENT;
        }

        // Right-click
        if ( arg === 1 )
        {
            return OnRightButtonPressed();
        }
    }
    return CONTINUE_PROCESSING_EVENT;
} );