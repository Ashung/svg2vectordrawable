
(function(){
    'use strict'
    
    var dialogUI = 
    "dialog {\
        text: 'Export Artboards to SVG',\
        alignChildren: 'fill',\
        exportPath: Group {\
            orientation: 'column',\
            alignChildren: 'left', \
            label: StaticText { text: 'Export Folder:' },\
            pathFormItem: Group {\
                orientation: 'row',\
                pathText: EditText {\
                    enabled: false, \
                    size: [210, 25] \
                },\
                pathBrowser: Button { \
                    text: 'Browser...', \
                    size: [80, 25] \
                }\
            }\
        },\
        exportAll: Group {\
            orientation: 'column',\
            alignChildren: 'left', \
            label: StaticText { text: 'Export All Artboards:' },\
            checkboxExportAll: Checkbox {\
                value: true,\
                text: 'Yes'\
            }\
        },\
        exportSelected: Group {\
            orientation: 'column',\
            alignChildren: 'left', \
            label: StaticText { text: 'Export Selected Artboards:' },\
            artboardList: ListBox {\
                size: [300, 200], \
                properties: { multiselect: true } \
            }\
        },\
        buttons: Group {\
            orientation: 'row',\
            cancelBtn: Button {\
                alignment: ['right', 'center'], \
                text: 'Cancel'\
            },\
            runBtn: Button {\
                alignment: ['right', 'center'], \
                text: 'OK'\
            }\
        }}";
        
    var dialog = new Window(dialogUI);
    
    var exportAll = dialog.exportAll.checkboxExportAll;
    var artboardList = dialog.exportSelected.artboardList;
    var DefaultExportFolderPath = activeDocument.fullName.parent.parent + '/svg/';
    var exportFolderPath = DefaultExportFolderPath;
    var exportPathText = dialog.exportPath.pathFormItem.pathText;
    var exportPathButton = dialog.exportPath.pathFormItem.pathBrowser;
    var runButton = dialog.buttons.runBtn;

    // Export folder
    exportPathText.text = DefaultExportFolderPath;
    exportPathButton.onClick = function() {
        var f = Folder(exportPathText.text).selectDlg('Select folder:');
        if(f != null) {
            exportPathText.text = f.fullName + '/';
        }
    }

    // Artboard list
    for(var i = 0; i < activeDocument.artboards.length; i ++ ) {
        artboardList.add('item', activeDocument.artboards[i].name);
    }
    
    if(exportAll.value) {
        artboardList.enabled = false;
    } else {
        artboardList.enabled = true;
    }

    exportAll.onClick = function() {
        if(this.value) {
            artboardList.enabled = false;
        } else {
            artboardList.enabled = true;
        }
    }


    // Button event
    runButton.onClick = function() {
        
        this.enabled = false;
        
        if(!Folder(exportFolderPath).exists) {
            Folder(exportFolderPath).create();
        }

        for(var i = 0; i < activeDocument.artboards.length; i ++ ) {
            
            if(exportAll.value || (!exportAll.value && artboardList.items[i].selected)) {
            
                activeDocument.artboards[i].name = activeDocument.artboards[i].name.replace(/\ /g, '_');
                
                var realExportFile = File(exportFolderPath + activeDocument.artboards[i].name + '_' + activeDocument.artboards[i].name + '.svg');
                var renamedFile = File(exportFolderPath + activeDocument.artboards[i].name + '.svg');
                if(renamedFile.exists) {
                    renamedFile.remove();
                }
              
                var svgOptions = new ExportOptionsSVG();
                    svgOptions.coordinatePrecision = 2;
                    svgOptions.documentEncoding = SVGDocumentEncoding.UTF8;
                    svgOptions.DTD = SVGDTDVersion.SVG1_1;
                    svgOptions.fontSubsetting = SVGFontSubsetting.None;
                    svgOptions.fontType = SVGFontType.SVGFONT;
                    svgOptions.saveMultipleArtboards = true;
                    svgOptions.artboardRange = i + 1;
                activeDocument.exportFile(File(exportFolderPath + activeDocument.artboards[i].name), ExportType.SVG, svgOptions);
                
                if(realExportFile.exists) {
                    realExportFile.rename(activeDocument.artboards[i].name + '.svg');
                }
            }
        }
        
        dialog.close();

    }

    dialog.show();

})();

