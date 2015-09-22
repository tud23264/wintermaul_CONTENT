"use strict";

var skip = false

function OnUpdateSelectedUnit( event )
{
	if (skip == true){
		skip = false;
		//$.Msg("skip")
		return
	}

	var iPlayerID = Players.GetLocalPlayer();
	var selectedEntities = Players.GetSelectedEntities( iPlayerID );
	var mainSelected = Players.GetLocalPlayerPortraitUnit();

	//$.Msg( "Player "+iPlayerID+" Selected Entities ("+(selectedEntities.length)+")" );
	if (selectedEntities.length > 1 && IsMixedBuildingSelectionGroup(selectedEntities) ){
		$.Msg( "IsMixedBuildingSelectionGroup, proceeding to deselect the buildings and get only the units ")

		skip = true;
		GameUI.SelectUnit(FirstNonBuildingEntityFromSelection(selectedEntities), false); // Overrides the selection group

		for (var i = 0; i < selectedEntities.length; i++) {
			skip = true; // Makes it skip an update
			if (!IsCustomBuilding(selectedEntities[i])){
				GameUI.SelectUnit(selectedEntities[i], true);
			}
		}	
	}

	$.Schedule(0.03, SendSelectedEntities);
}

function FirstNonBuildingEntityFromSelection( entityList ){
	for (var i = 0; i < entityList.length; i++) {
		if (!IsCustomBuilding(entityList[i])){
			return entityList[i]
		}
	}
	return 0
}

function GetFirstUnitFromSelectionSkipUnit ( entityList, entIndex ) {
	for (var i = 0; i < entityList.length; i++) {
		if ((entityList[i]) != entIndex){
			return entityList[i]
		}
	}
	return 0
}

function SendSelectedEntities (params) {
	var iPlayerID = Players.GetLocalPlayer();
	var newSelectedEntities = Players.GetSelectedEntities( iPlayerID );
	GameEvents.SendCustomGameEventToServer( "update_selected_entities", { pID: iPlayerID, selected_entities: newSelectedEntities })
}

function IsBaseName( unitName ){
	if (unitName.indexOf("human") != -1){
		if ( (unitName.indexOf("town_hall") != -1) || (unitName.indexOf("keep")!= -1) || (unitName.indexOf("castle")!= -1) ){
			return true
		}
		else return false
	}
	else if (unitName.indexOf("nightelf") != -1){
		if ( (unitName.indexOf("tree_of_life") != -1) || (unitName.indexOf("tree_of_ages")!= -1) || (unitName.indexOf("tree_of_eternity")!= -1) ){
			return true
		}
		else return false
	}
	else if (unitName.indexOf("undead") != -1){
		if ( (unitName.indexOf("necropolis") != -1) || (unitName.indexOf("halls_of_the_dead")!= -1) || (unitName.indexOf("black_citadel")!= -1) ){
			return true
		}
		else return false
	}
	else if (unitName.indexOf("orc") != -1){
		if ( (unitName.indexOf("great_hall") != -1) || (unitName.indexOf("stronghold")!= -1) || (unitName.indexOf("fortress")!= -1) ){
			return true
		}
		else return false
	}
	else return false
}

// Returns whether the selection group contains both buildings and non-building units
function IsMixedBuildingSelectionGroup ( entityList ) {
	var buildings = 0
	var nonBuildings = 0
	for (var i = 0; i < entityList.length; i++) {
		if (IsCustomBuilding(entityList[i])){
			buildings++
		}
		else {
			nonBuildings++
		}
	}
	//$.Msg( "Buildings: ",buildings, " NonBuildings: ", nonBuildings)
	return (buildings>0 && nonBuildings>0)
}

function IsCustomBuilding( entityIndex ){
	var ability_building = Entities.GetAbilityByName( entityIndex, "ability_building")
	return (ability_building != -1)
}

function AddToSelection ( args ) {
	var entIndex = args.ent_index

	$.Msg("Add "+entIndex+" to Selection")

	GameUI.SelectUnit(entIndex, true)
	OnUpdateSelectedUnit( args )
}

function RemoveFromSelection ( args ) {
	var entIndex = args.ent_index
	var iPlayerID = Players.GetLocalPlayer();
	var selectedEntities = Players.GetSelectedEntities( iPlayerID );

	$.Msg("Remove "+entIndex+" from Selection")

	skip = true;
	GameUI.SelectUnit(GetFirstUnitFromSelectionSkipUnit(selectedEntities, entIndex), false); // Overrides the selection group

	for (var i = 0; i < selectedEntities.length; i++) {
		skip = true; // Makes it skip an update
		if ((selectedEntities[i]) != entIndex){
			GameUI.SelectUnit(selectedEntities[i], true);
		}
	}
	OnUpdateSelectedUnit( args )
}

(function () {
	GameEvents.Subscribe( "add_to_selection", AddToSelection );
	GameEvents.Subscribe( "remove_from_selection", RemoveFromSelection);
	GameEvents.Subscribe( "dota_player_update_selected_unit", OnUpdateSelectedUnit );
})();