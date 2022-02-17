import 'regenerator-runtime/runtime';
import axios from 'axios';
import JSZip from 'jszip';
import sandbox from './sandbox'
import FileSaver from 'file-saver';
let fs;



const upload = document.getElementById("upload");
const submit = document.getElementById("submit");
const download = document.getElementById("download");


var fileDir = "uploads/"+Date.now() + "/";
submit.onclick=function(){
    var sbx = new sandbox();
    //sbx.onDeviceReady();
    //sbx.createPath("test");
    var filePath = fileDir + upload.files[0].name
    sbx.writeFile(filePath,upload.files[0]);
    
    

}
let fileHandle;
download.onclick= async function(){
    var sbx = new sandbox();
    var filePath = fileDir + upload.files[0].name

    console.log("fetching files")
    sbx.isFile(filePath)
    //var blob =  sbx.is("test")
    //const filename = `test.zip`;

    
    
    

}



