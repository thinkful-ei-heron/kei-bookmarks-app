const expandView = function(dataObject){
  $('.bookmarkContainer').on('click', function(){
    //generate HTML function
    let htmlString = bookmarkContainerHTML(dataObject.title, dataObject.rating, dataObject.url);
    $('.bookmarkContainer').html(htmlString);
  });
};

const bookmarkContainerHTML = function(title, rating, url){
  return `
  <p class="singleBookmarkContainer"><span class="bookmarkName">${title}</span><span class="bookmarkRating"> ${rating} </span></p>
  <div class="bookmarkExpanded">
    <a class="visitLink" href = '${url}'><button class="visitButton">Visit Site!</button></a>
  </div>
  <div class="descriptionExpanded">
    <p>Wikipedia is a free online encyclopedia, created and edited by volunteers around the world and hosted by the Wikimedia Foundation.</p>
  </div>
  <div class="deleteButton">
    <button class="deleteButton">Delete Bookmark</button>
  </div>
  `;
};

expandView();