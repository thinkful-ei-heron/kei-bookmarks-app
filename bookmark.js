import store from './store.js';
import api from './api.js';

const handleNewBookmark = function(){
  $('.js-main-space').on('submit', function(event){
    event.preventDefault();
    let formData = new FormData(document.getElementById('newBookmarkForm'));
    let bookmarkObject = {
      title: formData.get('newBookmarkName'),
      rating: formData.get('rating'),
      url: formData.get('newBookmarkURL'),
      desc: formData.get('description'),
    };
    api.createBookmark(bookmarkObject)
      .then(newBookmark => {
        newBookmark.expanded = false;
        store.addBookmark(newBookmark);
        store.adding = false;
        storeContract();
        renderData();
      })
      .catch(error => {
        store.error = true;
        renderError(error.message);
      });
  });
};

const deleteBookmark = function(){
  $('.js-main-space').on('click', '.deleteButton', function(event){
    event.preventDefault();
    let obj = $(this).closest('.bookmarkContainer');
    let id = obj.data('bookmark-id');
    if (typeof(store.findById(id)) !== 'undefined'){
      store.deleteBookmark(id);
      api.deleteBookmark(id)
        .then(function() {
          renderData();
        })
        .catch(error => {
          store.error = true;
          renderError(error.message);
        });
    }
  });
  syncStoreWithAPI();
};

const generateBookmarkElement = function(bookmark){
  if(bookmark.expanded){
    return `
    <div class="bookmarkContainer" data-bookmark-url = ${bookmark.url} data-bookmark-id = ${bookmark.id}>
      <p class="singleBookmarkContainer"><span class="bookmarkName">${bookmark.title}</span><span class="bookmarkRating"> ${bookmark.rating} </span></p>
      <div class="bookmarkExpanded">
        <a class="visitLink" href = '${bookmark.url}'><button class="visitButton">Visit Site!</button></a>
      </div>
      <div class="descriptionExpanded">
        <p>${bookmark.desc}</p>
      </div>
      <div class="deleteButton">
        <button class="deleteButton">Delete Bookmark</button>
      </div>  
    </div>
    `;
  } else {
    return `
    <div class="bookmarkContainer" data-bookmark-url = ${bookmark.url} data-bookmark-id = ${bookmark.id}>
      <p class="singleBookmarkContainer"><span class="bookmarkName">${bookmark.title}</span><span class="bookmarkRating">Rating: ${bookmark.rating}</span></p>
    </div> `;
  }
};

const generateBookmarkList = function(bookmarkList){
  //filter through bookmarlist based on filter property of store
  bookmarkList = bookmarkList.filter(element => element.rating >= store.filter);
  const bookmarks = bookmarkList.map((bookmark) => generateBookmarkElement(bookmark));
  return bookmarks.join('');
};

const renderData = function() {
  renderError();
  if (store.adding){
    $('.js-main-space').html(`
      <form id="newBookmarkForm" class="newBookmarkForm" name="newBookmarkForm">
        <label class="newBookmarkURLInput" for="newBookmarkURL">Add New Bookmark: </label>
        <input class="newBookmarkURLInput" type="url" name="newBookmarkURL" id="newBookmarkURL" placeholder="http://www.wikipedia.org" oninvalid="alert('Please enter a valid URL. Do not forget the https protocol!');" required/>
        <label for="newBookmarkName" name="newBookmarkName">Title Your Bookmark:</label>
        <input class="newBookmarkNameInput" type= "text" name="newBookmarkName" id="newBookmarkName" placeholder="Wikipedia Homepage" oninvalid="alert('Please enter a title!');" required/>
        <span class="starRating">
            <input id="rating5" type="radio" name="rating" value="5" oninvalid="alert('Please select a rating!');" required>
            <label for="rating5">5</label>
            <input id="rating4" type="radio" name="rating" value="4" required>
            <label for="rating4">4</label>
            <input id="rating3" type="radio" name="rating" value="3" required>
            <label for="rating3">3</label>
            <input id="rating2" type="radio" name="rating" value="2" required>
            <label for="rating2">2</label>
            <input id="rating1" type="radio" name="rating" value="1" required>
            <label for="rating1">1</label>
          </span>
        <textarea rows = 10 class = "descriptionTextArea" name="description" placeholder="Description" oninvalid="alert('Please enter a description!');" required></textarea>
        <input type="submit" class ="descriptionSubmit" name="description" required>
      </form>
    `);
  } else {
    let bookmarkContainerHTML = generateBookmarkList(store.bookmarks);
    $('.js-main-space').html(`
      <div class=buttonContainer>
        <form id="js-new-filter-form">
          <button type="submit" class="newBookmark initialButton">Add New</button>
        </form>
        <label for="dropdownContent" class= "initialButton"></label>
        <select id="dropdownContent" class="dropdownContent initialButton">
          <option id="dropdownOption" value="-1">Filter By:</option>
          <option id="dropdownOption" value="0">Show All</option>
          <option id="dropdownOption" value="5">Five Stars</option>
          <option id="dropdownOption" value="4">Four or more Stars </option>
          <option id="dropdownOption" value="3">Three or more Stars</option>
          <option id="dropdownOption" value="2">Two or more Stars</option>
          <option id="dropdownOption" value="1">One or more Stars</option>
        </select>
      </div>
      <div class="bookmarksContainer">
        ${bookmarkContainerHTML}
      </div>
    `
    );
  }
};

const renderError = function(str) {
  if (store.error){
    $('.js-error-space').html(`
      <p id="myPopup">ERROR: ${str}</p>
    `);
  } else {
    $('.js-error-space').empty();
  }
};

const handleFilter = function(){
  $('.js-main-space').on('change', '#dropdownContent',function() {
    let filterValue = $('#dropdownContent').val();
    store.filter = filterValue;
    renderData();
  });
};

const handleExpand = function(){
  $('.js-main-space').on('click', '.bookmarkContainer', function() {
    let id = $(this).data('bookmark-id');
    let temp = store.findById(id);
    if(typeof(temp) !== 'undefined'){
      if (temp.expanded !== true){
        storeContract();
        temp.expanded = true;
        store.expanded = true;
      } else {
        temp.expanded = false;
        store.expanded = false;
      }
    }
    renderData();
  });
};

const newBookmarkClick = function(){
  $('.js-main-space').on('click', '#js-new-filter-form', function(event){
    event.preventDefault();
    store.adding = true;
    renderData();
  });
};

const syncStoreWithAPI = function(){
  api.getBookmarks()
    .then(res => {
      store.bookmarks = res;
      store.bookmarks.forEach( function(bookmark){
        bookmark.expanded = false;
      });
      renderData();
    })
    .catch(error => {
      store.error = true;
      renderError(error.message);
    });
};

const storeContract = function(){
  if (store.expanded){
    store.bookmarks.forEach( function(bookmark){
      bookmark.expanded = false;
      store.expanded = false;
    });
  }
  renderData();
};

syncStoreWithAPI();
newBookmarkClick();
handleNewBookmark();
deleteBookmark();
handleExpand();
handleFilter();