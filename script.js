
$(document).ready(()=>{
    $.getJSON("json/abbr.json", (data)=>{

        json_data = data
      
    }).fail(()=>{
        console.log("An error has occurred.");
    });
});
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
    /<strong>(\s)?<\/strong>/g,
    /<p>(\s)?<\/p>/g,
    /(<h2> )/g
            ]

rgxReplaceArray = [
    "",
    "\n<",
    "",
    "",
    '<table class="table table-bordered" style="table-layout: fixed;">',
    '<tr class="active">',
    "",
    "",
    "<h2>",
                  ]


rgxArray.forEach((regex,i)=>{
    if (i===3){
        let e=0;
        while (e < 6) {
            console.log()
            output = output.replaceAll(regex,rgxReplaceArray[i])
            e++;
          }}

output = output.replaceAll(regex,rgxReplaceArray[i])


});

$.each(json_data, function(i, e){
    let tag = JSON.stringify(e.tag);
    let accronym = RegExp(e.accronym, "g");
    console.log("acctronyms: " + RegExp(e.accronym, "g"))
    console.log("tags: " + tag)
    output = output.replaceAll(accronym,  tag)
  
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
$('#copy-txt')[0].onclick = ()=>{ navigator.clipboard.writeText($('#html-data')[0].value)
alert("copied text to clipboard")}