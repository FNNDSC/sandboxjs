# sandboxjs
JS library for file management in a browser (chrome &amp; edge) sandbox

To use as a npm package
-----------------------

.. code-block:: bash

 $> npm install sanboxjs@1.0.0


Import in your app.js
-----------------------

.. code-block:: bash

  import sandbox from 'sanboxjs'


Push multiple files into browser sandbox
---------------------------------------

.. code-block:: bash

  var sbx = new sandbox();
  var uploadDir = 'my/uploads/'
  sbx.writeFile(files,uploadDir)
  
  
Download a file from the sandbox
---------------------------------

.. code-block:: bash
  
  sbx.downloadFile('my/uploads/my-file.txt');


