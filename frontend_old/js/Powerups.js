let powerUpsSelected=[];
let skinSelected="white";

function highlightPowerUps(idOfElement) {
  var id = document.getElementById(idOfElement)
  if((id.style.backgroundColor == document.getElementById('header').style.backgroundColor) && (powerUpsSelected.length < 3)) {
    id.style.backgroundColor="#FFFFFF";
    id.style.color="#353839";
    powerUpsSelected.push(idOfElement)
  } else {
    id.style.backgroundColor="#353839";
    id.style.color="#FFFFFF";

    for (powerUp in powerUpsSelected){
      if(powerUpsSelected[powerUp]==idOfElement){
        powerUpsSelected.splice(powerUp, 1);
      }
    }
  }
}

function highlightSkins(idOfSkin){
  if (idOfSkin == skinSelected){
    return true;
  } else if (idOfSkin == "white"){
    document.getElementById(skinSelected).style.backgroundColor = "#353839";
    document.getElementById(skinSelected).style.color = skinSelected;
    document.getElementById(idOfSkin).style.backgroundColor = idOfSkin;
    document.getElementById(idOfSkin).style.color = "#353839";
    skinSelected = idOfSkin;
  } else {
    document.getElementById(skinSelected).style.backgroundColor = "#353839";
    document.getElementById(skinSelected).style.color = skinSelected;
    document.getElementById(idOfSkin).style.backgroundColor = idOfSkin;
    document.getElementById(idOfSkin).style.color = "#FFFFFF";
    skinSelected = idOfSkin;
  }

}
