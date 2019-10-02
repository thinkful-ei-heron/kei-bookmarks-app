import store from './store.js';
import api from './api.js';

const createBookmarkObjectFromForm = function() {
  let formData = new FormData(document.getElementById('new-bookmark-form'));
  let bookmarkObject = {
    title: formData.get('new-bookmark-name'),
    rating: formData.get('rating'),
    url: formData.get('new-bookmark-url'),
    desc: formData.get('description'),
  };
  return bookmarkObject;
};

const createUpdateObjectFromForm = function() {
  let formData = new FormData(document.getElementById('editBookmarkForm'));
  let bookmarkObject = {
    rating: formData.get('rating'),
    desc: formData.get('description'),
  };
  return bookmarkObject;
};

const starRatingHTML = function(rating){
  let htmlString = '';
  for (let i = 0; i < rating; i++){
    htmlString += '<span class="fa fa-star checked"></span>';
  }
  for (let j = 0; j < (5 - rating); j++){
    htmlString += '<span class="fa fa-star"></span>';
  }
  return htmlString;
};

const generateBookmarkHTML = function(bookmark){
  if(bookmark.expanded){
    return `
    <div class="bookmarkContainer" data-bookmark-url= ${bookmark.url} data-bookmark-id= ${bookmark.id}>
      <p class="single-bookmark-container"><span class="bookmarkName">${bookmark.title}</span><span class="bookmarkRating">${starRatingHTML(bookmark.rating)} </span></p>
      <div class="bookmarkExpanded">
        <a class="visitLink" href = '${bookmark.url}'><button class="visitButton">Visit Site!</button></a>
      </div>
      <div class="descriptionExpanded">
        <p>${bookmark.desc}</p>
      </div>
      <button class="editButton" id="editButton">Edit Bookmark</button>
      <button class="deleteButton">Delete Bookmark</button>
    </div>
    `;
  } else {
    return `
    <div class="bookmarkContainer" data-bookmark-url = ${bookmark.url} data-bookmark-id = ${bookmark.id}>
      <p class="single-bookmark-container"><span class="bookmarkName">${bookmark.title}</span><span class="bookmarkRating">${starRatingHTML(bookmark.rating)}</span></p>
    </div> `;
  }
};

const generateBookmarkList = function(bookmarkList){
  bookmarkList = bookmarkList.filter(element => element.rating >= store.filter);
  const bookmarks = bookmarkList.map((bookmark) => generateBookmarkHTML(bookmark));
  return bookmarks.join('');
};

const ratingAndDescHTML = function(desc='', typeOfPost){
  return `
  <label class="starRating"><b>Rating:</b>
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
  </label>
  <textarea rows = 10 class = "descriptionTextArea" name="description" placeholder="Description" oninvalid="alert('Please enter a description!');" required>${desc}</textarea>
  <input type="submit" class ="descriptionSubmit" name="description" value="${typeOfPost} Bookmark" required>`;
};

const addBookmarkFormHTML = function(edit = false, id){
  if (edit){
    let temp = store.findById(id);
    $('.js-main-space').html(`
    <form id="editBookmarkForm" class="editBookmarkForm" name="editBookmarkForm">
      <h2 class="sub-title">${temp.title}</h2>
      <h2 class="sub-title">${temp.url}</h2>
      ${ratingAndDescHTML(temp.desc, 'Edit')}
    </form>
    <input type="submit" class="cancelSubmit" name="cancelSubmit" value="Return to Home">
    `);
  } else {
    $('.js-main-space').html(`
    <form id="new-bookmark-form" class="new-bookmark-form" name="new-bookmark-form">
      <label class="new-bookmark-url-input" for="new-bookmark-url">Add New Bookmark: </label>
      <input class="new-bookmark-url-input" type="url" name="new-bookmark-url" id="new-bookmark-url" placeholder="http://www.wikipedia.org" oninvalid="alert('Please enter a valid URL. Do not forget the https protocol!');" required/>
      <label for="new-bookmark-name" name="new-bookmark-name">Title Your Bookmark:</label>
      <input class="newBookmarkNameInput" type= "text" name="new-bookmark-name" id="new-bookmark-name" placeholder="Wikipedia Homepage" oninvalid="alert('Please enter a title!');" required/>
      ${ratingAndDescHTML('', 'Add')}
    </form>
    <input type="submit" class="cancelSubmit" name="cancelSubmit" value="Return to Home">
    `);
  }
};

const addButtonAndBookmarksHTML = function() {
  let bookmarkContainerHTML = generateBookmarkList(store.bookmarks);
  $('.js-main-space').html(`
    <div class=button-container>
      <form id="js-new-filter-form">
        <button type="submit" class="new-bookmark initial-button">Add New</button>
      </form>
      <select id="dropdown-content" class="dropdown-content initial-button">
        <option value="0">Show All</option>
        <option value="5">Five Stars</option>
        <option value="4">Four or more Stars</option>
        <option value="3">Three or more Stars</option>
        <option value="2">Two or more Stars</option>
      </select>
    </div>
    <div class="bookmarks-container">
      ${bookmarkContainerHTML}
    </div>
  `
  );
};

const renderData = function(filter = false, edit = false, id) {
  renderError();
  if (store.adding){
    if (edit){
      addBookmarkFormHTML(true, id);
    } else {
      addBookmarkFormHTML();
    }
  } else {
    if (filter){
      let bookmarkContainerHTML = generateBookmarkList(store.bookmarks);
      $('.bookmarks-container').html(bookmarkContainerHTML);
    } else {
      addButtonAndBookmarksHTML();
    }
  }
};

const renderError = function(str) {
  if (store.error){
    $('.js-error-space').html(`
      <p class="my-popup" id="my-popup">ERROR: ${str}</p>
    `);
  } else {
    $('.js-error-space').empty();
  }
};

const storeContract = function(){
  if (store.expanded){
    store.bookmarks.forEach( function(bookmark){
      bookmark.expanded = false;
      store.expanded = false;
    });
  }
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

const handleAddingMenu = function(){
  $('.js-main-space').on('click', '#js-new-filter-form', function(event){
    event.preventDefault();
    store.adding = true;
    renderData();
  });
};

const handleCancelAdd = function() {
  $('.js-main-space').on('click', '.cancelSubmit', function(event){
    event.preventDefault();
    store.adding = false;
    renderData();
  });
};

const handleNewBookmark = function(){
  $('.js-main-space').on('submit', '.new-bookmark-form', function(event){
    event.preventDefault();
    store.adding = false;
    storeContract();
    store.expanded = false;
    let bookmarkObject = createBookmarkObjectFromForm();
    api.createBookmark(bookmarkObject)
      .then(newBookmark => {
        newBookmark.expanded = false;
        store.addBookmark(newBookmark);
        renderData();
      })
      .catch(error => {
        store.error = true;
        renderError(error.message);
      });
  });
};

const handleDeleteBookmark = function(){
  $('.js-main-space').on('click', '.deleteButton', function(event){
    event.preventDefault();
    let obj = $(this).closest('.bookmarkContainer');
    let id = obj.data('bookmark-id');
    if (typeof(store.findById(id)) !== 'undefined'){
      store.deleteBookmark(id);
      api.deleteBookmark(id)
        .then(function() {
          renderData(store.filter>0);
        })
        .catch(error => {
          store.error = true;
          renderError(error.message);
        });
    }
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
    renderData(store.filter>0, true, id);
  });
};

const handleFilter = function(){
  $('.js-main-space').on('change', '#dropdown-content',function() {
    let filterValue = $('#dropdown-content').val();
    store.filter = filterValue;
    storeContract();
    store.expanded = false;
    renderData(store.filter>0);
  });
};

const handleEdit = function(){
  let id;
  $('.js-main-space').on('click', '.editButton', function(event) {
    event.preventDefault();
    let obj = $(this).closest('.bookmarkContainer');
    id = obj.data('bookmark-id');
    store.adding = true;
    store.edit = true;
    renderData(store.filter>0, store.edit, id);
    handlePostEdit(id); 
    store.edit = false; 
  });
};

const handlePostEdit = function(id) {
  $('.js-main-space').on('submit', '#editBookmarkForm', function(){
    event.preventDefault();
    store.adding = false;
    storeContract();
    store.expanded = false;
    let bookmarkObject = createUpdateObjectFromForm();
    store.updateBookmark(id, bookmarkObject);
    api.updateBookmark(id, bookmarkObject)
      .then(function () {
        renderData();
      })
      .catch(error => {
        store.error = true;
        renderError(error.message);
      });
  });
};

const bindEventListeners = function(){
  handleAddingMenu();
  handleNewBookmark();
  handleDeleteBookmark();
  handleExpand();
  handleFilter();
  handleEdit();
  handleCancelAdd();
};


export default {
  syncStoreWithAPI,
  bindEventListeners,
};