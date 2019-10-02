const main = function(){
  dropdown();
};

const dropdown = function(){
  $('.dropdownButton').on('click', event => {
    $('.dropdownContent').toggleClass('show');
  });
  $(document).click(function (event) {
    event.stopPropagation();
    let container = $('.dropdown');
    //check if the clicked area is dropDown or not
    if (container.has(event.target).length === 0) {
      $('.dropdownContent').removeClass('show');
    }
  });
};

main();