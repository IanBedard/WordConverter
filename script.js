
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
    /<br(\s)?\/>/g,
    /(<h2> )/g,
    /(\W<\/h2>)/g,
    /(>)\n+(?=\w)/gm,
    /<em> <\/em>/g
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
    "",
    "<h2>",
    "</h2>",
    ">",
    "",
                  ]

//applying the arrays above 
rgxArray.forEach((regex,i)=>{
    if (i===3){
        let e=0;
        while (e < 6) {
            output = output.replaceAll(regex,rgxReplaceArray[i])
            e++;
          }}
          if (i===9){
            let e=0;
            while (e < 3) {
             //console.log(regex)
                output = output.replaceAll(regex,rgxReplaceArray[i])
                e++;
              }}
output = output.replaceAll(regex,rgxReplaceArray[i])


});
$("#h2button").click(function(){  
function H2sRegex(){
//*** Applying IDS to H2s */
console.log("H2sRegex")
//this will contain the id name after the first loop so it can apply the same id to On this Page
let IDs=[]

output.match(/<h2>.+<\/h2>/g).forEach(element => {
    let elementID = element.match(/(?!<h2>)([a-zA-ZÀÂÉÊÈËÌÏÎÔÙÛÇÆŒàâéêèëìïîôùûçæœ]+)(?=<\/h2>)/g);
    let negLook = element.match(/(?!<h2>)([a-zA-ZÀÂÉÊÈËÌÏÎÔÙÛÇÆŒàâéêèëìïîôùûçæœ]|\d|\s)+<\/h2>/g)
    IDs.push(elementID)
    console.log("element ID: " + elementID)
    console.log("negative look: " + negLook)
    output = output.replace(element, '<h2 id="'+elementID[0]+'">'+negLook[0])
});

if (IDs[0] == 'page') {
  IDs.shift()
const groupOnThisPage = /((id="page")(.|\n)+?<ul>)(.|\n)+?(<\/ul>+?)/gm;
const liOnThisPage = /<li>(.)+<\/li>/g;
const posLookBehind = /(?<=<li>)(.)+(?=<\/li>)/g
const group = output.match(groupOnThisPage);
const allLI = group[0].match(liOnThisPage);
allLI.forEach((element,i) => {
    let content = element.match(posLookBehind);
    output = output.replace(element, '<li><a href="#'+IDs[i]+'">'+content+'</a></li>');
    //<li><a href="---">content</a></li>
});

}
else{console.log(false)}
}
});


//*** applying accronyms */
$.each(json_data, function(i, e){
    let tag = JSON.stringify(e.tag);
    let accronym = RegExp(e.accronym, "g");
    console.log("acctronyms: " + RegExp(e.accronym, "g"))
    tag = tag.slice(0, -1);
    tag = tag.substring(1);
   tag = tag.replaceAll("'",'"');
    console.log("tags: " + tag)
    output = output.replaceAll(accronym,  tag)
  
  });


/*----------------------------------------------------------------*/
document.getElementById("output").innerHTML = output;
        
     

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