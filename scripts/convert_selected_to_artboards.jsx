


var selectedObjects = activeDocument.selection;

for(var i = 0; i < selectedObjects.length; i ++) {
    var rect = [];
    for(var j = 0; j < selectedObjects[i].controlBounds.length; j ++) {
        rect.push(Math.round(selectedObjects[i].controlBounds[j]));
    }
    //$.writeln(rect);
    activeDocument.artboards.add(rect);
    selectedObjects[i].remove();
}
