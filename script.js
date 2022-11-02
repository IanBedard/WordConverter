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


rgxUntilH1 = /.+?(?=<h1>)/;
rgxHtmlBrackets = /(?!(<\/[a-z0-9]+>))(<)/g
rgxIdSelector = /(\sid=".*")/g
rgxUselessTags = /<([a-z0-9]+)>(\n*|)<\/\1>/g
//removes the everything before the h1
output = output.replace(rgxUntilH1,"");
//creates returns after each end of tags
output = output.replaceAll(rgxHtmlBrackets,"\r\n<");  
//removes useless IDs
output = output.replaceAll(rgxIdSelector,"");  
  //removes useless Tags
  output = output.replaceAll(rgxUselessTags,""); 


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
