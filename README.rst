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


Push a file into browser sandbox
--------------------------------

.. code-block:: bash

  var sbx = new sandbox();
  sbx.writeFile(filePath,fileBlob)


