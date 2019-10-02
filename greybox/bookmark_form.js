const submitForm = function(){
  $('.newBookmarkForm').on('submit', function(event){
    event.preventDefault();
    let myForm = document.getElementById('newBookmarkForm');
    let formData = new FormData(myForm);
    console.log(formData.get('newBookmarkName'));
    return formData;
  });
};

submitForm();