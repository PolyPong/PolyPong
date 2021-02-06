let skinSelected="white";


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
