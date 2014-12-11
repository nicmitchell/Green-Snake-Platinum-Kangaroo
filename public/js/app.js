/*
  A litte UI for changing the source of input for the Audio tag.
  You can point to a remote Audio file.
  <input> field's visibility is based on the status fo the checkbox
*/

// controls the visibility of the input field
$('#box').click(function(){
   var isChecked = $('#box').prop('checked');
   if (isChecked) {
    $('#loader').removeClass('hidden');
   } else {
    $('#loader').addClass('hidden');
   }
});

// updates the src on the audio tag
// * should add some validation here
$("#load").click(function(){
  var dest = $("#link").val();
  // a little easter egg for Doctor Who fans
  if ( dest === "who") {
    $('audio').attr("src", 'sounds/doctor_who_theme_full.mp3');
  } // otherwise just load the remote file
    else {
    $('audio').attr("src", $("#link").val());
  }

});
// end
window.onload = function() {
  var visualizer = new Visualizer();
  debugger;
  visualizer.init();
};