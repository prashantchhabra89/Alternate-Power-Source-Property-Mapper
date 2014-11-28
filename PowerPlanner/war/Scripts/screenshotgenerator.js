/*this script is responsible for generating screenshot of client side using html2canvas*/
function generateImage() {
	pixelsCalculatorForStaticmaps();
	//generating screenshot of whole body
   html2canvas($("#bodytag"), {
	   //when canvas is rendered
     onrendered: function(canvas) {
         var myImage = canvas.toDataURL("image/png");
         //opens image in new window
         window.open(myImage);
       }
  });
};