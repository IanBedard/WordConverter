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
    /.+?(?=<h1>)/g,//remove all above the h1
    /(?!(<\/[a-z0-9]+>))(<)/g,//adds a new line to every closing tag
    /(\sid=".*")/g,//remove ids
    /<([a-z0-9]+)>(\n+|)<\/\1>/gm,//gets all tag with nothing between themselves
    /<table(.*?)>/gm,//gets the table tag
    /(?<=<table(.*?)>\n*?)(<tr>)/gm,//gets the first tr tag after table

            ]

rgxReplaceArray = [
    "",
    "\n<",
    "",
    "",
    "<table class='table table-bordered' style='table-layout: fixed;'>",
    "<tr class='active'>"
    
  
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
$('#copy-txt')[0].onclick = ()=>{ navigator.clipboard.writeText($('#html-data')[0].value)}