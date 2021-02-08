function toggleBackground(idOfLabel, ...ids) {
  for (let i = 0; i < ids.length; i++){
    document.getElementById(ids[i]).style.backgroundColor="#353839";
    document.getElementById(ids[i]).style.color="#FFFFFF";
  }
  var id = document.getElementById(idOfLabel)
  id.style.backgroundColor="#FFFFFF";
  id.style.color="#353839";
}
