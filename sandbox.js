/**
 * This file manager module takes care of all file reading and saving operations
 * on browser filesystem (reading/writing the HTML5 sandboxed file system.)
 *
 * SUPPORTED BROWSERS
 * - Google Chrome, Microsoft Edge, Chromium
 *
 * FEATURES
 * - Read/write files from/to HTML5 sandboxed file system
 *
 * TECHNOLOGY
 * - HTML5 filesystem API
 */
import JsZip from 'jszip';
import FileSaver from 'file-saver';
export default class sandbox{
  
  /**
   * A constructor that initializes the File System as null
   *
   */
  constructor(){
        this.fs = null;
  }
  
  /**
   * Request sandboxed filesystem for sone amount of memory (here 5GB)
   *
   * @param {Function} callback Optional callback who argument is the 
   *                            drectory entry or null otherwise
   */ 
  onDeviceReady=function(callback){
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
   };
   
   /**
    * Upload an array of files in a given diectory path inside the FS
    *
    * @param {Array} files      An array of File object
    * @param {String} uploadDir Path where the array of files is to be stored
    *
    */
   uploadFiles=function(files,uploadDir){
     for(var i=0; i<files.length; i++){
       var filePath = uploadDir+files[i].name;
       this.writeFile(filePath,files[i])
     }
   };
   
   /**
    *
    * Create a path inside the FS with the given pathname
    *
    * @param {String}   path       Path to be created inside the FS
    * @param {Function} callaback  Optional callback whose argument is
    *                              the directory entry or null otherwise
    */
   
   createPath=function(path, callback){
     var self=this;
     function createPath(){
     
       function createFolder(rootDirEntry, folders){
       

         // exclusive:false means if the folder already exists then don't throw an error
         rootDirEntry.getDirectory(folders[0], {create: true, exclusive:false}, function(dirEntry) {
            // Recursively add the new subfolder (if we still have another to create).
            
            folders = folders.slice(1);
            if(folders.length){
              createFolder(dirEntry, folders);
            }else if(callback){
              callback(dirEntry);
            }
          }, self.onDirCreateFail);
          
        }
          
          // recusrsively create folder/sub-dirs
          var folders = path.split("/");
          createFolder(self.fs.root,folders);
     }
 

     if(this.fs){
        createPath(); 
         }
       else
       {
         this.onDeviceReady(createPath);
         }
   };
  
  /**
   * Download a file from a given file path
   *
   * @param {String}   filePath The path inside the FS containing the file
   * @param {Function} callback Optional function whose arguemnt is the file blob
   *                            or null otherwise
   */
  downloadFile = function(filePath, callback) {
      var self = this;

      function findFile() {

        function errorHandler(err) {
          window.console.log('File not found. Error code: ' + err.code);
          //callback(null);
        }

        self.fs.root.getFile(filePath, {create: false}, function(fileEntry) {
          // Get a File object representing the file,
          fileEntry.file(async function(fileObj) {
            const url = window.URL.createObjectURL(new Blob([fileObj]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileObj.name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

          }, errorHandler);
        }, errorHandler);
      }

      if (this.fs) {
        findFile();
      } else {
        this.onDeviceReady(findFile);
      }
    };
  
  /**
   * Read a file from the sandboxed FS
   *
   * @param {String}   filePath The path inside FS cobtaining the file
   * @param {Function} callback Optional callback function whose argument is the
   *                            the file blob or null otherwise
   */
  readFile = function(filePath, callback) {

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
  
  /**
   * Get a File object from the sandboxed FS
   *
   * @param {String} filePath The path iniside FS containing the file
   * @param {Function} callback Optional callback function whose argument is 
   *                            a file object or null otherwise
   */
  getFileBlob = function(filePath, callback) {
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

  /**
   * Write a file to the sandboxed FS 
   *
   * @param {String}   filePath The path of the file
   * @param {Array}    fileData ArrayBuffer object containing file data
   * @param {Function} callback Optional callback function whose argument is the 
   *                            File object or null otherwise
   */
  writeFile = function(filePath, fileData, callback) {
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
          }, self.onFileCreateFail);
        }

        var basedir = filePath.substring(0, filePath.lastIndexOf('/'));
        console.log(basedir)
        self.createPath(basedir,writeFile);
        
        //writeFile();

      }

      if (this.fs) {
        checkPathAndWriteFile();
      } else {
        this.onDeviceReady(checkPathAndWriteFile);
      }

    };
    
   /**
    * A list of error methods to provide specific error
    * message while performing a specific task
    *
    *
    */
    
   onFail = function(error){
     console.log(error);
   }
   onDirCreateFail = function(error){
     console.log("Error while creating dir: "+error);
   }
   onFileCreateFail = function(error){
     console.log("Error while creating file: "+error);
   }
   onFileGetFail = function(error){
     console.log("Error while fetching a file: "+error);
   }
   onBlobGetFail = function(error){
     console.log("Error while fetching a file blob: "+ error);
   }
}
