import 'regenerator-runtime/runtime';
import axios from 'axios';
import JSZip from 'jszip';
//import { sandbox } from './sandbox'
import FileSaver from 'file-saver';
let fs;



const upload = document.getElementById("upload");
const submit = document.getElementById("submit");
const download = document.getElementById("download");

function onDeviceReady(callback) {
        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(window.TEMPORARY, 5*1024*1024*1024, gotFS, fail);
}

function gotFS(fileSystem) {
        var self = fs;
        self = fileSystem;
        //fileSystem.root.getDirectory("mynewfolder", {create: true}, gotDir,fail);
        console.log(fileSystem.root);

}
function createPath(path){
    var self = fs;
    if(fs){
      fs.root.getDirectory(path, {create: true}, gotDir,fail);
      console.log("here")
    }
    else{
      onDeviceReady(createPath)
    }
}

function gotDir(dirEntry) {
        dirEntry.getFile("myfile.txt", {create: false, exclusive: true}, gotFile,fail);
}

function gotFile(fileEntry) {
        fileEntry.createWriter(function(fileWriter) {
            fileWriter.onwriteend = function(){
                console.log("success");
                console.log(fs)};



              var blob = new Blob([upload.files[0]]);
              fileWriter.write(blob);
              

            }, fail);
            
}  

function fail(error) {
    console.log(error);
}

submit.onclick=function(){
    var sbx = new sandbox();
    //sbx.onDeviceReady();
    //sbx.createPath("test");
    var filePath = "test/"+ upload.files[0].name
    sbx.writeFile(filePath,upload.files[0]);
    
    

}
let fileHandle;
download.onclick= async function(){
    var sbx = new sandbox();
    var filePath = "test/"+ upload.files[0].name

    console.log("fetching files")
    sbx.isFile(filePath)
    //var blob =  sbx.is("test")
    //const filename = `test.zip`;

    
    
    

}

function sandbox(){
        this.fs = null;
  }
    
sandbox.prototype.onDeviceReady=function(callback){
      var self = this;

      // The file system has been prefixed as of Google Chrome 12:
      window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    
      if (window.requestFileSystem) {
        window.requestFileSystem(window.TEMPORARY, 5*1024*1024*1024, function(fs){
          self.fs = fs;
          console.log("Getting new FS")
          if(callback){callback();}
        }, function(err) {throw new Error('Could not grant filesystem. Error code: ' + err.code);});
      } 
 }
 
 sandbox.prototype.createPath=function(path, callback){
     var self=this;
     function createPath(){
       console.log(self.fs)
        // exclusive:false means if the folder already exists then don't throw an error
        self.fs.root.getDirectory(path, {create: true, exclusive:false}, function(dirEntry) {
            // Recursively add the new subfolder (if we still have another to create).
            
            dirEntry.getFile(".",{create:false},function(files){
              console.log(files);});
            if(callback){callback();}
          }, self.onFail);
     }
 

     if(this.fs){
        createPath(); 
         }
       else
       {
         this.onDeviceReady(createPath);
         }
 }
 
 sandbox.prototype.onFail = function(error){
     console.log(error);
 }
 
sandbox.prototype.isFile = function(filePath, callback) {
      var self = this;

      function findFile() {

        function errorHandler(err) {
          window.console.log('File not found. Error code: ' + err.code);
          //callback(null);
        }

        self.fs.root.getFile(filePath, {create: false}, function(fileEntry) {
          // Get a File object representing the file,
          fileEntry.file(async function(fileObj) {
            //console.log(fileObj)
            var zip = JSZip();
            zip.file(filePath, fileObj)
            
            const blob = await zip.generateAsync({ type: "blob" });
            FileSaver.saveAs(blob, "download.zip");

          }, errorHandler);
        }, errorHandler);
      }

      if (this.fs) {
        findFile();
      } else {
        this.onDeviceReady(findFile);
      }
    };

sandbox.prototype.readFile = function(filePath, callback) {

      this.getFileBlob(filePath, function(fileObj) {
        var reader = new FileReader();

        reader.onload = function() {
          console.log(this.result);
        };

        if (fileObj) {
          console.log("reading file")
          return reader.readAsArrayBuffer(fileObj);
           
        } else {
          callback(null);
        }
      });
    };
    
sandbox.prototype.getFileBlob = function(filePath, callback) {
      var self = this;

      function getFile() {

        function errorHandler(err) {
          window.console.log('Could not retrieve file object. Error code: ' + err.code);
          if(callback){callback();}
        }
        console.log(filePath)
        self.fs.root.getFile(filePath, {create: false}, function(fileEntry) {
          

          // Get a File object representing the file,
          fileEntry.file(function(fileObj) {
            return fileObj
            callback(fileObj);
          }, errorHandler);
        }, errorHandler);
      }

      if (this.fs) {
        getFile();
      } else {
        this.onDeviceReady(getFile);
      }
    };

 
sandbox.prototype.writeFile = function(filePath, fileData, callback) {
      var self = this;

      function checkPathAndWriteFile() {

        function errorHandler(err) {
          window.console.log('Could not write file. Error code: ' + err.code);
          if (callback) {
            callback(null);
          }
        }

        function writeFile() {

          self.fs.root.getFile(filePath, {create: true}, function(fileEntry) {
            
            // Create a FileWriter object for our FileEntry (filePath).
            fileEntry.createWriter(function(fileWriter) {
              
              fileWriter.onwriteend = function() {
                
                //if (callback) {
                  // Get a File object representing the file,
                  //fileEntry.file(function(fileObj) {
                    //callback(fileObj);
                  //}, errorHandler);
                //}
                console.log("success")
              };
              

              fileWriter.onerror = function(err) {
                window.console.log('Could not write file. Error code: ' + err.toString());
                if (callback) {
                  callback(null);
                }
              };
              
              var blob = new Blob([fileData]);
              fileWriter.write(blob);
              console.log(fileData + "pushed")

            }, self.onFail);
          }, self.onFail);
        }

        var basedir = filePath.substring(0, filePath.lastIndexOf('/'));
        console.log(filePath)
        self.fs.root.getDirectory(basedir, {create: false}, function() {
          console.log(basedir + "created")
          writeFile();
        }, self.onFail );
      }

      if (this.fs) {
        checkPathAndWriteFile();
      } else {
        this.onDeviceReady(checkPathAndWriteFile);
      }

    };

