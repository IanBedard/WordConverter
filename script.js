(function() {
    document.getElementById("document")
        .addEventListener("change", handleFileSelect, false);
        
    function handleFileSelect(event) {
        readFileInputEventAsArrayBuffer(event, function(arrayBuffer) {
            mammoth.convertToHtml({arrayBuffer: arrayBuffer})
      
                .then(displayResult)
                .done();
        });
    }
    
function displayResult(result) {
let output = result.value;
/*----------------------------------------------------------------*/
rgxArray = [
    /.+?(?=<h1>)/g,
    /(?!(<\/[a-z0-9]+>))(<)/g,
    /(\sid=".*")/g,
    /<([a-z0-9]+)>(\n+|)<\/\1>/gm,
    /<table(.*?)>/gm

            ]

rgxReplaceArray = [
    "",
    "\n<",
    "",
    "",
    "<table class='table table-bordered' style='table-layout: fixed;' >"
  
                  ]


rgxArray.forEach((regex,i)=>{
    if (i===3){
        let e=0;
        while (e < 6) {
            output = output.replaceAll(regex,rgxReplaceArray[i])
            e++;
          }}

output = output.replaceAll(regex,rgxReplaceArray[i])


});

/*----------------------------------------------------------------*/
document.getElementById("output").innerHTML = output;
        
        var messageHtml = result.messages.map(function(message) {
            return '<li class="' + message.type + '">' + escapeHtml(message.message) + "</li>";
        }).join("");
        
        document.getElementById("messages").innerHTML = "<ul>" + messageHtml + "</ul>";

        $("#html-data").val(output);
    }
    
    function readFileInputEventAsArrayBuffer(event, callback) {
        var file = event.target.files[0];

        var reader = new FileReader();
        
        reader.onload = function(loadEvent) {
            var arrayBuffer = loadEvent.target.result;
            callback(arrayBuffer);
        };
        
        reader.readAsArrayBuffer(file);
    }

    function escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
  
    
})();
