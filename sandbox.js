export default class sandbox{
  //
  //
  //\
  //
  //
  
  constructor(){
        this.fs = null;
  }
  
  //
  //
  //
  //
  // 
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
   }
   
   //
   //
   //
   //
   
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
   }
 
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
     console.log(error);
   }
   onBlobGetFail = function(error){
     console.log(error);
   }
  
  //
  //
  //
  //
  //
  //
  //
  isFile = function(filePath, callback) {
      var self = this;

      function findFile() {

        function errorHandler(err) {
          window.console.log('File not found. Error code: ' + err.code);
          //callback(null);
        }

        self.fs.root.getFile(filePath, {create: false}, function(fileEntry) {
          // Get a File object representing the file,
          fileEntry.file(function(fileObj) {
            console.log(fileObj)
            const url = window.URL.createObjectURL(new Blob([fileObj]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filePath);
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
  
  //
  //
  //
  //\
  //
  //
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
  
  //
  //
  //
  //\
  //  
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

  //
  //
  //
  //
  //
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
}
