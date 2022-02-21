import 'regenerator-runtime/runtime';
import sandbox from './sandbox'



let fs;
const upload = document.getElementById("upload");
const submit = document.getElementById("submit");
const download = document.getElementById("download");
var fileDir = "uploads/"+Date.now() + "/";

/**
 * Event call on submit button click
 *
 */
submit.onclick=function(){
    var sbx = new sandbox();
    sbx.uploadFiles(upload.files,fileDir);
}

/**
 * Event call on download button click
 *
 *
 */
download.onclick= async function(){
    var sbx = new sandbox();
    var filePath = fileDir + upload.files[0].name;
    sbx.downloadFile(filePath);
}



